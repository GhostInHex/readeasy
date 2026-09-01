/**
 * Seam 2 — the ADHD Restructure variant: micro-card shaping, key-word emphasis, and the
 * variant-aware validation gate. Seam 1 coverage (the route answering `variant: "adhd"`) lives at
 * the bottom of this file, black box through the route handler.
 */
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { POST } from "@/app/api/transform/route";
import { setTransformDepsForTests } from "@/lib/deps";
import { buildUserPrompt } from "@/lib/llm/prompt";
import { createStubLlmClient } from "@/lib/llm/stub";
import { MAX_CARD_SENTENCES, splitEmphasis, splitSentences, toMicroCards } from "@/lib/microcards";
import { validateRestructured } from "@/lib/schema";
import type { Restructured, Section, TransformResponse } from "@/lib/types";
import { isTransformError } from "@/lib/types";

const THREE_SENTENCES = "You must file a return. The deadline is April 15, 2026. Keep your receipts.";

const VALID: Restructured = {
  title: "Students and employment",
  summary: "This page explains work rules for students. It lists what you must do.",
  readingTimeMinutes: 3,
  actionItems: [],
  sections: [
    { heading: "Work rules", simplifiedText: THREE_SENTENCES, keyTakeaway: "File on time." },
    { heading: "Off campus", simplifiedText: "Ask your school first.", keyTakeaway: "" }
  ]
};

function sentenceCounts(sections: Section[]): number[] {
  return sections.map((section) => splitSentences(section.simplifiedText).length);
}

afterEach(() => {
  setTransformDepsForTests(null);
});

test("sentences split on terminators, and text with no terminator is still one sentence", () => {
  assert.deepEqual(splitSentences(THREE_SENTENCES), [
    "You must file a return.",
    "The deadline is April 15, 2026.",
    "Keep your receipts."
  ]);
  assert.deepEqual(splitSentences("No full stop here"), ["No full stop here"]);
  assert.deepEqual(splitSentences("Wait! Why? Because."), ["Wait!", "Why?", "Because."]);
  assert.deepEqual(splitSentences("   "), []);
});

test("an abbreviation does not end a sentence, and no text is ever dropped", () => {
  assert.deepEqual(splitSentences("Your school must be authorized by the U.S. Department of State. Ask them."), [
    "Your school must be authorized by the U.S. Department of State.",
    "Ask them."
  ]);
  assert.deepEqual(splitSentences("Send it to Dr. Lee. Keep a copy."), ["Send it to Dr. Lee.", "Keep a copy."]);
  assert.deepEqual(splitSentences("You may claim 3.5 percent."), ["You may claim 3.5 percent."]);
  assert.deepEqual(splitSentences("They finished their studies.For both students, ask first."), [
    "They finished their studies.",
    "For both students, ask first."
  ]);

  for (const sample of [
    "Your school must be authorized by the U.S. Department of State. Ask them.",
    "See 8 C.F.R. 214.2(f). Rules change.",
    "No terminator at all",
    "Trailing space. "
  ]) {
    assert.equal(splitSentences(sample).join(" "), sample.replace(/\s+/g, " ").trim(), `${sample} lost text`);
  }
});

test("micro-cards hold at most two sentences and never drop a sentence", () => {
  const cards = toMicroCards(VALID.sections);

  assert.ok(cards.length > VALID.sections.length, "a three-sentence section must become two cards");
  for (const count of sentenceCounts(cards)) {
    assert.ok(count <= MAX_CARD_SENTENCES, `a card had ${count} sentences`);
  }

  const before = VALID.sections.flatMap((section) => splitSentences(section.simplifiedText));
  const after = cards.flatMap((card) => splitSentences(card.simplifiedText));
  assert.deepEqual(after, before, "no sentence may be dropped, reordered or invented");
});

test("micro-cards keep their section heading and carry the takeaway on the last card", () => {
  const cards = toMicroCards(VALID.sections);

  assert.equal(cards[0].heading, "Work rules");
  assert.match(cards[1].heading, /^Work rules/);
  assert.equal(cards[0].keyTakeaway, "", "an unfinished idea has no takeaway yet");
  assert.equal(cards[1].keyTakeaway, "File on time.");
  assert.equal(cards[2].heading, "Off campus");
});

test("key words wrapped in double asterisks become emphasis runs", () => {
  assert.deepEqual(splitEmphasis("File by **April 15**, or you pay a **penalty**."), [
    { text: "File by ", strong: false },
    { text: "April 15", strong: true },
    { text: ", or you pay a ", strong: false },
    { text: "penalty", strong: true },
    { text: ".", strong: false }
  ]);
});

test("emphasis parsing survives text with no markers, stray markers and nothing at all", () => {
  assert.deepEqual(splitEmphasis("Plain text."), [{ text: "Plain text.", strong: false }]);
  assert.deepEqual(splitEmphasis("An **unclosed marker"), [{ text: "An unclosed marker", strong: false }]);
  assert.deepEqual(splitEmphasis(""), []);
  assert.deepEqual(splitEmphasis("**Whole card.**"), [{ text: "Whole card.", strong: true }]);
});

test("the adhd variant of validation re-chunks sections; the default variant leaves them alone", () => {
  const asAdhd = validateRestructured(VALID, "adhd");
  const asDefault = validateRestructured(VALID);

  assert.deepEqual(sentenceCounts(asDefault.sections), [3, 1], "default output must not change");
  for (const count of sentenceCounts(asAdhd.sections)) {
    assert.ok(count <= MAX_CARD_SENTENCES);
  }
  assert.equal(asAdhd.title, VALID.title, "the header fields are untouched by the variant");
});

test("the adhd prompt asks for micro-cards and key-word markers; the default prompt does not", () => {
  const adhd = buildUserPrompt({ text: "Some page text.", variant: "adhd" });
  const standard = buildUserPrompt({ text: "Some page text.", variant: "default" });

  assert.match(adhd, /micro-card/i);
  assert.match(adhd, /two short sentences/i);
  assert.match(adhd, /\*\*/, "the prompt must show the key-word marker");
  assert.doesNotMatch(standard, /micro-card/i);
  assert.notEqual(adhd, standard);
});

test("the route answers variant:adhd with micro-cards and leaves the default variant unchanged", async () => {
  setTransformDepsForTests({ llm: createStubLlmClient() });

  const rawText = `${THREE_SENTENCES} ${"Students must report a change of address to their school. ".repeat(8)}`;

  async function post(body: unknown): Promise<TransformResponse> {
    const response = await POST(
      new Request("http://localhost/api/transform", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      })
    );
    return (await response.json()) as TransformResponse;
  }

  const adhd = await post({ rawText, variant: "adhd" });
  const standard = await post({ rawText });
  assert.ok(!isTransformError(adhd) && !isTransformError(standard));

  for (const count of sentenceCounts(adhd.restructured.sections)) {
    assert.ok(count <= MAX_CARD_SENTENCES, `the route returned a card with ${count} sentences`);
  }
  assert.ok(
    adhd.restructured.sections.length > standard.restructured.sections.length,
    "the adhd variant must be more, smaller cards than the default"
  );
  assert.equal(adhd.cleanedOriginal, standard.cleanedOriginal, "the left panel must not change");
});
