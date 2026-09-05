"use client";

import { useRef, useState } from "react";
import Hero from "@/components/Hero";
import InputCard from "@/components/InputCard";
import ReadingBar from "@/components/ReadingBar";
import { ReadingLevelProvider } from "@/components/ReadingLevelProvider";
import SiteHeader from "@/components/SiteHeader";
import SplitView from "@/components/SplitView";
import { DEFAULT_MODE_ID } from "@/components/modes/registry";
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
 *
 * It also owns the shape of the whole screen, because that shape depends on whether there is a page
 * open. With nothing transformed the landing argues for the product. The moment a page arrives the
 * argument has been made: the hero goes, the transform box folds into one line in the header, and
 * the reading starts in the first viewport instead of the third. Mode lives up here for the same
 * reason — the switcher is in the sticky header, so the state has to be above both of them.
 */
export default function Workspace() {
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState<ReadingLevel>(DEFAULT_READING_LEVEL);
  const [pending, setPending] = useState<ReadingLevel | null>(null);
  const [levelError, setLevelError] = useState<string | null>(null);
  const [results, setResults] = useState<Partial<Record<ReadingLevel, TransformSuccess>>>({});
  const [source, setSource] = useState<TransformRequest | null>(null);
  const [error, setError] = useState<Failure | null>(null);
  const [modeId, setModeId] = useState<string>(DEFAULT_MODE_ID);
  const [inputOpen, setInputOpen] = useState(false);

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
      // The box has done its job. Folding it away is what puts the new page in the first viewport.
      setInputOpen(false);
    } else {
      setError({ message: outcome.message, hint: outcome.hint });
      setResults({});
      setSource(null);
      // A page that failed to load leaves the reader in the box, with their address still in it.
      setInputOpen(true);
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

  const result = results[level] ?? null;
  // Busy counts as reading: the panels carry the loading state, so the reader watches the page they
  // asked for arrive rather than the landing they have already read.
  const reading = Boolean(result) || busy;

  return (
    <ReadingLevelProvider value={{ level, pending, error: levelError, select: selectLevel }}>
      <SiteHeader>
        {result && (
          <ReadingBar
            title={result.restructured.title}
            sourceUrl={result.sourceUrl}
            modeId={modeId}
            onSelectMode={setModeId}
            inputOpen={inputOpen}
            onToggleInput={() => setInputOpen((open) => !open)}
            busy={busy}
          />
        )}
      </SiteHeader>

      <main className="page" data-stage={reading ? "reading" : "landing"}>
        {!reading && <Hero />}

        <InputCard onTransform={transform} busy={busy} folded={reading && !inputOpen} />

        {error && (
          <div className="notice notice-error" role="alert">
            <p className="notice-message">{error.message}</p>
            <p className="notice-hint">{error.hint}</p>
          </div>
        )}

        {reading && <SplitView result={result} busy={busy} source={source} modeId={modeId} />}
      </main>
    </ReadingLevelProvider>
  );
}
