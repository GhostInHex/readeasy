"use client";

import { useEffect, useState } from "react";
import type { ModeProps } from "@/components/modes/types";

function paragraphsOf(text: string): string[] {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

/**
 * Focus mode: one section on screen at a time, with "Step n of m" and a progress bar, so a
 * reader never faces a wall of text.
 */
export default function FocusMode({ restructured }: ModeProps) {
  const cards = restructured.sections;
  const [index, setIndex] = useState(0);

  // A fresh transform (or a shorter one) must never leave the reader on a missing card.
  useEffect(() => {
    setIndex(0);
  }, [restructured]);

  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[safeIndex];
  const total = cards.length;

  if (!card) {
    return <p className="placeholder">This page had no sections to show.</p>;
  }

  return (
    <div className="focus">
      <div className="focus-progress">
        <p className="focus-step" aria-live="polite">
          Step {safeIndex + 1} of {total}
        </p>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={safeIndex + 1}
          aria-label="Reading progress"
        >
          <div className="progress-fill" style={{ width: `${((safeIndex + 1) / total) * 100}%` }} />
        </div>
      </div>

      <article className="focus-card">
        <h4>{card.heading}</h4>
        {paragraphsOf(card.simplifiedText).map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex}>{paragraph}</p>
        ))}
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
    </div>
  );
}
