import { TransformFailure } from "@/lib/errors";

/**
 * Failure codes that no model choice can fix. Both mean the key itself was rejected, so
 * trying the next model would repeat the failure and blur the error a reader sees.
 */
const NO_FALLBACK_CODES = new Set(["restructure_unauthorized", "ask_unauthorized"]);

/**
 * Parses a comma-separated model list from an env var: trims entries and drops empties.
 */
export function parseModelList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Splits one overall timeout budget across attempts, so N models cost no more wall-clock
 * than the single-model call did. A floor keeps even the last attempt usable.
 */
export function attemptTimeoutMs(totalMs: number, attemptCount: number): number {
  if (attemptCount <= 1) return totalMs;
  return Math.max(10_000, Math.floor(totalMs / attemptCount));
}

/**
 * Runs attempts in order and moves to the next one whenever a failure is one another
 * model could fix — unreachable, timeout, rate limit, model error, empty answer. The
 * last failure is rethrown so the reader still sees the real error, never a meta-error.
 */
export async function runWithFallbacks<T>(attempts: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown = new Error("No attempts were configured.");

  for (const run of attempts) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      // Anything outside the error contract is a bug; credential failures repeat
      // identically on every model. Both stop the chain here.
      if (!(error instanceof TransformFailure) || NO_FALLBACK_CODES.has(error.code)) {
        throw error;
      }
    }
  }

  throw lastError;
}
