/**
 * Seam 2 — the readability score. A standard Flesch–Kincaid grade level over counted words,
 * sentences and syllables. No AI, no network, no randomness: the same text always scores the same.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MIN_SCORABLE_WORDS,
  countSyllables,
  flattenRestructured,
  gradeLabel,
  readability
} from "@/lib/readability";
import type { Restructured } from "@/lib/types";

const PLAIN =
  "The cat sat on the mat. The dog ran to the park. We had fun in the sun. " +
  "I will go to the shop and buy bread. My friend came with me.";

const DENSE =
  "Notwithstanding any other provision of this subparagraph, an individual who maintains a " +
  "principal place of abode within the United States for a period exceeding one half of the " +
  "applicable taxable year may be considered eligible for the aforementioned refundable credit, " +
  "provided that the requisite substantiating documentation accompanies the corresponding return.";

test("syllables are counted with the documented heuristic", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("a"), 1);
  assert.equal(countSyllables("the"), 1);
  assert.equal(countSyllables("table"), 2);
  assert.equal(countSyllables("government"), 3);
  assert.equal(countSyllables("readability"), 5);
  assert.equal(countSyllables("2026"), 1, "a number is one word, one syllable");
  assert.equal(countSyllables("—"), 0, "punctuation is not a word");
});

test("the grade is the Flesch–Kincaid formula over the counts it reports", () => {
  const score = readability(PLAIN);
  assert.ok(score);
  assert.equal(score.sentences, 5);
  assert.equal(score.words, 32);

  const expected = 0.39 * (score.words / score.sentences) + 11.8 * (score.syllables / score.words) - 15.59;
  assert.ok(Math.abs(score.grade - Math.max(1, Number(expected.toFixed(1)))) < 0.05, `grade was ${score.grade}`);
});

test("plain writing scores low and legalese scores high", () => {
  const plain = readability(PLAIN);
  const dense = readability(DENSE);
  assert.ok(plain && dense);

  assert.ok(plain.grade <= 5, `plain text scored grade ${plain.grade}`);
  assert.ok(dense.grade >= 13, `legalese scored grade ${dense.grade}`);
  assert.ok(dense.grade > plain.grade);
  assert.equal(plain.label, `grade ${Math.round(plain.grade)}`);
  // One 60-word sentence of officialese: past college, which is the honest answer.
  assert.equal(dense.label, "graduate level");
});

test("a real government page scores as hard reading", () => {
  const cleaned = readFileSync("fixtures/irs-eitc/cleaned.txt", "utf8");
  const score = readability(cleaned);

  assert.ok(score);
  assert.ok(score.grade >= 9, `the IRS page scored grade ${score.grade}`);
  assert.notEqual(score.label, "grade 5");
});

test("text too short to score returns null instead of a made-up number", () => {
  for (const value of ["", "   ", ".", "!!!", "Short and sweet.", "word ".repeat(MIN_SCORABLE_WORDS - 1)]) {
    assert.equal(readability(value), null, `${JSON.stringify(value.slice(0, 20))} should not be scored`);
  }
  assert.ok(readability("word ".repeat(MIN_SCORABLE_WORDS)), "exactly the minimum is scorable");
});

test("grade labels read like a person would say them", () => {
  assert.equal(gradeLabel(0.4), "grade 1");
  assert.equal(gradeLabel(5), "grade 5");
  assert.equal(gradeLabel(5.4), "grade 5");
  assert.equal(gradeLabel(12), "grade 12");
  assert.equal(gradeLabel(13), "college level");
  assert.equal(gradeLabel(16), "college level");
  assert.equal(gradeLabel(17), "graduate level");
});

test("the transformed side is flattened from the parts a reader actually reads", () => {
  const restructured: Restructured = {
    title: "Title",
    summary: "A short summary.",
    readingTimeMinutes: 2,
    actionItems: [{ task: "File the form", urgency: "high" }],
    sections: [
      { heading: "First", simplifiedText: "You must **file** a return.", keyTakeaway: "File it." },
      { heading: "Second", simplifiedText: "Keep receipts.", keyTakeaway: "" }
    ]
  };

  const flat = flattenRestructured(restructured);

  assert.match(flat, /A short summary\./);
  assert.match(flat, /You must file a return\./);
  assert.match(flat, /Keep receipts\./);
  assert.match(flat, /File it\./);
  assert.doesNotMatch(flat, /\*\*/, "key-word markers must not be scored as words");
  assert.doesNotMatch(flat, /^Title/, "the title is a fragment, not prose");
});
