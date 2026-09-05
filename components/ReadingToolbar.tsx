"use client";

import { useReadingPreferences } from "@/components/ReadingPreferencesProvider";
import type { LineSpacing, TextSize } from "@/lib/preferences";

const TEXT_SIZES: { value: TextSize; label: string; title: string }[] = [
  { value: "s", label: "A", title: "Small text" },
  { value: "m", label: "A", title: "Medium text" },
  { value: "l", label: "A", title: "Large text" }
];

const SPACINGS: { value: LineSpacing; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" }
];

/**
 * Cosmetic controls for the reading view: text size and line spacing. Pure CSS variables — they
 * change how the text looks, never what it says, and they apply to every Mode.
 *
 * They sit on the panel's own heading line, because that is the line that says whose text this is.
 * Two things a reader adjusts about *this panel's* rendering belong to the panel's edge, not above
 * the page's title where they would push the title down a row.
 *
 * Theme is deliberately not here, and neither is reading level. Theme belongs to the whole page, so
 * it lives in the masthead where a light-sensitive reader reaches it before transforming anything.
 * Reading level changes the words rather than the rendering, so it sits with the page's own facts.
 */
export default function ReadingToolbar() {
  const [preferences, onChange] = useReadingPreferences();

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
    </div>
  );
}
