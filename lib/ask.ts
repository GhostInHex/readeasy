import { findCachedAnswer } from "@/lib/ask-cache";
import { TransformFailure } from "@/lib/errors";
import { DEFAULT_MODEL } from "@/lib/llm/openrouter";
import { splitSentences } from "@/lib/microcards";
import { truncateForModel } from "@/lib/restructure";
import type { TransformError } from "@/lib/types";

/**
 * "Ask this page": one short answer to one question, built only from the page a reader has open.
 *
 * There are three answering paths, tried in this order:
 *   1. the bundled cache — a Demo trio page's suggested questions, with no model and no network;
 *   2. the model, grounded in that page's cleaned text (the enhancement path, needs a key);
 *   3. the page itself, quoted, when no key is configured at all.
 *
 * None of the three may add a fact the page does not carry. The model is told so in the prompt; the
 * other two cannot, because they only copy. Every failure is a TransformFailure, so the route always
 * answers with `{answer, source}` or the Transform error contract.
 */

/** Where an answer came from, so the panel can tell the reader plainly. */
export type AskSource = "cache" | "model" | "page";

export interface AskRequest {
  question?: string;
  /** Cached page slug, when the caller already knows it. */
  slug?: string;
  /** The transformed page's URL — how the UI names a Cached page. */
  url?: string;
  /** The page's cleaned text: the only material a live answer may be built from. */
  rawText?: string;
  /** The page's title, for context. Raw-text transforms often have none. */
  title?: string;
}

export interface AskSuccess {
  answer: string;
  source: AskSource;
}

export type AskResponse = AskSuccess | TransformError;

export interface AskInput {
  question: string;
  /** Cleaned page text, already capped at the model's ceiling. */
  text: string;
  title?: string;
}

/**
 * The answering boundary. An implementation returns the answer text and nothing else; tidying,
 * validation and the error contract live above it, so a test can stub an engine with no key.
 */
export interface AskLlm {
  readonly name: string;
  /** How this engine's answers should be described to a reader. */
  readonly source: Exclude<AskSource, "cache">;
  answer(input: AskInput): Promise<string>;
}

export interface AskDeps {
  llm: AskLlm;
}

/** A question longer than this is a paragraph. The question box stops typing at the same number. */
export const MAX_QUESTION_CHARS = 300;

/** Below this there is not enough page to ground an answer in. Same floor as a raw-text transform. */
export const MIN_CONTEXT_CHARS = 40;

/** An answer is meant to be read in one breath, so a model that rambles gets trimmed. */
export const MAX_ANSWER_CHARS = 1200;

export const ASK_SYSTEM_PROMPT = `You are the question step of ReadEasy, an accessibility reader. A reader has one page open and asks you about it. You answer only from that page's own words: you quote them and put them in plainer language. You are never an author — if the page does not say something, you do not say it either.`;

export function buildAskPrompt(input: AskInput): string {
  return `A reader asked this question about the page below.

Question: ${input.question}

Rules you must follow:
- Answer using ONLY the page text. Never add outside knowledge, never guess, never fill a gap.
- If the page does not answer the question, say so in one sentence, and say what the page does cover.
- Keep it short: at most four sentences. When the page's answer is a list, use up to six lines that each start with "- ".
- Write in plain language at roughly a US grade 5 reading level: short sentences, everyday words, active voice.
- Copy numbers, dates, amounts and names exactly as the page writes them.
- Do not soften or exaggerate requirements. If the page says "must", keep it a must.
- Use person-first, neutral language. No pity, no labels, no praise, no encouragement, no marketing tone.
- Answer with the answer itself. No preamble, no heading, no markdown except the "- " list lines.

${input.title ? `Page title: ${input.title}\n\n` : ""}Page text:
"""
${input.text}
"""`;
}

const ASK_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const ASK_TIMEOUT_MS = 30_000;

interface ChatCompletion {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/**
 * The model path. Same service and the same failure vocabulary as the Restructure client, with its
 * own prompt and its own error codes so a reader can tell "the answering step failed" from "the
 * rewriting step failed". A cached page never reaches this function.
 */
export function createOpenRouterAnswerer(options: { apiKey: string; model?: string; appUrl?: string }): AskLlm {
  const model = options.model?.trim() || DEFAULT_MODEL;

  return {
    name: `openrouter:${model}`,
    source: "model",
    async answer(input: AskInput): Promise<string> {
      let response: Response;
      try {
        response = await fetch(ASK_ENDPOINT, {
          method: "POST",
          headers: {
            authorization: `Bearer ${options.apiKey}`,
            "content-type": "application/json",
            ...(options.appUrl ? { "http-referer": options.appUrl } : {}),
            "x-title": "ReadEasy"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: ASK_SYSTEM_PROMPT },
              { role: "user", content: buildAskPrompt(input) }
            ],
            temperature: 0.1,
            max_tokens: 600
          }),
          signal: AbortSignal.timeout(ASK_TIMEOUT_MS)
        });
      } catch (error) {
        const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
        throw new TransformFailure({
          code: timedOut ? "ask_timeout" : "ask_unreachable",
          message: timedOut
            ? "Answering that question took too long."
            : "ReadEasy could not reach the answering service.",
          hint: "Ask again in a moment, or pick one of the suggested questions."
        });
      }

      return readAnswer(response);
    }
  };
}

/** HTTP status and payload, mapped onto the error contract a reader can act on. */
async function readAnswer(response: Response): Promise<string> {
  if (response.status === 401 || response.status === 403) {
    throw new TransformFailure({
      code: "ask_unauthorized",
      message: "The answering service rejected ReadEasy's credentials.",
      hint: "Check that OPENROUTER_API_KEY is set correctly for this deployment."
    });
  }

  if (response.status === 429) {
    throw new TransformFailure({
      code: "ask_rate_limited",
      message: "The answering service is rate limiting ReadEasy right now.",
      hint: "Wait a few seconds and ask again."
    });
  }

  if (!response.ok) {
    throw new TransformFailure({
      code: "ask_failed",
      message: `The answering service returned an error (HTTP ${response.status}).`,
      hint: "Ask again in a moment, or pick one of the suggested questions."
    });
  }

  let payload: ChatCompletion;
  try {
    payload = (await response.json()) as ChatCompletion;
  } catch {
    throw new TransformFailure({
      code: "ask_failed",
      message: "The answering service sent a response ReadEasy could not read.",
      hint: "Ask again in a moment, or pick one of the suggested questions."
    });
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new TransformFailure({
      code: "ask_empty",
      message: payload.error?.message
        ? `The answering service reported: ${payload.error.message}`
        : "The answer came back empty for this question.",
      hint: "Try asking it in fewer words, or pick one of the suggested questions."
    });
  }

  return content;
}

/**
 * The glue words every question contains. Not a linguistic stopword list — just the words that would
 * otherwise make every sentence on the page look like a match.
 */
const STOPWORDS = new Set([
  "and", "any", "are", "but", "can", "did", "does", "for", "from", "has", "have", "how", "its", "may",
  "not", "now", "the", "their", "them", "there", "these", "this", "those", "was", "were", "what",
  "when", "where", "which", "who", "whom", "why", "will", "with", "you", "your"
]);

/** Three quoted sentences at most, and about a paragraph of them: a quote is not a wall of text. */
const QUOTE_LINES = 3;
const QUOTE_CHARS = 600;

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * The keyless path: no model, so the page answers in its own words. Sentences are ranked by how many
 * of the question's words they carry, then returned verbatim — which cannot invent a fact, because
 * nothing is rewritten. Same bargain as the Restructure stub: the app still works with no key.
 */
export function createPageQuoteAnswerer(): AskLlm {
  return {
    name: "page-quote",
    source: "page",
    async answer(input: AskInput): Promise<string> {
      const asked = new Set(contentWords(input.question));
      const scored = splitSentences(input.text)
        .map((sentence, index) => ({
          sentence: sentence.trim(),
          index,
          hits: new Set(contentWords(sentence).filter((word) => asked.has(word))).size
        }))
        .filter((entry) => entry.hits > 0 && entry.sentence.length > 0);

      if (!scored.length) {
        return "This page does not seem to answer that question. One of the suggested questions may be closer to what it covers.";
      }

      // Strongest matches first, then back into page order, so the quotes read the way the page reads.
      const best = scored.sort((a, b) => b.hits - a.hits || a.index - b.index).slice(0, QUOTE_LINES);
      const lines: string[] = [];
      let used = 0;

      for (const entry of best.sort((a, b) => a.index - b.index)) {
        if (lines.length && used + entry.sentence.length > QUOTE_CHARS) {
          continue;
        }
        lines.push(`- ${entry.sentence}`);
        used += entry.sentence.length;
      }

      return lines.join("\n");
    }
  };
}

let overrides: Partial<AskDeps> | null = null;

/**
 * Chooses the answering engine: OpenRouter when a key is configured, otherwise the page-quote
 * answerer, so asking still works with no key (and so tests never need one). The same
 * `READEASY_LLM_MODE=stub` switch the Restructure step honours applies here too.
 */
export function defaultAskLlm(): AskLlm {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (process.env.READEASY_LLM_MODE === "stub" || !apiKey) {
    return createPageQuoteAnswerer();
  }

  return createOpenRouterAnswerer({
    apiKey,
    model: process.env.OPENROUTER_MODEL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
  });
}

export function resolveAskDeps(): AskDeps {
  return {
    llm: defaultAskLlm(),
    ...overrides
  };
}

/** Test seam: swap the answering engine without a network or a key. */
export function setAskDepsForTests(next: Partial<AskDeps> | null): void {
  overrides = next;
}

/** Structure only: keep the lines and the "- " markers, drop the model's decoration. */
function tidyAnswer(raw: string): string {
  const text = raw
    .replace(/\r\n?/g, "\n")
    .replace(/\*\*/g, "")
    .split("\n")
    .map((line) => line.trim().replace(/^[*•]\s+/, "- "))
    .filter(Boolean)
    .join("\n")
    .trim();

  return text.length > MAX_ANSWER_CHARS ? `${text.slice(0, MAX_ANSWER_CHARS).trimEnd()}…` : text;
}

async function callAnswerer(llm: AskLlm, input: AskInput): Promise<string> {
  try {
    return await llm.answer(input);
  } catch (error) {
    if (error instanceof TransformFailure) throw error;
    throw new TransformFailure({
      code: "ask_failed",
      message: "ReadEasy could not answer that question about this page.",
      hint: "Ask again in a moment, or pick one of the suggested questions."
    });
  }
}

/**
 * Answer one question about one page. The cache is checked first and short-circuits everything else,
 * which is what makes the demo independent of a key: a trio page's suggested questions never reach
 * `deps.llm`. Anything else needs the page's cleaned text supplied by the caller — this step never
 * fetches, so it can only ever answer from text the reader is already looking at.
 */
export async function runAsk(request: AskRequest, deps: AskDeps): Promise<AskSuccess> {
  const question = request.question?.trim() ?? "";

  if (!question) {
    throw new TransformFailure({
      code: "empty_question",
      message: "Type a question about this page first.",
      hint: "Or pick one of the suggested questions.",
      status: 400
    });
  }

  if (question.length > MAX_QUESTION_CHARS) {
    throw new TransformFailure({
      code: "question_too_long",
      message: "That question is longer than ReadEasy can work with.",
      hint: `Ask it in ${MAX_QUESTION_CHARS} characters or fewer, one question at a time.`,
      status: 400
    });
  }

  const cached = findCachedAnswer({ slug: request.slug, url: request.url }, question);
  if (cached) {
    return { answer: cached.answer, source: "cache" };
  }

  const text = request.rawText?.trim() ?? "";
  if (text.length < MIN_CONTEXT_CHARS) {
    throw new TransformFailure({
      code: "missing_context",
      message: "ReadEasy needs the page's text before it can answer a question about it.",
      hint: "Transform a page first, then ask about the version on screen.",
      status: 400
    });
  }

  const answer = tidyAnswer(
    await callAnswerer(deps.llm, {
      question,
      text: truncateForModel(text),
      ...(request.title?.trim() ? { title: request.title.trim() } : {})
    })
  );

  if (!answer) {
    throw new TransformFailure({
      code: "ask_empty",
      message: "The answer came back empty for this question.",
      hint: "Try asking it in fewer words, or pick one of the suggested questions."
    });
  }

  return { answer, source: deps.llm.source };
}
