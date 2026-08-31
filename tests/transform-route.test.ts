/**
 * Seam 1 — the transform route. Black box: HTTP request in, JSON out.
 * Fetching and the LLM are injected so nothing here touches the network.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, afterEach, test } from "node:test";
import { POST } from "@/app/api/transform/route";
import { setTransformDepsForTests } from "@/lib/deps";
import { TransformFailure } from "@/lib/errors";
import { createStubLlmClient } from "@/lib/llm/stub";
import type { LlmClient, RestructureInput } from "@/lib/llm/types";
import type { TransformResponse } from "@/lib/types";

const IRS_FIXTURE_HTML = readFileSync("fixtures/irs-eitc/page.html", "utf8");
const IRS_URL =
  "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/who-qualifies-for-the-earned-income-tax-credit-eitc";

const realFetch = globalThis.fetch;

async function postTransform(body: unknown): Promise<{ status: number; payload: TransformResponse }> {
  const response = await POST(
    new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
  );
  return { status: response.status, payload: (await response.json()) as TransformResponse };
}

/** An LlmClient that records what the pipeline asked it to restructure. */
function recordingLlm(respond: (input: RestructureInput) => string): {
  client: LlmClient;
  calls: RestructureInput[];
} {
  const calls: RestructureInput[] = [];
  return {
    calls,
    client: {
      name: "recording",
      async complete(input) {
        calls.push(input);
        return respond(input);
      }
    }
  };
}

afterEach(() => {
  setTransformDepsForTests(null);
  globalThis.fetch = realFetch;
});

after(() => {
  globalThis.fetch = realFetch;
});

test("URL input cleans real page HTML and returns the {cleanedOriginal, restructured} contract", async () => {
  const stub = createStubLlmClient();
  setTransformDepsForTests({ fetchHtml: async () => IRS_FIXTURE_HTML, llm: stub });

  const { status, payload } = await postTransform({ url: IRS_URL });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);

  // Real Readability output: article prose kept, chrome and scripts gone.
  assert.match(payload.cleanedOriginal, /Earned Income Tax Credit/);
  assert.match(payload.cleanedOriginal, /Have earned income/);
  assert.doesNotMatch(payload.cleanedOriginal, /<script|<\/div>|function\s*\(/);
  assert.ok(payload.cleanedOriginal.length > 2000, "cleaned text should carry the page's prose");
  assert.equal(payload.sourceUrl, IRS_URL);

  // Schema: every field a Mode renders from.
  const { restructured } = payload;
  assert.equal(typeof restructured.title, "string");
  assert.ok(restructured.title.length > 0);
  assert.ok(restructured.summary.length > 0);
  assert.ok(restructured.readingTimeMinutes >= 1);
  assert.ok(Array.isArray(restructured.actionItems));
  assert.ok(restructured.sections.length > 0);
  for (const section of restructured.sections) {
    assert.equal(typeof section.heading, "string");
    assert.ok(section.simplifiedText.length > 0);
    assert.equal(typeof section.keyTakeaway, "string");
  }
  for (const item of restructured.actionItems) {
    assert.ok(item.task.length > 0);
    assert.ok(["high", "medium", "low"].includes(item.urgency));
  }
});

test("the IRS page's deadline language survives Cleaning into the action items", async () => {
  setTransformDepsForTests({ fetchHtml: async () => IRS_FIXTURE_HTML, llm: createStubLlmClient() });

  const { payload } = await postTransform({ url: IRS_URL });
  assert.ok(!("error" in payload));

  const tasks = payload.restructured.actionItems.map((item) => item.task.toLowerCase());
  assert.ok(
    tasks.some((task) => /must|file|claim|qualify/.test(task)),
    `expected an obligation in the checklist, got ${JSON.stringify(tasks)}`
  );
});

test("rawText input skips fetching entirely and satisfies the same contract", async () => {
  const { client, calls } = recordingLlm((input) => JSON.stringify({
    title: "Pasted page",
    summary: "Two sentence summary of the pasted text.",
    readingTimeMinutes: 2,
    actionItems: [{ task: "Send the form", urgency: "high", deadline: "April 15" }],
    sections: [{ heading: "One", simplifiedText: input.text.slice(0, 100), keyTakeaway: "Send it in." }]
  }));

  setTransformDepsForTests({
    fetchHtml: async () => {
      throw new Error("fetch must not run on the rawText path");
    },
    llm: client
  });

  const rawText =
    "You must send Form 1040 to the address listed in the instructions by April 15. " +
    "Keep a copy of everything you send, and include your Social Security number on each page.";

  const { status, payload } = await postTransform({ rawText });

  assert.equal(status, 200);
  assert.ok(!("error" in payload));
  assert.match(payload.cleanedOriginal, /Form 1040/);
  assert.equal(payload.sourceUrl, undefined);
  assert.equal(payload.restructured.actionItems[0]?.deadline, "April 15");

  // Proves the injectable LLM boundary: the pipeline handed the cleaned text to the client.
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /Form 1040/);
  assert.equal(calls[0].variant, "default");
});

test("a blocked site returns the structured error with a raw-text hint, not a 500", async () => {
  // Real fetch path, stubbed transport: the site answers 403 like ssa.gov does.
  globalThis.fetch = (async () =>
    new Response("forbidden", { status: 403, headers: { "content-type": "text/html" } })) as typeof fetch;

  const { status, payload } = await postTransform({ url: "https://www.ssa.gov/myaccount/" });

  assert.notEqual(status, 500);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "blocked_by_site");
  assert.match(payload.error.message, /403/);
  assert.match(payload.error.hint, /Raw text/i);
});

test("an unreachable page returns the error contract", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  const { status, payload } = await postTransform({ url: "https://example.invalid/page" });

  assert.notEqual(status, 500);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "fetch_failed");
});

test("malformed Restructure output follows the error contract", async () => {
  const { client } = recordingLlm(() => "I'm afraid I can't do that.");
  setTransformDepsForTests({ fetchHtml: async () => IRS_FIXTURE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: IRS_URL });

  assert.equal(status, 422);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "invalid_restructure");
});

test("malformed JSON triggers exactly one retry, and the retry's answer is used", async () => {
  const good = JSON.stringify({
    title: "Second try",
    summary: "The retry answered with valid JSON.",
    readingTimeMinutes: 3,
    actionItems: [],
    sections: [{ heading: "One", simplifiedText: "Plain text.", keyTakeaway: "It worked." }]
  });

  const { client, calls } = recordingLlm((input) => (input.previousAttempt ? good : "```not json```"));
  setTransformDepsForTests({ fetchHtml: async () => IRS_FIXTURE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: IRS_URL });

  assert.equal(status, 200);
  assert.ok(!("error" in payload));
  assert.equal(payload.restructured.title, "Second try");
  assert.equal(calls.length, 2, "one call plus exactly one retry");
  assert.equal(calls[0].previousAttempt, undefined);
  assert.match(calls[1].previousAttempt ?? "", /not json/);
});

test("malformed JSON twice stops after the single retry and returns the error contract", async () => {
  const { client, calls } = recordingLlm(() => "still not json");
  setTransformDepsForTests({ fetchHtml: async () => IRS_FIXTURE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: IRS_URL });

  assert.equal(status, 422);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "invalid_restructure");
  assert.equal(calls.length, 2, "exactly one retry, then the error contract");
});

test("a failing Restructure service is not retried and reports its own error", async () => {
  let calls = 0;
  setTransformDepsForTests({
    fetchHtml: async () => IRS_FIXTURE_HTML,
    llm: {
      name: "unauthorized",
      async complete() {
        calls += 1;
        throw new TransformFailure({
          code: "restructure_unauthorized",
          message: "The rewriting service rejected ReadEasy's credentials.",
          hint: "Check OPENROUTER_API_KEY."
        });
      }
    }
  });

  const { status, payload } = await postTransform({ url: IRS_URL });

  assert.notEqual(status, 500);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "restructure_unauthorized");
  assert.equal(calls, 1, "credential failures are not retried");
});

test("schema-violating Restructure output follows the error contract", async () => {
  const { client } = recordingLlm(() => JSON.stringify({ title: "No sections here", summary: "Hmm." }));
  setTransformDepsForTests({ fetchHtml: async () => IRS_FIXTURE_HTML, llm: client });

  const { payload } = await postTransform({ url: IRS_URL });

  assert.ok("error" in payload);
  assert.equal(payload.error.code, "invalid_restructure");
});

test("a page with no readable content is an error, not an empty transform", async () => {
  setTransformDepsForTests({
    fetchHtml: async () => "<html><body><nav><a href='/a'>One</a><a href='/b'>Two</a></nav></body></html>",
    llm: createStubLlmClient()
  });

  const { payload } = await postTransform({ url: "https://example.com/hub" });

  assert.ok("error" in payload);
  assert.equal(payload.error.code, "no_readable_content");
});

test("empty input is rejected with the raw-text hint", async () => {
  const { status, payload } = await postTransform({});

  assert.equal(status, 400);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "empty_input");
  assert.match(payload.error.hint, /Raw text/i);
});

test("non-JSON bodies are rejected without crashing", async () => {
  const response = await POST(
    new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json at all"
    })
  );
  const payload = (await response.json()) as TransformResponse;

  assert.equal(response.status, 400);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "invalid_request");
});

test("private and non-http addresses are refused", async () => {
  for (const url of ["http://localhost:3000/admin", "http://192.168.0.1/", "file:///etc/passwd"]) {
    const { status, payload } = await postTransform({ url });
    assert.equal(status, 400, `${url} should be rejected`);
    assert.ok("error" in payload);
    assert.ok(["private_address", "unsupported_protocol", "invalid_url"].includes(payload.error.code));
  }
});
