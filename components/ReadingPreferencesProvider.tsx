"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  THEME_ATTRIBUTE,
  parsePreferences,
  type ReadingPreferences
} from "@/lib/preferences";

type PreferencesContext = [ReadingPreferences, (next: Partial<ReadingPreferences>) => void];

const Context = createContext<PreferencesContext | null>(null);

/**
 * One source of truth for reading preferences, shared by every control that can change them.
 *
 * The theme lives here rather than in the reading view because two controls now set it: the switch
 * in the app header, reachable the moment the page loads, and the pills inside the reading toolbar.
 * Separate hook instances would let those two disagree — you would flip the header to dark and watch
 * the reading panel stay light.
 *
 * The first render always uses the defaults so server and client markup agree; the stored preference
 * is applied straight after mount. Storage failures (private mode, full quota) are ignored — the
 * controls still work for the session, the choice just will not survive a reload.
 */
export default function ReadingPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      setPreferences(parsePreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)));
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  // The page shell draws from the same tokens as the reading view, so the theme has to reach <html>.
  // app/layout.tsx sets the same attribute before first paint; this keeps it current after that.
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

  return <Context.Provider value={[preferences, update]}>{children}</Context.Provider>;
}

export function useReadingPreferences(): PreferencesContext {
  const value = useContext(Context);

  if (!value) {
    throw new Error("useReadingPreferences needs a ReadingPreferencesProvider above it in the tree.");
  }

  return value;
}
