/**
 * Seam 1 — the transform route at both reading levels. Black box: HTTP request in, JSON out.
 *
 * Two rules here are worth more than the rest, so they are proved from outside the pipeline:
 *   - a Demo trio page with a captured variant switches level with no model and no network, because
 *     the recorded demo has to work with no API key;
 *   - only "standard" and "simpler" get through the door, and a refused level never reaches the model.
 *
 * The bundle these tests read is always a temporary directory, never the repo's own `fixtures/`, so
 * capturing a real `simpler.json` later cannot quietly change what any of this proves.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { POST } from "@/app/api/transform/route";
import { setFixtureRootForTests } from "@/lib/cached-transform";
import { setTransformDepsForTests } from "@/lib/deps";
import { CACHED_PAGES, cachedVariantPath, matchCachedPage } from "@/lib/fixtures";
import { buildUserPrompt } from "@/lib/llm/prompt";
import type { LlmClient } from "@/lib/llm/types";
import type { Restructured, TransformResponse } from "@/lib/types";

/** Long enough for Cleaning to keep, short enough to read in a diff. */
const PAGE_HTML = `<html><head><title>Apply for help with your heating bill</title></head><body>
<nav><a href="/home">Home</a><a href="/contact">Contact</a></nav>
<article>
  <h1>Apply for help with your heating bill</h1>
  <p>You must send Form 1040 and a copy of your last three heating bills to the county office by
  April 15. An application that arrives after that date is held until the next program year.</p>
  <p>To be eligible you must have earned income in the tax year, and your household income must be
  below the limit published for your household size. That limit changes every year.</p>
  <p>If you cannot pay the balance you owe, ask the office for a payment plan before the deadline.
  Staff can also answer questions about the form by phone during office hours.</p>
  <p>Keep a copy of everything you send. If the office asks for more documents, you have 30 days to
  send them before your application is closed.</p>
</article></body></html>`;

const PASTED_TEXT =
  "You must send Form 1040 to the county office by April 15, and keep a copy of everything you send.";

/** A page nobody has cached, for the tests that are only about the live path. */
const PLAIN_URL = "https://example.com/heating-help";

const CACHED = CACHED_PAGES[0];

const CACHED_CLEANED_TEXT =
  "You must send Form 1040 and a copy of your last three heating bills to the county office by April 15.";

/** What a live Restructure answers with. Titled so a cache hit can never be mistaken for it. */
const MODEL_ANSWER: Restructured = {
  title: "Written by the model",
  summary: "This page says how to ask for help. It says what you must send.",
  readingTimeMinutes: 2,
  actionItems: [{ task: "Send Form 1040", urgency: "high", deadline: "April 15" }],
  sections: [
    {
      heading: "What to send",
      simplifiedText: "You must send Form 1040. Send your last three heating bills too.",
      keyTakeaway: "Send the form and the bills."
    }
  ]
};

/** What `tools/capture-simpler.mjs` leaves behind, written into the bundle by hand here. */
const CAPTURED_SIMPLER: Restructured = {
  ...MODEL_ANSWER,
  title: "Captured before the demo",
  summary: "This page tells you how to ask for help. It tells you what to send."
};

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

/** An LlmClient that records the prompt the pipeline would have sent, and answers `MODEL_ANSWER`. */
function promptRecorder(): { client: LlmClient; prompts: string[] } {
  const prompts: string[] = [];
  return {
    prompts,
    client: {
      name: "prompt-recorder",
      async complete(input) {
        prompts.push(buildUserPrompt(input));
        return JSON.stringify(MODEL_ANSWER);
      }
    }
  };
}

/** Deps that fail loudly. Anything answered from the bundle must touch neither of them. */
function refuseEverything(): void {
  setTransformDepsForTests({
    fetchHtml: async () => {
      throw new Error("a bundled variant must not fetch the page");
    },
    llm: {
      name: "must-not-run",
      async complete() {
        throw new Error("a bundled variant must not call the model");
      }
    }
  });
}

let bundles: string[] = [];

/** A temporary `fixtures/` root holding exactly the files named, and nothing else. */
function bundle(files: Record<string, string>): void {
  const root = mkdtempSync(path.join(tmpdir(), "readeasy-fixtures-"));
  bundles.push(root);

  for (const [relative, contents] of Object.entries(files)) {
    const target = path.join(root, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents, "utf8");
  }

  setFixtureRootForTests(root);
}

/** A complete capture for the first Demo trio page: the variant plus the cleaned original. */
function bundleCapturedSimpler(): void {
  bundle({
    [cachedVariantPath(CACHED.slug, "simpler")]: JSON.stringify(CAPTURED_SIMPLER),
    [`fixtures/${CACHED.slug}/cleaned.txt`]: `${CACHED_CLEANED_TEXT}\n`
  });
}

afterEach(() => {
  setTransformDepsForTests(null);
  setFixtureRootForTests(null);
  for (const root of bundles) {
    rmSync(root, { recursive: true, force: true });
  }
  bundles = [];
});

test("no level, a null level, and an explicit standard level are the same request", async () => {
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  const bodies = [{ url: PLAIN_URL }, { url: PLAIN_URL, level: null }, { url: PLAIN_URL, level: "standard" }];
  for (const body of bodies) {
    const { status, payload } = await postTransform(body);

    assert.equal(status, 200, `${JSON.stringify(body)} should transform`);
    assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
    assert.equal(payload.level, "standard", "the route echoes back the level it wrote at");
  }

  // The standard prompt is the one ReadEasy has always sent: the level adds nothing to it.
  assert.equal(prompts.length, 3);
  assert.equal(prompts[0], prompts[1]);
  assert.equal(prompts[0], prompts[2]);
  assert.match(prompts[0], /grade 5 reading level/);
  assert.doesNotMatch(prompts[0], /simpler level/i);
  assert.doesNotMatch(prompts[0], /grade 3/);
});

test("the simpler level asks for easier words without dropping any of the page", async () => {
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: PLAIN_URL, level: "simpler" });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.level, "simpler");
  assert.equal(payload.restructured.title, MODEL_ANSWER.title);

  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /asked for the simpler level/);
  assert.match(prompts[0], /grade 3 level/);
  // The rule the whole feature stands on: easier words, never less of the page.
  assert.match(prompts[0], /Keep every requirement, deadline, and amount/);
  // And every rule the levels share is still in force.
  assert.match(prompts[0], /Use ONLY facts/);
  assert.match(prompts[0], /Answer with JSON only/);
  assert.match(prompts[0], /Form 1040/, "the page's own text is what gets rewritten");
});

test("the level is a separate axis from the Mode: ADHD cards can be written simpler too", async () => {
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: PLAIN_URL, variant: "adhd", level: "simpler" });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.level, "simpler");
  assert.match(prompts[0], /micro-cards/, "the Mode still shapes the output");
  assert.match(prompts[0], /grade 3 level/, "and the level still picks the words");
});

test("an unknown reading level is refused with the error contract, and never reaches the model", async () => {
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  for (const level of ["eli5", "SIMPLER", "", "easy", 5, true, {}, ["simpler"]]) {
    const { status, payload } = await postTransform({ url: PLAIN_URL, level });

    assert.equal(status, 400, `level ${JSON.stringify(level)} should be refused`);
    assert.ok("error" in payload, `level ${JSON.stringify(level)} should be refused`);
    assert.equal(payload.error.code, "invalid_level");
    // A refusal a reader can act on: it names both levels rather than the field.
    assert.match(payload.error.hint, /standard/);
    assert.match(payload.error.hint, /simpler/);
  }

  assert.equal(prompts.length, 0, "a refused level must not cost a model call");
});

test("a captured variant answers a cached page with no model and no network", async () => {
  bundleCapturedSimpler();
  refuseEverything();

  const { status, payload } = await postTransform({ url: CACHED.url, level: "simpler" });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.restructured.title, CAPTURED_SIMPLER.title);
  assert.equal(payload.cleanedOriginal, CACHED_CLEANED_TEXT, "trimmed, exactly as captured");
  assert.equal(payload.level, "simpler");
  assert.equal(payload.sourceUrl, CACHED.url);
});

test("the bundle is reached however the reader typed the cached page's address", async () => {
  bundleCapturedSimpler();
  refuseEverything();

  const typedDifferently = `${CACHED.url.replace(/^https:/, "http:")}/?utm_source=demo#top`;
  const { status, payload } = await postTransform({ url: typedDifferently, level: "simpler" });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.restructured.title, CAPTURED_SIMPLER.title);
  // The URL is echoed as the reader gave it; the cached page is still the trio one.
  assert.equal(matchCachedPage(payload.sourceUrl)?.slug, CACHED.slug);
});

test("only the captured level comes from the bundle — standard is still restructured live", async () => {
  bundleCapturedSimpler();
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: CACHED.url });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.level, "standard");
  assert.equal(payload.restructured.title, MODEL_ANSWER.title);
  assert.equal(prompts.length, 1, "no standard.json is captured, so the page is written live");
});

test("a cached page with nothing captured yet falls through to the model", async () => {
  bundle({ [`fixtures/${CACHED.slug}/cleaned.txt`]: `${CACHED_CLEANED_TEXT}\n` });
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  const { status, payload } = await postTransform({ url: CACHED.url, level: "simpler" });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.restructured.title, MODEL_ANSWER.title);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /grade 3 level/, "and the fallback is still the simpler level");
});

test("a half-written or stale capture falls through to the model, not to an error page", async () => {
  const broken: Record<string, string> = {
    "truncated JSON": '{"title": "Half a fi',
    "the wrong shape": JSON.stringify({ title: "No sections here", summary: "Hmm." }),
    "not an object": JSON.stringify(["a card"]),
    "an empty file": ""
  };

  for (const [what, contents] of Object.entries(broken)) {
    bundle({
      [cachedVariantPath(CACHED.slug, "simpler")]: contents,
      [`fixtures/${CACHED.slug}/cleaned.txt`]: `${CACHED_CLEANED_TEXT}\n`
    });
    const { client, prompts } = promptRecorder();
    setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

    const { status, payload } = await postTransform({ url: CACHED.url, level: "simpler" });

    assert.equal(status, 200, `${what} should fall through, not fail the page`);
    assert.ok(!("error" in payload), `${what}: ${JSON.stringify(payload)}`);
    assert.equal(payload.restructured.title, MODEL_ANSWER.title, `${what} should be ignored`);
    assert.equal(prompts.length, 1, `${what} should reach the model`);
  }
});

test("a capture with no cleaned original beside it is not served as half a page", async () => {
  bundle({ [cachedVariantPath(CACHED.slug, "simpler")]: JSON.stringify(CAPTURED_SIMPLER) });
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({ fetchHtml: async () => PAGE_HTML, llm: client });

  const { payload } = await postTransform({ url: CACHED.url, level: "simpler" });

  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.restructured.title, MODEL_ANSWER.title);
  assert.equal(prompts.length, 1, "the split view needs both halves, so this is a miss");
});

test("pasted text is never answered from the bundle, and still honours the level", async () => {
  bundleCapturedSimpler();
  const { client, prompts } = promptRecorder();
  setTransformDepsForTests({
    fetchHtml: async () => {
      throw new Error("fetch must not run on the rawText path");
    },
    llm: client
  });

  // A reader who pastes their own text about a cached page must get their text back, not the capture.
  const { status, payload } = await postTransform({
    url: CACHED.url,
    rawText: PASTED_TEXT,
    level: "simpler"
  });

  assert.equal(status, 200);
  assert.ok(!("error" in payload), `unexpected error: ${JSON.stringify(payload)}`);
  assert.equal(payload.restructured.title, MODEL_ANSWER.title);
  assert.equal(payload.cleanedOriginal, PASTED_TEXT);
  assert.equal(payload.sourceUrl, undefined);
  assert.equal(payload.level, "simpler");
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /grade 3 level/);
});

test("captured variants are found by convention, at fixtures/<slug>/<level>.json", async () => {
  assert.equal(cachedVariantPath("irs-eitc", "simpler"), "fixtures/irs-eitc/simpler.json");
  assert.equal(cachedVariantPath("irs-eitc", "standard"), "fixtures/irs-eitc/standard.json");
  // Nothing registers a variant: index.json is untouched, so a capture is served the moment it lands.
  assert.ok(CACHED.slug.length > 0);
});
