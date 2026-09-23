"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  THEME_ATTRIBUTE,
  parsePreferences,
  type ReadingPreferences,
  type Theme
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
  // app/layout.tsx sets the same attribute before first paint; this effect keeps it current after
  // that. `update` also sets it synchronously so a toggle lands inside the transition hold below;
  // this is the backstop for any path that changes the theme without going through `update`.
  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, preferences.theme);
  }, [preferences.theme]);

  function update(next: Partial<ReadingPreferences>) {
    const themeChanges =
      next.theme !== undefined && next.theme !== preferences.theme;

    // A theme flip changes background, colour, border and shadow on nearly every element at once;
    // left alone, every one of those transitions fires together and the switch smears. Hold all
    // transitions off for the one frame the change lands in, then let the stylesheet take over
    // again. The hold is applied before React commits (this runs in the click handler), so the
    // reading view's own data-theme attribute — which React sets in that commit — is covered too.
    const hold = themeChanges ? document.createElement("style") : null;
    if (hold) {
      hold.setAttribute("data-theme-swap", "");
      hold.textContent = "*,*::before,*::after{transition:none !important}";
      document.head.append(hold);
      document.documentElement.setAttribute(THEME_ATTRIBUTE, next.theme as Theme);
      void document.documentElement.offsetHeight; // force the no-transition state to be computed
    }

    setPreferences((previous) => {
      const merged = { ...previous, ...next };
      try {
        window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Preference just won't survive the reload; the view still changes now.
      }
      return merged;
    });

    if (hold) {
      requestAnimationFrame(() => hold.remove());
    }
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
