"use client";

import type { LineSpacing, ReadingPreferences, TextSize } from "@/lib/preferences";

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

/**
 * Cosmetic controls for the reading view: text size and line spacing. Pure CSS variables — they
 * change how the text looks, never what it says, and they apply to every Mode.
 *
 * Theme is deliberately not here. It belongs to the whole page, not just this panel, so it lives in
 * the header where a light-sensitive reader reaches it before transforming anything. Both controls
 * write the same shared preference, so there is no second place for the setting to disagree.
 */
export default function ReadingToolbar({ preferences, onChange }: ReadingToolbarProps) {
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
