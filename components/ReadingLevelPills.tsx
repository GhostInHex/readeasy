"use client";

import { useId } from "react";
import styles from "@/components/ReadingLevel.module.css";
import { useReadingLevel } from "@/components/ReadingLevelProvider";
import { READING_LEVELS, type ReadingLevel } from "@/lib/types";

const LEVELS: Record<ReadingLevel, { label: string; title: string; waiting: string }> = {
  standard: {
    label: "Standard",
    title: "ReadEasy's plain-language version of this page",
    waiting: "Bringing back the standard version…"
  },
  simpler: {
    label: "Simpler",
    title: "The same page again, in easier words and shorter sentences",
    waiting: "Writing this page in easier words…"
  }
};

/**
 * The reading-level pills — the one control over this page that changes the words rather than the
 * rendering, so it sits with the page's own facts (measured grade level, reading time) instead of
 * with the cosmetic chips. The label spells out which version is on screen, because a reader who
 * switched and then scrolled needs to be able to check without switching again.
 *
 * Renders nothing when there is no workspace above to answer it.
 */
export default function ReadingLevelPills() {
  const readingLevel = useReadingLevel();
  const labelId = useId();

  if (!readingLevel) {
    return null;
  }

  return (
    <div className={styles.group} role="group" aria-labelledby={labelId}>
      <span className={styles.label} id={labelId}>
        Reading level
      </span>

      {READING_LEVELS.map((value) => (
        <button
          key={value}
          type="button"
          title={LEVELS[value].title}
          aria-pressed={readingLevel.level === value}
          aria-busy={readingLevel.pending === value || undefined}
          className={readingLevel.level === value ? `${styles.pill} ${styles.pillActive}` : styles.pill}
          onClick={() => readingLevel.select(value)}
        >
          {LEVELS[value].label}
        </button>
      ))}

      {readingLevel.pending && (
        <p className={styles.status} role="status">
          {LEVELS[readingLevel.pending].waiting}
        </p>
      )}

      {!readingLevel.pending && readingLevel.error && (
        <p className={styles.status} role="status">
          {readingLevel.error}
        </p>
      )}
    </div>
  );
}
