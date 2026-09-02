"use client";

import { useReadingPreferences } from "@/components/ReadingPreferencesProvider";
import type { Theme } from "@/lib/preferences";

const THEMES: { value: Theme; label: string; hint: string }[] = [
  { value: "light", label: "Day", hint: "Cream paper, dark ink" },
  { value: "dark", label: "Night", hint: "Dark ground, warm ink" }
];

/**
 * The theme switch, in the header where a reader finds it before they have transformed anything.
 *
 * It is a two-option radio group rather than a single toggle button: a toggle has to label either
 * its current state or its next one, and readers reliably read it the other way. Two options with
 * one pressed says which theme is on and what the alternative is, with no guessing.
 */
export default function ThemeSwitch() {
  const [preferences, update] = useReadingPreferences();

  return (
    <div className="theme-switch" role="group" aria-label="Colour theme">
      {THEMES.map((theme) => {
        const active = preferences.theme === theme.value;

        return (
          <button
            key={theme.value}
            type="button"
            className={active ? "theme-option theme-option-active" : "theme-option"}
            aria-pressed={active}
            title={theme.hint}
            onClick={() => update({ theme: theme.value })}
          >
            <span aria-hidden="true" className="theme-swatch" data-theme-preview={theme.value} />
            {theme.label}
          </button>
        );
      })}
    </div>
  );
}
