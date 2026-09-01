"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  parsePreferences,
  type ReadingPreferences
} from "@/lib/preferences";

/**
 * Reading preferences, persisted in localStorage.
 *
 * The first render always uses the defaults so the server and client markup agree; the stored
 * preference is applied straight after mount. Storage failures (private mode, full quota) are
 * ignored — the toggles still work for the session.
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
