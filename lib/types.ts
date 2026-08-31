/**
 * Shared types for the Transform pipeline.
 *
 * The transform route's contract is `{cleanedOriginal, restructured}` on success
 * and `{error: {code, message, hint}}` on failure. Every Mode renders from the
 * same `Restructured` object.
 */

export type Urgency = "high" | "medium" | "low";

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
}

export function isTransformError(value: TransformResponse): value is TransformError {
  return typeof (value as TransformError).error === "object";
}
