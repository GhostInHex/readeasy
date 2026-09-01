"use client";

import { useEffect, useMemo, useState } from "react";
import type { ModeProps } from "@/components/modes/types";
import { splitEmphasis, toMicroCards } from "@/lib/microcards";
import type { Restructured, Section, TransformRequest, TransformResponse } from "@/lib/types";
import { isTransformError } from "@/lib/types";

/**
 * ADHD mode: the page as micro-cards, one idea per screen, key words bolded, with the same
 * step indicator Focus mode uses so a reader always knows where they are.
 *
 * The cards come from a second Restructure of the same page (`variant: "adhd"`), asked for the
 * moment this Mode is opened. Nothing else changes: same route, same JSON contract, same header.
 * If that request fails the Mode still works — the sections ReadEasy already has are re-chunked
 * into micro-cards in the browser.
 */

/** One request per page, shared across mounts, so switching Modes never re-runs the model. */
const requests = new Map<string, Promise<Restructured>>();

function cacheKey(source: TransformRequest): string {
  return source.url?.trim() || `raw:${source.rawText?.length ?? 0}:${source.rawText?.slice(0, 80) ?? ""}`;
}

function loadMicroCardVariant(source: TransformRequest): Promise<Restructured> {
  const key = cacheKey(source);
  const cached = requests.get(key);
  if (cached) {
    return cached;
  }

  const pending = fetch("/api/transform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...source, variant: "adhd" })
  })
    .then(async (response) => {
      const payload = (await response.json()) as TransformResponse;
      if (isTransformError(payload)) {
        throw new Error(payload.error.code);
      }
      return payload.restructured;
    });

  // A failed attempt must not be remembered, or the reader could never try again.
  pending.catch(() => requests.delete(key));
  requests.set(key, pending);
  return pending;
}

function CardText({ text }: { text: string }) {
  return (
    <p>
      {splitEmphasis(text).map((run, index) =>
        run.strong ? <strong key={index}>{run.text}</strong> : <span key={index}>{run.text}</span>
      )}
    </p>
  );
}

export default function AdhdMode({ restructured, source }: ModeProps) {
  const localCards = useMemo(() => toMicroCards(restructured.sections), [restructured]);
  const [cards, setCards] = useState<Section[]>(localCards);
  const [status, setStatus] = useState<"loading" | "ready" | "local">(source ? "loading" : "local");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    setIndex(0);

    if (!source) {
      setCards(localCards);
      setStatus("local");
      return;
    }

    setStatus("loading");
    loadMicroCardVariant(source).then(
      (variant) => {
        if (!alive) return;
        setCards(toMicroCards(variant.sections));
        setStatus("ready");
      },
      () => {
        if (!alive) return;
        setCards(localCards);
        setStatus("local");
      }
    );

    return () => {
      alive = false;
    };
  }, [localCards, source]);

  if (status === "loading") {
    return <p className="placeholder">Cutting the page into micro-cards…</p>;
  }

  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[safeIndex];
  const total = cards.length;

  if (!card) {
    return <p className="placeholder">This page had nothing to break into cards.</p>;
  }

  return (
    <div className="focus">
      <div className="focus-progress">
        <p className="focus-step" aria-live="polite">
          Card {safeIndex + 1} of {total}
        </p>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={safeIndex + 1}
          aria-label="Micro-card progress"
        >
          <div className="progress-fill" style={{ width: `${((safeIndex + 1) / total) * 100}%` }} />
        </div>
      </div>

      <article className="focus-card">
        <h4>{card.heading}</h4>
        <CardText text={card.simplifiedText} />
        {card.keyTakeaway && (
          <p className="takeaway">
            <strong>Key takeaway:</strong> {card.keyTakeaway}
          </p>
        )}
      </article>

      <div className="focus-controls">
        <button
          type="button"
          className="secondary"
          onClick={() => setIndex(Math.max(0, safeIndex - 1))}
          disabled={safeIndex === 0}
        >
          ← Back
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => setIndex(Math.min(total - 1, safeIndex + 1))}
          disabled={safeIndex >= total - 1}
        >
          Next →
        </button>
      </div>

      {status === "local" && (
        <p className="hint">Cards made from the version ReadEasy already had for this page.</p>
      )}
    </div>
  );
}
