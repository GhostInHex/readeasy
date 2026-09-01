import { splitSentences } from "@/lib/microcards";
import type { Restructured } from "@/lib/types";

/**
 * Readability, as a plain arithmetic check on the text — no AI, no model call.
 *
 * The score is the Flesch–Kincaid grade level:
 *   0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59
 * which is the standard US school grade a reader needs. Long sentences and long words both push
 * it up, which is exactly what makes government prose hard, so it is a fair before/after measure
 * of what Restructure did.
 *
 * Syllables are counted with the usual vowel-group heuristic. It is approximate by nature — no
 * dictionary is bundled — so the badge deliberately reports a grade band, not decimal places.
 */

/** Below this, a score says more about the sample than the writing. */
export const MIN_SCORABLE_WORDS = 20;

export interface ReadabilityScore {
  /** Flesch–Kincaid grade level, one decimal place, never below 1. */
  grade: number;
  /** How a person would say it: "grade 5", "college level", "graduate level". */
  label: string;
  words: number;
  sentences: number;
  syllables: number;
}

export function countSyllables(word: string): number {
  const letters = word.toLowerCase().replace(/[^a-z]/g, "");

  if (!letters) {
    // A number is one word and, for counting purposes, one syllable. Punctuation is neither.
    return /\d/.test(word) ? 1 : 0;
  }

  if (letters.length <= 3) {
    return 1;
  }

  const trimmed = letters.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

export function gradeLabel(grade: number): string {
  if (grade >= 17) return "graduate level";
  if (grade >= 13) return "college level";
  return `grade ${Math.max(1, Math.round(grade))}`;
}

/** `null` when there is not enough text to say anything honest about it. */
export function readability(text: string): ReadabilityScore | null {
  const sentences = splitSentences(text).length;
  const tokens = text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token));

  if (tokens.length < MIN_SCORABLE_WORDS || sentences === 0) {
    return null;
  }

  const syllables = tokens.reduce((total, token) => total + countSyllables(token), 0);
  const raw = 0.39 * (tokens.length / sentences) + 11.8 * (syllables / tokens.length) - 15.59;

  const grade = Math.max(1, Number(raw.toFixed(1)));
  return { grade, label: gradeLabel(grade), words: tokens.length, sentences, syllables };
}

/**
 * The transformed text as a reader meets it: the summary, then each section's prose and takeaway.
 * Headings and the title are fragments, not sentences, so they would distort the sentence length;
 * `**key word**` markers are dropped so they are not scored as characters.
 */
export function flattenRestructured(restructured: Restructured): string {
  return [
    restructured.summary,
    ...restructured.sections.flatMap((section) => [section.simplifiedText, section.keyTakeaway])
  ]
    .map((part) => part.replace(/\*\*/g, "").trim())
    .filter(Boolean)
    .join("\n\n");
}
