/**
 * Seam — "Ask this page". Black box at the route: JSON in, JSON out, with the answering engine
 * injected so no test needs a key or a network. The cached-demo rule gets its own tests: each trio
 * page answers its three suggested questions with the model wired to throw if it is ever called.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { POST } from "@/app/api/ask/route";
import {
  MAX_QUESTION_CHARS,
  buildAskPrompt,
  createPageQuoteAnswerer,
  defaultAskLlm,
  setAskDepsForTests
} from "@/lib/ask";
import type { AskInput, AskLlm, AskResponse } from "@/lib/ask";
import {
  CACHED_ANSWER_PAGES,
  GENERIC_QUESTIONS,
  SUGGESTED_COUNT,
  findCachedAnswer,
  suggestedQuestionsFor
} from "@/lib/ask-cache";
import { TransformFailure } from "@/lib/errors";

const PAGE_TEXT =
  "You must file Form 1040 by April 15. Bring a photo ID and your Social Security card to the office. " +
  "The fee is $75 and it cannot be waived. Staff can read the form aloud to you if you ask.";

async function postAsk(body: unknown): Promise<{ status: number; payload: AskResponse }> {
  const response = await POST(
    new Request("http://localhost/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
  );
  return { status: response.status, payload: (await response.json()) as AskResponse };
}

/** An answering engine that records what the Ask step handed it. */
function recordingLlm(respond: (input: AskInput) => string): { llm: AskLlm; calls: AskInput[] } {
  const calls: AskInput[] = [];
  return {
    calls,
    llm: {
      name: "recording",
      source: "model",
      async answer(input) {
        calls.push(input);
        return respond(input);
      }
    }
  };
}

/** An engine that must never run: how a cache hit proves it needed no model. */
const forbiddenLlm: AskLlm = {
  name: "forbidden",
  source: "model",
  async answer() {
    throw new Error("a cached answer must not call the model");
  }
};

afterEach(() => {
  setAskDepsForTests(null);
});

test("a question about a live page is answered from that page, and says where the answer came from", async () => {
  const { llm, calls } = recordingLlm(
    () => "You must file Form 1040 by April 15.\n- Bring a photo ID.\n- Bring your Social Security card."
  );
  setAskDepsForTests({ llm });

  const { status, payload } = await postAsk({
    question: "What do I have to bring?",
    rawText: PAGE_TEXT,
    title: "Filing your form"
  });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.source, "model");
  assert.match(payload.answer, /Form 1040/);
  assert.match(payload.answer, /^- Bring a photo ID\.$/m);

  // The boundary got the reader's question and the page's own text — nothing else to answer from.
  assert.equal(calls.length, 1);
  assert.equal(calls[0].question, "What do I have to bring?");
  assert.equal(calls[0].title, "Filing your form");
  assert.match(calls[0].text, /Social Security card/);
});

test("every cached page answers all three of its suggested questions with no model at all", async () => {
  setAskDepsForTests({ llm: forbiddenLlm });

  for (const page of CACHED_ANSWER_PAGES) {
    const suggested = suggestedQuestionsFor({ url: page.url });
    assert.equal(suggested.length, SUGGESTED_COUNT, `${page.slug} should suggest three questions`);

    for (const question of suggested) {
      // By URL, the way the UI names a Cached page…
      const byUrl = await postAsk({ question, url: page.url, rawText: PAGE_TEXT });
      assert.equal(byUrl.status, 200);
      assert.ok(!("error" in byUrl.payload), `${page.slug}: ${JSON.stringify(byUrl.payload)}`);
      assert.equal(byUrl.payload.source, "cache");
      assert.ok(byUrl.payload.answer.trim().length > 0);

      // …and by slug, with no page text at all, since a cached answer needs no context.
      const bySlug = await postAsk({ question, slug: page.slug });
      assert.ok(!("error" in bySlug.payload), `${page.slug}: ${JSON.stringify(bySlug.payload)}`);
      assert.equal(bySlug.payload.source, "cache");
      assert.equal(bySlug.payload.answer, byUrl.payload.answer);
    }
  }
});

test("a cached question still matches through case, punctuation and word order", async () => {
  setAskDepsForTests({ llm: forbiddenLlm });
  const page = CACHED_ANSWER_PAGES[0];
  const original = page.answers[0].question;
  const shouted = `${original.replace(/[?.]/g, "").toUpperCase()}???`;
  const reordered = original.replace(/[?.]/g, "").split(" ").reverse().join(" ");

  for (const question of [shouted, reordered]) {
    const { payload } = await postAsk({ question, url: page.url });
    assert.ok(!("error" in payload), `"${question}" should hit the cache: ${JSON.stringify(payload)}`);
    assert.equal(payload.source, "cache");
    assert.equal(payload.answer, page.answers[0].answer);
  }
});

test("a page that is not cached gets the generic suggested questions, and answers them live", async () => {
  const { llm, calls } = recordingLlm(() => "The page is about filing one form.");
  setAskDepsForTests({ llm });

  const suggested = suggestedQuestionsFor({ url: "https://example.com/some/other/page" });
  assert.deepEqual(suggested, GENERIC_QUESTIONS);
  assert.equal(suggested.length, SUGGESTED_COUNT);
  assert.equal(suggestedQuestionsFor({}).length, SUGGESTED_COUNT);

  const { payload } = await postAsk({
    question: suggested[0],
    url: "https://example.com/some/other/page",
    rawText: PAGE_TEXT
  });

  assert.ok(!("error" in payload));
  assert.equal(payload.source, "model");
  assert.equal(calls.length, 1, "an uncached page goes to the answering engine");
});

test("each cached answer belongs to its own page: every number in it is on that page", () => {
  for (const page of CACHED_ANSWER_PAGES) {
    const cleaned = readFileSync(`fixtures/${page.slug}/cleaned.txt`, "utf8").replace(/,/g, "");
    assert.equal(page.answers.length, SUGGESTED_COUNT, `${page.slug} should ship three answers`);

    for (const qa of page.answers) {
      assert.ok(findCachedAnswer({ slug: page.slug }, qa.question), `${page.slug}: ${qa.question}`);

      for (const number of qa.answer.replace(/,/g, "").match(/\d+/g) ?? []) {
        assert.ok(
          cleaned.includes(number),
          `${page.slug}: "${number}" is not in the page, so the answer is not grounded in it`
        );
      }
    }
  }
});

test("the prompt forbids outside knowledge and carries the page, the title and the question", () => {
  const prompt = buildAskPrompt({
    question: "Do I need a Social Security number?",
    text: PAGE_TEXT,
    title: "Filing your form"
  });

  assert.match(prompt, /ONLY the page text/);
  assert.match(prompt, /never add outside knowledge/i);
  assert.match(prompt, /Do I need a Social Security number\?/);
  assert.match(prompt, /Filing your form/);
  assert.match(prompt, /April 15/);
});

test("with no key configured the answering engine is the keyless page-quote one", () => {
  const priorMode = process.env.READEASY_LLM_MODE;
  const priorKey = process.env.OPENROUTER_API_KEY;
  process.env.READEASY_LLM_MODE = "stub";
  delete process.env.OPENROUTER_API_KEY;

  try {
    const llm = defaultAskLlm();
    assert.equal(llm.name, "page-quote");
    assert.equal(llm.source, "page");
  } finally {
    if (priorMode === undefined) delete process.env.READEASY_LLM_MODE;
    else process.env.READEASY_LLM_MODE = priorMode;
    if (priorKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = priorKey;
  }
});

test("the keyless path can only quote the page, so it cannot invent a fact", async () => {
  const llm = createPageQuoteAnswerer();
  const answer = await llm.answer({ question: "How much is the fee?", text: PAGE_TEXT });

  for (const line of answer.split("\n")) {
    assert.ok(line.startsWith("- "), `expected quoted lines, got ${JSON.stringify(line)}`);
    assert.ok(PAGE_TEXT.includes(line.slice(2)), `"${line}" is not a sentence from the page`);
  }
  assert.match(answer, /\$75/);

  const missing = await llm.answer({ question: "Where do I park my bicycle?", text: PAGE_TEXT });
  assert.match(missing, /does not seem to answer/);
});

test("a body that is not JSON is refused with the error contract, not a crash", async () => {
  const response = await POST(
    new Request("http://localhost/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json at all"
    })
  );
  const payload = (await response.json()) as AskResponse;

  assert.equal(response.status, 400);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "invalid_request");
  assert.ok(payload.error.hint.length > 0);
});

test("an empty, over-long, or context-free question each gets its own plain refusal", async () => {
  setAskDepsForTests({ llm: forbiddenLlm });

  const empty = await postAsk({ question: "   ", rawText: PAGE_TEXT });
  assert.equal(empty.status, 400);
  assert.ok("error" in empty.payload);
  assert.equal(empty.payload.error.code, "empty_question");

  const long = await postAsk({ question: "a".repeat(MAX_QUESTION_CHARS + 1), rawText: PAGE_TEXT });
  assert.equal(long.status, 400);
  assert.ok("error" in long.payload);
  assert.equal(long.payload.error.code, "question_too_long");

  // No page text and no cached page: there is nothing to ground an answer in.
  const bare = await postAsk({ question: "What do I have to do?" });
  assert.equal(bare.status, 400);
  assert.ok("error" in bare.payload);
  assert.equal(bare.payload.error.code, "missing_context");
});

test("an answering engine that throws is reported as a failed answer, not a 500", async () => {
  setAskDepsForTests({
    llm: {
      name: "broken",
      source: "model",
      async answer() {
        throw new Error("socket hang up");
      }
    }
  });

  const { status, payload } = await postAsk({ question: "What is the fee?", rawText: PAGE_TEXT });

  assert.notEqual(status, 500);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "ask_failed");
  assert.ok(payload.error.hint.length > 0);
});

test("an engine's own failure keeps its code, so a reader is told what actually went wrong", async () => {
  setAskDepsForTests({
    llm: {
      name: "rate-limited",
      source: "model",
      async answer() {
        throw new TransformFailure({
          code: "ask_rate_limited",
          message: "The answering service is rate limiting ReadEasy right now.",
          hint: "Wait a few seconds and ask again."
        });
      }
    }
  });

  const { status, payload } = await postAsk({ question: "What is the fee?", rawText: PAGE_TEXT });

  assert.notEqual(status, 500);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "ask_rate_limited");
});

test("an answer that comes back blank is an error, not an empty answer card", async () => {
  const { llm } = recordingLlm(() => "   \n  \n");
  setAskDepsForTests({ llm });

  const { status, payload } = await postAsk({ question: "What is the fee?", rawText: PAGE_TEXT });

  assert.notEqual(status, 500);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "ask_empty");
});
