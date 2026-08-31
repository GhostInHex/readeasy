/** Small text helpers shared by Cleaning, Restructure, and the reading-time badge. */

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Reading time at a deliberately gentle 180 words per minute, minimum 1 minute. */
export function estimateReadingTimeMinutes(text: string): number {
  return Math.max(1, Math.round(countWords(text) / 180));
}

/** Collapse whitespace and blank-line runs so both panels render predictable paragraphs. */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

export function firstSentences(text: string, count: number): string {
  const sentences = text.replace(/\n+/g, " ").match(/[^.!?]+[.!?]+/g);
  if (!sentences) return text.slice(0, 200).trim();
  return sentences.slice(0, count).join(" ").trim();
}
