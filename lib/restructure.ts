import { TransformFailure } from "@/lib/errors";
import type { LlmClient, RestructureInput } from "@/lib/llm/types";
import { parseRestructureJson, validateRestructured } from "@/lib/schema";
import { DEFAULT_READING_LEVEL, type ReadingLevel, type Restructured } from "@/lib/types";

/** Ceiling on the text handed to the model, so long publications stay inside the context window. */
export const MAX_RESTRUCTURE_CHARS = 24_000;

export function truncateForModel(text: string): string {
  return text.length > MAX_RESTRUCTURE_CHARS ? `${text.slice(0, MAX_RESTRUCTURE_CHARS)}…` : text;
}

/**
 * Pin the rewriting boundary to a reading level.
 *
 * The level changes only how the model is asked to write, so it belongs to the client rather than to
 * the pipeline around it: the route composes it onto the client it hands to `runTransform`, and every
 * layer in between — Cleaning, fetching, the retry, the schema gate — stays unaware that levels
 * exist. The standard level returns the client untouched, so the default path is exactly the request
 * it was before.
 */
export function withReadingLevel(llm: LlmClient, level: ReadingLevel): LlmClient {
  if (level === DEFAULT_READING_LEVEL) {
    return llm;
  }

  return {
    name: `${llm.name}+${level}`,
    complete: (input) => llm.complete({ ...input, level })
  };
}

async function callModel(input: RestructureInput, llm: LlmClient): Promise<string> {
  try {
    return await llm.complete(input);
  } catch (error) {
    if (error instanceof TransformFailure) throw error;
    throw new TransformFailure({
      code: "restructure_failed",
      message: "The rewriting step could not finish for this page.",
      hint: "Try Transform again in a moment. If it keeps failing, paste a shorter section of the page."
    });
  }
}

/**
 * Run the Restructure step: call the model, parse and validate its JSON, and on malformed
 * output retry exactly once before falling through to the error contract.
 */
export async function restructure(input: RestructureInput, llm: LlmClient): Promise<Restructured> {
  const request: RestructureInput = { ...input, text: truncateForModel(input.text) };

  const first = await callModel(request, llm);
  try {
    return validateRestructured(parseRestructureJson(first), request.variant);
  } catch (error) {
    if (!(error instanceof TransformFailure) || error.code !== "invalid_restructure") throw error;
  }

  // Exactly one retry, telling the model what was wrong with its first answer.
  const second = await callModel({ ...request, previousAttempt: first }, llm);
  return validateRestructured(parseRestructureJson(second), request.variant);
}
