import { TransformFailure } from "@/lib/errors";
import { RETRY_NUDGE, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/llm/prompt";
import type { LlmClient, RestructureInput } from "@/lib/llm/types";

export const DEFAULT_MODEL = "openai/gpt-4o-mini";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 55_000;

interface ChatCompletion {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/**
 * Restructure via OpenRouter. Returns the model's raw answer; parsing, schema validation,
 * and the single retry all live in `lib/restructure.ts` above this boundary.
 */
export function createOpenRouterClient(options: { apiKey: string; model?: string; appUrl?: string }): LlmClient {
  const model = options.model?.trim() || DEFAULT_MODEL;

  return {
    name: `openrouter:${model}`,
    async complete(input: RestructureInput): Promise<string> {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) }
      ];

      if (input.previousAttempt) {
        messages.push({ role: "assistant", content: input.previousAttempt.slice(0, 4000) });
        messages.push({ role: "user", content: RETRY_NUDGE });
      }

      let response: Response;
      try {
        response = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            authorization: `Bearer ${options.apiKey}`,
            "content-type": "application/json",
            ...(options.appUrl ? { "http-referer": options.appUrl } : {}),
            "x-title": "ReadEasy"
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 4000,
            response_format: { type: "json_object" }
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
      } catch (error) {
        const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
        throw new TransformFailure({
          code: timedOut ? "restructure_timeout" : "restructure_unreachable",
          message: timedOut
            ? "The rewriting step took too long for this page."
            : "ReadEasy could not reach the rewriting service.",
          hint: "Try Transform again. Long pages are slower — pasting one section at a time is faster."
        });
      }

      if (response.status === 401 || response.status === 403) {
        throw new TransformFailure({
          code: "restructure_unauthorized",
          message: "The rewriting service rejected ReadEasy's credentials.",
          hint: "Check that OPENROUTER_API_KEY is set correctly for this deployment."
        });
      }

      if (response.status === 429) {
        throw new TransformFailure({
          code: "restructure_rate_limited",
          message: "The rewriting service is rate limiting ReadEasy right now.",
          hint: "Wait a few seconds and press Transform again."
        });
      }

      if (!response.ok) {
        throw new TransformFailure({
          code: "restructure_failed",
          message: `The rewriting service returned an error (HTTP ${response.status}).`,
          hint: "Try Transform again in a moment."
        });
      }

      let payload: ChatCompletion;
      try {
        payload = (await response.json()) as ChatCompletion;
      } catch {
        throw new TransformFailure({
          code: "restructure_failed",
          message: "The rewriting service sent a response ReadEasy could not read.",
          hint: "Try Transform again in a moment."
        });
      }

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new TransformFailure({
          code: "restructure_empty",
          message: payload.error?.message
            ? `The rewriting service reported: ${payload.error.message}`
            : "The rewriting step came back empty for this page.",
          hint: "Try Transform again, or paste a shorter section of the page."
        });
      }

      return content;
    }
  };
}
