/**
 * Shared types for the Transform pipeline.
 *
 * The transform route's contract is `{cleanedOriginal, restructured}` on success
 * and `{error: {code, message, hint}}` on failure. Every Mode renders from the
 * same `Restructured` object.
 */

export type Urgency = "high" | "medium" | "low";

/**
 * How hard the ReadEasy version is to read.
 *
 * `standard` is the output ReadEasy has always produced. `simpler` is a second Restructure of the
 * same cleaned text in easier words — the same JSON, the same Modes, only the prompt differs. It is
 * a separate axis from the Mode variant, so a reader can have ADHD micro-cards at either level.
 */
export type ReadingLevel = "standard" | "simpler";

export const READING_LEVELS: readonly ReadingLevel[] = ["standard", "simpler"];

export const DEFAULT_READING_LEVEL: ReadingLevel = "standard";

export function isReadingLevel(value: unknown): value is ReadingLevel {
  return READING_LEVELS.includes(value as ReadingLevel);
}

export interface ActionItem {
  task: string;
  urgency: Urgency;
  deadline?: string;
}

export interface Section {
  heading: string;
  simplifiedText: string;
  keyTakeaway: string;
}

export interface Restructured {
  title: string;
  summary: string;
  readingTimeMinutes: number;
  actionItems: ActionItem[];
  sections: Section[];
}

export interface TransformSuccess {
  cleanedOriginal: string;
  restructured: Restructured;
  /** Present when the request came from a URL, so the UI can match fixtures. */
  sourceUrl?: string;
  /** The level this version was written at, echoed back so the UI never has to assume. */
  level?: ReadingLevel;
}

export interface TransformError {
  error: {
    code: string;
    message: string;
    hint: string;
  };
}

export type TransformResponse = TransformSuccess | TransformError;

export interface TransformRequest {
  url?: string;
  rawText?: string;
  /** Selected restructure variant. Defaults to the standard plain-language prompt. */
  variant?: "default" | "adhd";
  /** Reading level to write at. Defaults to `standard`; anything unknown is refused. */
  level?: ReadingLevel;
}

export function isTransformError(value: TransformResponse): value is TransformError {
  return typeof (value as TransformError).error === "object";
}
