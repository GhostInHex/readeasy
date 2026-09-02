"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  THEME_ATTRIBUTE,
  parsePreferences,
  type ReadingPreferences
} from "@/lib/preferences";

/**
 * Reading preferences, persisted in localStorage.
 *
 * The first render always uses the defaults so the server and client markup agree; the stored
 * preference is applied straight after mount. Storage failures (private mode, full quota) are
 * ignored — the toggles still work for the session.
 *
 * The theme is also mirrored onto `<html>`, because the page shell around the reading view draws
 * from the same tokens. Without the mirror, choosing dark would leave a light shell wrapped around
 * a dark panel. The boot script in app/layout.tsx sets the same attribute before first paint.
 */
export function useReadingPreferences(): [ReadingPreferences, (next: Partial<ReadingPreferences>) => void] {
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      setPreferences(parsePreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)));
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, preferences.theme);
  }, [preferences.theme]);

  function update(next: Partial<ReadingPreferences>) {
    setPreferences((previous) => {
      const merged = { ...previous, ...next };
      try {
        window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Preference just won't survive the reload; the view still changes now.
      }
      return merged;
    });
  }

  return [preferences, update];
}
