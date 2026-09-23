import { TransformFailure } from "@/lib/errors";
import { attemptTimeoutMs, runWithFallbacks } from "@/lib/llm/fallback";
import { RETRY_NUDGE, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/llm/prompt";
import type { LlmClient, RestructureInput } from "@/lib/llm/types";

export const DEFAULT_MODEL = "liquid/lfm-2.5-2.6b:free";

/**
 * Tried, in order, when the primary model fails in a way another model could fix —
 * rate limit, outage, timeout, unusable answer. Verified live against the Restructure
 * schema at short + long inputs (2026-09-23). Kept to two fallbacks on purpose: the
 * 55s route budget is split across attempts, so every extra model shortens the time
 * each one gets on a full page.
 */
export const FALLBACK_MODELS = ["cohere/north-mini-code:free", "nex-agi/nex-n2.5-mini:free"];

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 55_000;

interface ChatCompletion {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  error?: { message?: string; code?: number };
}

/**
 * A 200 with no usable content is provider noise — a safety-filter stub
 * ("User Safety: safe"), a truncated stub that is not JSON, or a genuinely
 * empty field. Anything that cannot parse as the Restructure schema moves the
 * chain to the next model instead of failing the page.
 */
function contentIsUsable(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 50) return false;
  if (/^user safety\s*:\s*safe$/i.test(trimmed)) return false;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end <= start) return false;
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    return typeof parsed.title === "string" && Array.isArray(parsed.sections);
  } catch {
    return false;
  }
}

/**
 * Restructure via OpenRouter. The primary model is tried first; the fallback chain covers
 * the failure modes a different model can fix. Returns the model's raw answer; parsing,
 * schema validation, and the single retry all live in `lib/restructure.ts` above this
 * boundary.
 */
export function createOpenRouterClient(options: {
  apiKey: string;
  model?: string;
  fallbackModels?: string[];
  appUrl?: string;
}): LlmClient {
  const models = [
    options.model?.trim() || DEFAULT_MODEL,
    ...(options.fallbackModels?.length ? options.fallbackModels : FALLBACK_MODELS)
  ];
  const perModelTimeout = attemptTimeoutMs(REQUEST_TIMEOUT_MS, models.length);

  return {
    name: `openrouter:${models.join(" + ")}`,
    async complete(input: RestructureInput): Promise<string> {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) }
      ];

      if (input.previousAttempt) {
        messages.push({ role: "assistant", content: input.previousAttempt.slice(0, 4000) });
        messages.push({ role: "user", content: RETRY_NUDGE });
      }

      return runWithFallbacks(
        models.map((model) => () =>
          completeWithModel({
            apiKey: options.apiKey,
            appUrl: options.appUrl,
            model,
            messages,
            timeoutMs: perModelTimeout
          })
        )
      );
    }
  };
}

/** One Restructure call to one model, mapped onto the Transform error contract. */
async function completeWithModel(request: {
  apiKey: string;
  appUrl?: string;
  model: string;
  messages: { role: string; content: string }[];
  timeoutMs: number;
}): Promise<string> {
  const { apiKey, appUrl, model, messages, timeoutMs } = request;

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        ...(appUrl ? { "http-referer": appUrl } : {}),
        "x-title": "ReadEasy"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new TransformFailure({
      code: timedOut ? "restructure_timeout" : "restructure_unreachable",
      message: timedOut
        ? "The rewriting step took too long for this page."
        : "ReadEasy could not reach the rewriting service.",
      hint: "Try Transform again. Long pages are slower — pasting one section at a time is faster."
    });
  }

  if (response.status === 401 || response.status === 403) {
    throw new TransformFailure({
      code: "restructure_unauthorized",
      message: "The rewriting service rejected ReadEasy's credentials.",
      hint: "Check that OPENROUTER_API_KEY is set correctly for this deployment."
    });
  }

  if (response.status === 429) {
    throw new TransformFailure({
      code: "restructure_rate_limited",
      message: "The rewriting service is rate limiting ReadEasy right now.",
      hint: "Wait a few seconds and press Transform again."
    });
  }

  if (!response.ok) {
    throw new TransformFailure({
      code: "restructure_failed",
      message: `The rewriting service returned an error (HTTP ${response.status}).`,
      hint: "Try Transform again in a moment."
    });
  }

  let payload: ChatCompletion;
  try {
    payload = (await response.json()) as ChatCompletion;
  } catch {
    throw new TransformFailure({
      code: "restructure_failed",
      message: "The rewriting service sent a response ReadEasy could not read.",
      hint: "Try Transform again in a moment."
    });
  }

  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new TransformFailure({
      code: "restructure_empty",
      message: payload.error?.message
        ? `The rewriting service reported: ${payload.error.message}`
        : "The rewriting step came back empty for this page.",
      hint: "Try Transform again, or paste a shorter section of the page."
    });
  }

  if (!contentIsUsable(content)) {
    throw new TransformFailure({
      code: "restructure_unusable",
      message: "That model returned an answer ReadEasy could not use for this page.",
      hint: "Try Transform again — ReadEasy moves to the next model automatically."
    });
  }

  return content;
}

