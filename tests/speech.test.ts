/**
 * Seam 2 — karaoke Listen: the mapping from a speech boundary event's character index onto the word
 * a reader should see lit. Pure text work, so it is tested here without a browser or a voice; the
 * wiring of the events themselves is checked in the manual smoke pass.
 *
 * The engines are imprecise in different ways, so most of these cases are an index that does not
 * land neatly on the first letter of a word.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { spokenWordAt, toSpokenPassages } from "@/lib/speech";
import type { Restructured } from "@/lib/types";

const PASSAGE = "You must file by June 30. Bring two forms of ID — no cash!";

/** The passage with the lit word bracketed, the way a reader sees it highlighted. */
function lit(passage: string, charIndex: number): string {
  const { before, word, after } = spokenWordAt(passage, charIndex);
  return word ? `${before}[${word}]${after}` : before + after;
}

/** Every word the mapping lights as an index walks the whole passage, in order, without repeats. */
function litInOrder(passage: string): string[] {
  const words: string[] = [];
  for (let charIndex = 0; charIndex <= passage.length; charIndex += 1) {
    const { word } = spokenWordAt(passage, charIndex);
    if (word && word !== words[words.length - 1]) words.push(word);
  }
  return words;
}

test("an index at the start of the text lights the first word", () => {
  assert.equal(lit(PASSAGE, 0), "[You] must file by June 30. Bring two forms of ID — no cash!");
  assert.equal(lit("   indented", 0), "   [indented]");
});

test("an index inside a word lights that whole word, not the rest of it", () => {
  assert.equal(spokenWordAt(PASSAGE, 4).word, "must", "the m of must");
  assert.equal(spokenWordAt(PASSAGE, 6).word, "must", "mid-word");
  assert.equal(spokenWordAt(PASSAGE, 7).word, "must", "the last letter of must");
  assert.equal(lit(PASSAGE, 6), "You [must] file by June 30. Bring two forms of ID — no cash!");
  assert.equal(spokenWordAt(PASSAGE, 8).word, "file", "the space after must announces file");
});

test("a word keeps the punctuation that is spoken with it", () => {
  assert.equal(spokenWordAt(PASSAGE, 22).word, "30.");
  assert.equal(spokenWordAt(PASSAGE, 53).word, "cash!");
  assert.equal(spokenWordAt("Pay $1,500 by 06/30/2026 or call 1-800-829-1040.", 4).word, "$1,500");
  assert.equal(spokenWordAt("Pay $1,500 by 06/30/2026 or call 1-800-829-1040.", 14).word, "06/30/2026");
  assert.equal(spokenWordAt("Read self-employed rules; don't guess.", 5).word, "self-employed");
  assert.equal(spokenWordAt("Read self-employed rules; don't guess.", 26).word, "don't");
});

test("an index on punctuation between words lights the word being announced", () => {
  assert.equal(spokenWordAt(PASSAGE, 48).word, "no", "the em dash is not a word, so the next one lights");
  assert.equal(spokenWordAt("Bring ID, then wait.", 9).word, "then");
});

test("multi-word text lights each word once, in reading order", () => {
  assert.deepEqual(litInOrder("You must file by June 30."), ["You", "must", "file", "by", "June", "30."]);
  assert.deepEqual(litInOrder(PASSAGE), [
    "You",
    "must",
    "file",
    "by",
    "June",
    "30.",
    "Bring",
    "two",
    "forms",
    "of",
    "ID",
    "no",
    "cash!"
  ]);
});

test("the three parts always rebuild the passage exactly, at every index", () => {
  for (const passage of [PASSAGE, "one", "  spaced  out  ", "", "— · —"]) {
    for (let charIndex = -3; charIndex <= passage.length + 3; charIndex += 1) {
      const { before, word, after } = spokenWordAt(passage, charIndex);
      assert.equal(before + word + after, passage, `index ${charIndex} of "${passage}" lost text`);
    }
  }
});

test("an index at or past the end of the text parks on the last word", () => {
  assert.equal(spokenWordAt(PASSAGE, PASSAGE.length).word, "cash!");
  assert.equal(spokenWordAt(PASSAGE, PASSAGE.length + 40).word, "cash!");
  assert.equal(spokenWordAt("Done.", 5).word, "Done.");
});

test("an index before the text, or no index at all, is not an error", () => {
  assert.equal(spokenWordAt(PASSAGE, -1).word, "You", "a negative index lights the first word");
  assert.equal(spokenWordAt(PASSAGE, Number.NaN).word, "", "an index that is not a number lights nothing");
  assert.equal(spokenWordAt(PASSAGE, Number.NaN).before, PASSAGE, "and the passage still renders whole");
});

test("text with no words in it comes back whole and unhighlighted", () => {
  assert.deepEqual(spokenWordAt("", 0), { before: "", word: "", after: "" });
  assert.deepEqual(spokenWordAt("   ", 1), { before: "   ", word: "", after: "" });
  assert.deepEqual(spokenWordAt("— · —", 2), { before: "— · —", word: "", after: "" });
});

test("Listen reads the title, then each section's heading and text, in that order", () => {
  const restructured: Restructured = {
    title: "Students and employment",
    summary: "Not read aloud: the summary repeats the sections.",
    readingTimeMinutes: 3,
    actionItems: [{ task: "Ask your school", urgency: "high" }],
    sections: [
      { heading: "Work rules", simplifiedText: "You may work on campus.", keyTakeaway: "Ask first." },
      { heading: "Off campus", simplifiedText: "  Ask your school first.  ", keyTakeaway: "" }
    ]
  };

  assert.deepEqual(toSpokenPassages(restructured), [
    "Students and employment",
    "Work rules",
    "You may work on campus.",
    "Off campus",
    "Ask your school first."
  ]);
});

test("a page with empty headings, empty text, or no sections leaves nothing blank to read", () => {
  const bare: Restructured = {
    title: "Title only",
    summary: "",
    readingTimeMinutes: 1,
    actionItems: [],
    sections: [{ heading: "", simplifiedText: "   ", keyTakeaway: "" }]
  };

  assert.deepEqual(toSpokenPassages(bare), ["Title only"]);
  assert.deepEqual(toSpokenPassages({ ...bare, sections: [] }), ["Title only"]);
  assert.deepEqual(toSpokenPassages({ ...bare, title: " ", sections: [] }), []);
});
