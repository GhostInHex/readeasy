import { TransformFailure } from "@/lib/errors";
import { attemptTimeoutMs, runWithFallbacks } from "@/lib/llm/fallback";
import { RETRY_NUDGE, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/llm/prompt";
import type { LlmClient, RestructureInput } from "@/lib/llm/types";

export const DEFAULT_MODEL = "minimax/minimax-m3:free";

/**
 * Tried, in order, when the primary model fails in a way another model could fix —
 * rate limit, outage, timeout, unusable answer. Both are JSON-capable free models.
 * `openrouter/free` last: it is a router, so it lands wherever there is capacity.
 */
export const FALLBACK_MODELS = ["z-ai/glm-5.2:free", "openrouter/free"];

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 55_000;

interface ChatCompletion {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/**
 * Restructure via OpenRouter. The primary model is tried first; the fallback chain covers
 * the failure modes a different model can fix. Returns the model's raw answer; parsing,
 * schema validation, and the single retry all live in `lib/restructure.ts` above this
 * boundary.
 */
export function createOpenRouterClient(options: {
  apiKey: string;
  model?: string;
  fallbackModels?: string[];
  appUrl?: string;
}): LlmClient {
  const models = [
    options.model?.trim() || DEFAULT_MODEL,
    ...(options.fallbackModels?.length ? options.fallbackModels : FALLBACK_MODELS)
  ];
  const perModelTimeout = attemptTimeoutMs(REQUEST_TIMEOUT_MS, models.length);

  return {
    name: `openrouter:${models.join(" + ")}`,
    async complete(input: RestructureInput): Promise<string> {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) }
      ];

      if (input.previousAttempt) {
        messages.push({ role: "assistant", content: input.previousAttempt.slice(0, 4000) });
        messages.push({ role: "user", content: RETRY_NUDGE });
      }

      return runWithFallbacks(
        models.map((model) => () =>
          completeWithModel({
            apiKey: options.apiKey,
            appUrl: options.appUrl,
            model,
            messages,
            timeoutMs: perModelTimeout
          })
        )
      );
    }
  };
}

/** One Restructure call to one model, mapped onto the Transform error contract. */
async function completeWithModel(request: {
  apiKey: string;
  appUrl?: string;
  model: string;
  messages: { role: string; content: string }[];
  timeoutMs: number;
}): Promise<string> {
  const { apiKey, appUrl, model, messages, timeoutMs } = request;

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        ...(appUrl ? { "http-referer": appUrl } : {}),
        "x-title": "ReadEasy"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(timeoutMs)
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

