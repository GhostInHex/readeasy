import { fetchPageHtml } from "@/lib/fetch-page";
import { parseModelList } from "@/lib/llm/fallback";
import { createOpenRouterClient } from "@/lib/llm/openrouter";
import { createStubLlmClient } from "@/lib/llm/stub";
import type { LlmClient } from "@/lib/llm/types";
import type { TransformDeps } from "@/lib/transform";

let overrides: Partial<TransformDeps> | null = null;

/**
 * Chooses the Restructure implementation: OpenRouter when a key is configured, otherwise the
 * canned stub so the app still runs (and so tests never need a key).
 */
export function defaultLlmClient(): LlmClient {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (process.env.READEASY_LLM_MODE === "stub" || !apiKey) {
    return createStubLlmClient();
  }

  return createOpenRouterClient({
    apiKey,
    model: process.env.OPENROUTER_MODEL,
    fallbackModels: parseModelList(process.env.OPENROUTER_FALLBACK_MODELS),
    appUrl: process.env.NEXT_PUBLIC_APP_URL
  });
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
