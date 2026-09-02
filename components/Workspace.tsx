"use client";

import { useRef, useState } from "react";
import InputCard from "@/components/InputCard";
import { ReadingLevelProvider } from "@/components/ReadingLevelProvider";
import SplitView from "@/components/SplitView";
import {
  DEFAULT_READING_LEVEL,
  isTransformError,
  type ReadingLevel,
  type TransformRequest,
  type TransformResponse,
  type TransformSuccess
} from "@/lib/types";

interface Failure {
  message: string;
  hint: string;
}

type Outcome = { ok: true; result: TransformSuccess } | ({ ok: false } & Failure);

const UNREACHABLE: Failure = {
  message: "ReadEasy could not reach the transform service.",
  hint: "Check your connection and try again, or paste the page text in the Raw text tab."
};

/**
 * The workspace: one transform at a time, held per reading level.
 *
 * Both levels of the same page are kept once they have been fetched, so going back to a level a
 * reader has already seen is instant and costs nothing — no request, no model, no wait. A level that
 * has not been fetched is fetched without clearing the panel: the version on screen stays readable
 * while the other one is written, because a reader who asked for easier words should not have the
 * page taken away from them first.
 */
export default function Workspace() {
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState<ReadingLevel>(DEFAULT_READING_LEVEL);
  const [pending, setPending] = useState<ReadingLevel | null>(null);
  const [levelError, setLevelError] = useState<string | null>(null);
  const [results, setResults] = useState<Partial<Record<ReadingLevel, TransformSuccess>>>({});
  const [source, setSource] = useState<TransformRequest | null>(null);
  const [error, setError] = useState<Failure | null>(null);

  // Bumped by every new transform, so a level still in flight for the previous page cannot land in
  // the panel after the reader has moved on.
  const generation = useRef(0);

  async function fetchAtLevel(request: TransformRequest, atLevel: ReadingLevel): Promise<Outcome> {
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, level: atLevel })
      });
      const payload = (await response.json()) as TransformResponse;

      return isTransformError(payload)
        ? { ok: false, message: payload.error.message, hint: payload.error.hint }
        : { ok: true, result: payload };
    } catch {
      return { ok: false, ...UNREACHABLE };
    }
  }

  async function transform(request: TransformRequest) {
    const run = (generation.current += 1);
    setBusy(true);
    setError(null);
    setLevelError(null);
    setPending(null);

    const outcome = await fetchAtLevel(request, level);
    if (generation.current !== run) return;

    if (outcome.ok) {
      setResults({ [level]: outcome.result });
      setSource(request);
    } else {
      setError({ message: outcome.message, hint: outcome.hint });
      setResults({});
      setSource(null);
    }
    setBusy(false);
  }

  async function selectLevel(next: ReadingLevel) {
    if (next === level || pending) return;
    setLevelError(null);

    if (results[next]) {
      setLevel(next);
      return;
    }
    if (!source) return;

    const run = generation.current;
    setPending(next);
    const outcome = await fetchAtLevel(source, next);
    if (generation.current !== run) return;

    setPending(null);
    if (outcome.ok) {
      setResults((previous) => ({ ...previous, [next]: outcome.result }));
      setLevel(next);
    } else {
      // The level the reader is on stays on screen; only the pills carry the bad news.
      setLevelError(outcome.message);
    }
  }

  return (
    <ReadingLevelProvider value={{ level, pending, error: levelError, select: selectLevel }}>
      <InputCard onTransform={transform} busy={busy} />

      {error && (
        <div className="notice notice-error" role="alert">
          <p className="notice-message">{error.message}</p>
          <p className="notice-hint">{error.hint}</p>
        </div>
      )}

      <SplitView result={results[level] ?? null} busy={busy} source={source} />
    </ReadingLevelProvider>
  );
}
