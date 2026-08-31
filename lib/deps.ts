import { fetchPageHtml } from "@/lib/fetch-page";
import { createStubLlmClient } from "@/lib/llm/stub";
import type { LlmClient } from "@/lib/llm/types";
import type { TransformDeps } from "@/lib/transform";

let overrides: Partial<TransformDeps> | null = null;

/**
 * Chooses the Restructure implementation. Ticket 04 adds the OpenRouter client here; until
 * then, and whenever no key is configured, the canned stub keeps the app usable.
 */
function defaultLlmClient(): LlmClient {
  return createStubLlmClient();
}

export function resolveTransformDeps(): TransformDeps {
  return {
    fetchHtml: fetchPageHtml,
    llm: defaultLlmClient(),
    ...overrides
  };
}

/** Test seam: stub fetching and the LLM without a network or a key. */
export function setTransformDepsForTests(next: Partial<TransformDeps> | null): void {
  overrides = next;
}
