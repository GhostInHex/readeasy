/**
 * Seam 2: preference parsing is pure, so the "a bad stored value never breaks the view" rule is
 * tested directly rather than through the browser.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PREFERENCES,
  parsePreferences,
  preferenceAttributes,
  type ReadingPreferences
} from "@/lib/preferences";

test("nothing stored yet means the default reading view", () => {
  assert.deepEqual(parsePreferences(null), DEFAULT_PREFERENCES);
  assert.deepEqual(parsePreferences(""), DEFAULT_PREFERENCES);
});

test("a full stored preference round-trips", () => {
  const saved: ReadingPreferences = { textSize: "l", spacing: "wide", theme: "dark" };

  assert.deepEqual(parsePreferences(JSON.stringify(saved)), saved);
});

test("each field falls back on its own, so one bad value keeps the rest", () => {
  const parsed = parsePreferences(JSON.stringify({ textSize: "enormous", spacing: "wide" }));

  assert.deepEqual(parsed, { textSize: "m", spacing: "wide", theme: "light" });
});

test("corrupt or hostile storage values never throw", () => {
  for (const stored of ["not json", "null", "[]", '"m"', "42", '{"theme":{"nested":true}}']) {
    assert.deepEqual(parsePreferences(stored), DEFAULT_PREFERENCES, stored);
  }
});

test("preferences become the data attributes the stylesheet keys off", () => {
  assert.deepEqual(preferenceAttributes({ textSize: "s", spacing: "wide", theme: "dark" }), {
    "data-text-size": "s",
    "data-spacing": "wide",
    "data-theme": "dark"
  });
});
