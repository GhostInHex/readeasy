/**
 * Karaoke Listen: following the browser's voice through a page, one word at a time.
 *
 * While it speaks, the browser tells us exactly one thing — a character index into the text it was
 * handed. A reader needs to see which word that is. Turning the first into the second is pure text
 * work, so it lives here and is tested without a browser or a voice; `ListenMode` only wires the
 * events up to it.
 *
 * The engines disagree about where a boundary sits: some report the first character of the word
 * about to be spoken, some land on the space or the comma in front of it, some walk into the middle
 * of a long word, and some run past the last word as they finish. So the index is treated as a
 * position in the passage rather than a promise, and always resolves to the word a reader would
 * expect to be lit.
 */

import type { Restructured } from "@/lib/types";

/** A word is any run with a letter or a number in it. A lone dash or bullet is scenery, not a word. */
const HAS_WORD_CHARACTER = /[\p{L}\p{N}]/u;

interface Word {
  /** Offset of the word's first character in the passage. */
  start: number;
  /** Offset one past the word's last character. */
  end: number;
}

/** A passage split around the word being spoken. `before + word + after` is always the passage. */
export interface SpokenPassage {
  before: string;
  /** The word to highlight, punctuation and all. Empty when no word is being spoken. */
  word: string;
  after: string;
}

/**
 * What Listen reads, in order: the title, then each section's heading and its simplified text.
 *
 * One passage becomes one utterance, which is also why the reader sees the page as this list — the
 * numbering in Listen mode and the "part 3 of 9" status are the same sequence.
 */
export function toSpokenPassages(restructured: Restructured): string[] {
  return [
    restructured.title,
    ...restructured.sections.flatMap((section) => [section.heading, section.simplifiedText])
  ]
    .map((passage) => passage.trim())
    .filter(Boolean);
}

/**
 * Words with their place in the passage. Split on whitespace only, so a date, a dollar amount, a
 * hyphenated word, or a URL stays the single unit the voice reads it as.
 */
function wordsIn(passage: string): Word[] {
  const words: Word[] = [];
  let offset = 0;

  for (const token of passage.split(/(\s+)/)) {
    if (token && HAS_WORD_CHARACTER.test(token)) {
      words.push({ start: offset, end: offset + token.length });
    }
    offset += token.length;
  }

  return words;
}

/**
 * The word a boundary at `charIndex` is speaking: the first word that has not finished yet.
 *
 * That single rule covers every way an engine can be imprecise. An index inside a word lights that
 * word; an index in the space or punctuation in front of a word lights the word it is announcing;
 * an index past the end lights the last word, so the highlight parks on the final word instead of
 * blinking off just before the voice stops.
 */
function wordAt(words: Word[], charIndex: number): Word | null {
  if (!words.length || !Number.isFinite(charIndex)) return null;
  return words.find((word) => charIndex < word.end) ?? words[words.length - 1];
}

/**
 * Split `passage` around the word a speech boundary event at `charIndex` is speaking.
 *
 * A passage with no words in it — empty, whitespace, punctuation alone — comes back whole and
 * unhighlighted rather than as an error, because a page ReadEasy did not write is not a reason for
 * Listen to stop working.
 */
export function spokenWordAt(passage: string, charIndex: number): SpokenPassage {
  const word = wordAt(wordsIn(passage), charIndex);
  if (!word) return { before: passage, word: "", after: "" };

  return {
    before: passage.slice(0, word.start),
    word: passage.slice(word.start, word.end),
    after: passage.slice(word.end)
  };
}
