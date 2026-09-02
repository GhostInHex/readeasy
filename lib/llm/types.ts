import type { ReadingLevel, Restructured } from "@/lib/types";

export type RestructureVariant = "default" | "adhd";

export interface RestructureInput {
  /** Cleaned page text — the only source the model is allowed to use. */
  text: string;
  /** Title recovered by Cleaning, when the page had one. */
  title?: string;
  variant: RestructureVariant;
  /**
   * Reading level to write at. Absent means the standard level, so the default prompt is unchanged.
   * Orthogonal to `variant`: the variant decides the shape of the output, the level decides how hard
   * the words are.
   */
  level?: ReadingLevel;
  /** Set on the single retry: the unusable answer from the first attempt. */
  previousAttempt?: string;
}

/**
 * The Restructure boundary. Implementations return the model's raw response text; JSON
 * parsing, schema validation, and the single retry live above this interface so tests can
 * stub malformed output deterministically.
 */
export interface LlmClient {
  readonly name: string;
  complete(input: RestructureInput): Promise<string>;
}

/** Shape returned to callers once validation has run. */
export type RestructureResult = Restructured;
