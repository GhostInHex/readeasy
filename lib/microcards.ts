import type { Section } from "@/lib/types";

/**
 * Micro-cards: the shaping rules behind ADHD mode.
 *
 * One card holds one idea in at most two sentences, with its most important words marked for
 * bolding. The model is asked for that shape in the prompt, but the rules are enforced here so a
 * drifting answer still renders as micro-cards. Nothing is ever dropped — an over-long card is
 * split into more cards, never truncated.
 */
export const MAX_CARD_SENTENCES = 2;

/** Key words are marked `**like this**`, so a card can be bolded without any HTML from the model. */
const EMPHASIS = /\*\*([^*]+)\*\*/g;

/**
 * A full stop that is part of an abbreviation, not the end of a sentence. Without this, "authorized
 * by the U.S. Department of State" becomes two cards, one of them reading "by the U. S.".
 */
const ABBREVIATION = /(?:\b[A-Za-z]|\b(?:Mr|Mrs|Ms|Dr|Prof|Jr|Sr|St|No|vs|etc|Inc|Dept|Fig|approx|e\.g|i\.e))\.$/;

export function splitSentences(text: string): string[] {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) {
    return [];
  }

  // Split on the space after a terminator rather than matching sentences, so no character can
  // ever be dropped — a card must contain exactly what the page said. Cleaning sometimes glues
  // two blocks together ("…completed their studies.For both F-1…"), so a terminator followed
  // straight by a capital counts as a break too. The separator is captured, so an abbreviation
  // that was split by mistake is rejoined exactly as it was written.
  const pieces = flat.split(/(?<=[.!?])(\s+|(?=[A-Z]))/);
  const sentences: string[] = [];

  for (let index = 0; index < pieces.length; index += 2) {
    const part = pieces[index];
    if (!part) {
      continue;
    }

    const previous = sentences[sentences.length - 1];
    if (previous && ABBREVIATION.test(previous)) {
      sentences[sentences.length - 1] = `${previous}${pieces[index - 1] ?? ""}${part}`;
      continue;
    }

    sentences.push(part);
  }

  return sentences;
}

export interface EmphasisRun {
  text: string;
  strong: boolean;
}

/** Split card text into plain and emphasised runs. The renderer turns these into real `<strong>`. */
export function splitEmphasis(text: string): EmphasisRun[] {
  const runs: EmphasisRun[] = [];
  let cursor = 0;

  for (const match of text.matchAll(EMPHASIS)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      runs.push({ text: text.slice(cursor, start), strong: false });
    }
    runs.push({ text: match[1], strong: true });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) {
    runs.push({ text: text.slice(cursor), strong: false });
  }

  // Any leftover asterisks were an unclosed marker; show the words, not the syntax.
  return runs
    .map((run) => (run.strong ? run : { ...run, text: run.text.replace(/\*+/g, "") }))
    .filter((run) => run.text.length > 0);
}

/**
 * Re-chunk sections so every card carries at most two sentences. A section that already fits comes
 * through unchanged; a longer one becomes consecutive cards under the same heading, and its
 * takeaway waits for the card that finishes the idea.
 */
export function toMicroCards(sections: Section[]): Section[] {
  const cards: Section[] = [];

  for (const section of sections) {
    const sentences = splitSentences(section.simplifiedText);
    if (!sentences.length) {
      continue;
    }

    const chunks: string[][] = [];
    for (let index = 0; index < sentences.length; index += MAX_CARD_SENTENCES) {
      chunks.push(sentences.slice(index, index + MAX_CARD_SENTENCES));
    }

    chunks.forEach((chunk, index) => {
      cards.push({
        heading: index === 0 ? section.heading : `${section.heading} (${index + 1})`,
        simplifiedText: chunk.join(" "),
        keyTakeaway: index === chunks.length - 1 ? section.keyTakeaway : ""
      });
    });
  }

  return cards;
}
