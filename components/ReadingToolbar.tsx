"use client";

import { useId } from "react";
import styles from "@/components/ReadingLevel.module.css";
import { useReadingLevel } from "@/components/ReadingLevelProvider";
import type { LineSpacing, ReadingPreferences, TextSize } from "@/lib/preferences";
import { READING_LEVELS, type ReadingLevel } from "@/lib/types";

interface ReadingToolbarProps {
  preferences: ReadingPreferences;
  onChange: (next: Partial<ReadingPreferences>) => void;
}

const TEXT_SIZES: { value: TextSize; label: string; title: string }[] = [
  { value: "s", label: "A", title: "Small text" },
  { value: "m", label: "A", title: "Medium text" },
  { value: "l", label: "A", title: "Large text" }
];

const SPACINGS: { value: LineSpacing; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" }
];

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
 * Cosmetic controls for the reading view: text size and line spacing. Pure CSS variables — they
 * change how the text looks, never what it says, and they apply to every Mode.
 *
 * The reading-level pills are the one control here that does change the words. They sit beside the
 * cosmetic ones because to a reader they are the same kind of thing — how this page is presented to
 * me — and the label spells out which version is on screen. They appear only when a workspace is
 * above to answer them.
 *
 * Theme is deliberately not here. It belongs to the whole page, not just this panel, so it lives in
 * the header where a light-sensitive reader reaches it before transforming anything. Both controls
 * write the same shared preference, so there is no second place for the setting to disagree.
 */
export default function ReadingToolbar({ preferences, onChange }: ReadingToolbarProps) {
  const readingLevel = useReadingLevel();
  const levelLabelId = useId();

  return (
    <div className="reading-toolbar">
      <div className="toolbar-group" role="group" aria-label="Text size">
        {TEXT_SIZES.map((size) => (
          <button
            key={size.value}
            type="button"
            title={size.title}
            aria-label={size.title}
            aria-pressed={preferences.textSize === size.value}
            className={preferences.textSize === size.value ? "chip chip-active" : "chip"}
            onClick={() => onChange({ textSize: size.value })}
          >
            <span className={`size-${size.value}`}>{size.label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-group" role="group" aria-label="Line spacing">
        {SPACINGS.map((spacing) => (
          <button
            key={spacing.value}
            type="button"
            aria-pressed={preferences.spacing === spacing.value}
            className={preferences.spacing === spacing.value ? "chip chip-active" : "chip"}
            onClick={() => onChange({ spacing: spacing.value })}
          >
            {spacing.label}
          </button>
        ))}
      </div>

      {readingLevel && (
        <div className={styles.group} role="group" aria-labelledby={levelLabelId}>
          <span className={styles.label} id={levelLabelId}>
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
      )}
    </div>
  );
}
