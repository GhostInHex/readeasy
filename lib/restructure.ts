import { TransformFailure } from "@/lib/errors";
import type { LlmClient, RestructureInput } from "@/lib/llm/types";
import { parseRestructureJson, validateRestructured } from "@/lib/schema";
import type { Restructured } from "@/lib/types";

/** Ceiling on the text handed to the model, so long publications stay inside the context window. */
export const MAX_RESTRUCTURE_CHARS = 24_000;

export function truncateForModel(text: string): string {
  return text.length > MAX_RESTRUCTURE_CHARS ? `${text.slice(0, MAX_RESTRUCTURE_CHARS)}…` : text;
}

/**
 * Run the Restructure step: call the model, then parse and validate its JSON.
 * Malformed output surfaces as the error contract (ticket 04 adds the single retry).
 */
export async function restructure(input: RestructureInput, llm: LlmClient): Promise<Restructured> {
  let raw: string;
  try {
    raw = await llm.complete({ ...input, text: truncateForModel(input.text) });
  } catch (error) {
    if (error instanceof TransformFailure) throw error;
    throw new TransformFailure({
      code: "restructure_failed",
      message: "The rewriting step could not finish for this page.",
      hint: "Try Transform again in a moment. If it keeps failing, paste a shorter section of the page."
    });
  }

  return validateRestructured(parseRestructureJson(raw));
}
