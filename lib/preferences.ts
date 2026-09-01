/**
 * Reading preferences: text size, line spacing, and theme. Pure data plus parsing, so the rules
 * are testable at Seam 2 and the React hook stays a thin wrapper over localStorage.
 *
 * These are cosmetics only. Nothing here touches the transform pipeline or the Restructure output.
 */

export type TextSize = "s" | "m" | "l";
export type LineSpacing = "normal" | "wide";
export type Theme = "light" | "dark";

export interface ReadingPreferences {
  textSize: TextSize;
  spacing: LineSpacing;
  theme: Theme;
}

export const PREFERENCES_STORAGE_KEY = "readeasy.reading-preferences";

export const DEFAULT_PREFERENCES: ReadingPreferences = {
  textSize: "m",
  spacing: "normal",
  theme: "light"
};

const TEXT_SIZES: TextSize[] = ["s", "m", "l"];
const SPACINGS: LineSpacing[] = ["normal", "wide"];
const THEMES: Theme[] = ["light", "dark"];

function pick<T extends string>(allowed: T[], value: unknown, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Read preferences back out of storage. Anything missing, misspelt, or corrupted falls back to the
 * default for that one field, so a bad value can never leave the reader stuck with an unusable view.
 */
export function parsePreferences(stored: string | null): ReadingPreferences {
  if (!stored) return DEFAULT_PREFERENCES;

  let raw: unknown;
  try {
    raw = JSON.parse(stored);
  } catch {
    return DEFAULT_PREFERENCES;
  }

  if (!raw || typeof raw !== "object") return DEFAULT_PREFERENCES;
  const candidate = raw as Partial<Record<keyof ReadingPreferences, unknown>>;

  return {
    textSize: pick(TEXT_SIZES, candidate.textSize, DEFAULT_PREFERENCES.textSize),
    spacing: pick(SPACINGS, candidate.spacing, DEFAULT_PREFERENCES.spacing),
    theme: pick(THEMES, candidate.theme, DEFAULT_PREFERENCES.theme)
  };
}

/** The data attributes the stylesheet keys off. One place, so every mode inherits the same rules. */
export function preferenceAttributes(preferences: ReadingPreferences): Record<string, string> {
  return {
    "data-text-size": preferences.textSize,
    "data-spacing": preferences.spacing,
    "data-theme": preferences.theme
  };
}
