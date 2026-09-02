/**
 * The token contract other tickets build against.
 *
 * Tickets 15–19 write `var(--accent, #22406A)` and expect the name to resolve. If a rename or a
 * refactor drops one of these, nothing throws — the declaration is just dropped and the element
 * silently loses its colour. This test is the tripwire for that.
 *
 * It also re-derives the contrast ratios the token comments claim, so a value edited without
 * rechecking fails here rather than shipping. Readers with low vision are the ones a near-miss
 * fails, so the thresholds are WCAG AA: 4.5:1 for text, 3:1 for control boundaries.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const TOKENS = readFileSync(new URL("../app/tokens.css", import.meta.url), "utf8");
const GLOBALS = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** The exact names ticket 14 promised. Renaming one breaks every ticket that consumes it. */
const CONTRACT = [
  "--bg",
  "--surface",
  "--ink",
  "--ink-soft",
  "--accent",
  "--accent-soft",
  "--radius",
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--font-body",
  "--font-heading"
];

/** Custom properties inside one selector block, e.g. `:root` or `[data-theme="dark"]`. */
function tokensIn(selector: string): Record<string, string> {
  const start = TOKENS.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `tokens.css has no ${selector} block`);
  const body = TOKENS.slice(start, TOKENS.indexOf("}", start));
  const found: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    found[name] = value.trim();
  }
  return found;
}

const LIGHT = tokensIn(":root");
const DARK = tokensIn('[data-theme="dark"]');

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

test("every contract token is defined in the light theme", () => {
  for (const name of CONTRACT) {
    assert.ok(LIGHT[name], `:root is missing ${name}`);
  }
});

test("the dark theme redefines every colour token, so no light value leaks through", () => {
  const colours = Object.keys(LIGHT).filter((name) =>
    /^--(bg|surface|ink|accent|line|paper|notice|signal|dyslexia|done)/.test(name)
  );
  for (const name of colours) {
    assert.ok(DARK[name], `[data-theme="dark"] is missing ${name}`);
    assert.notEqual(DARK[name], LIGHT[name], `${name} is identical in both themes`);
  }
});

test("spacing is a real scale — six ascending steps", () => {
  const steps = [1, 2, 3, 4, 5, 6].map((n) => {
    const value = LIGHT[`--space-${n}`];
    assert.match(value, /^[\d.]+rem$/, `--space-${n} is ${value}, expected rem`);
    return parseFloat(value);
  });
  for (let i = 1; i < steps.length; i += 1) {
    assert.ok(steps[i] > steps[i - 1], `--space-${i + 1} (${steps[i]}) must exceed --space-${i} (${steps[i - 1]})`);
  }
});

test("Atkinson Hyperlegible leads the body stack and OpenDyslexic is untouched", () => {
  assert.match(LIGHT["--font-body"], /Atkinson/);
  assert.match(GLOBALS, /font-family:\s*"OpenDyslexic"/);
  assert.match(GLOBALS, /opendyslexic-400\.woff2/);
  assert.match(GLOBALS, /opendyslexic-700\.woff2/);
});

test("the global stylesheet holds no colour literal except the theme swatches", () => {
  const literals = GLOBALS.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  // The theme switch shows a chip of the theme it switches TO, which is by definition not the theme
  // currently in the variables. Those two grounds are the only literals allowed anywhere.
  const allowed = new Set([LIGHT["--bg"].toLowerCase(), DARK["--bg"].toLowerCase()]);
  const stray = literals.filter((value) => !allowed.has(value.toLowerCase()));
  assert.deepEqual(stray, [], `globals.css hardcodes ${stray.join(", ")}`);
});

/** Body text, secondary text, and link text in both themes. */
const TEXT_PAIRS: [string, string, string][] = [
  ["--ink", "--bg", "body text on the page"],
  ["--ink", "--bg-deep", "body text in the header"],
  ["--ink", "--surface", "body text on a card"],
  ["--ink-soft", "--bg", "secondary text on the page"],
  ["--ink-soft", "--bg-deep", "the footer's text"],
  ["--ink-soft", "--surface", "secondary text on a card"],
  ["--ink-cold", "--paper-cold", "the original page's own text"],
  ["--accent", "--bg", "link text on the page"],
  ["--accent", "--bg-deep", "the wordmark in the header"],
  ["--accent", "--surface", "link text on a card"],
  ["--accent", "--accent-soft", "accent text on an accent pill"],
  ["--ink", "--accent-soft", "body text on a takeaway"],
  ["--accent-ink", "--accent", "the primary button's label"]
];

for (const [theme, tokens] of Object.entries({ light: LIGHT, dark: DARK })) {
  test(`${theme} theme: every text pairing clears 4.5:1`, () => {
    for (const [fg, bg, what] of TEXT_PAIRS) {
      const ratio = contrast(tokens[fg] ?? LIGHT[fg], tokens[bg] ?? LIGHT[bg]);
      assert.ok(ratio >= 4.5, `${what} (${fg} on ${bg}) is ${ratio.toFixed(2)}:1, needs 4.5:1`);
    }
  });

  test(`${theme} theme: control boundaries and the focus ring clear 3:1`, () => {
    const pairs: [string, string, string][] = [
      ["--line-strong", "--surface", "an input's border"],
      ["--line-strong", "--bg", "a chip's border"],
      ["--accent", "--bg", "the focus ring on the page"],
      ["--accent", "--surface", "the focus ring on a card"]
    ];
    for (const [fg, bg, what] of pairs) {
      const ratio = contrast(tokens[fg] ?? LIGHT[fg], tokens[bg] ?? LIGHT[bg]);
      assert.ok(ratio >= 3, `${what} (${fg} on ${bg}) is ${ratio.toFixed(2)}:1, needs 3:1`);
    }
  });

  test(`${theme} theme: each priority signal is legible on its own field`, () => {
    for (const level of ["high", "medium", "low"]) {
      const ratio = contrast(tokens[`--signal-${level}`], tokens[`--signal-${level}-bg`]);
      assert.ok(ratio >= 4.5, `the ${level} badge is ${ratio.toFixed(2)}:1, needs 4.5:1`);
      const edge = contrast(tokens[`--signal-${level}-line`], tokens[`--signal-${level}-bg`]);
      assert.ok(edge >= 3, `the ${level} badge's edge is ${edge.toFixed(2)}:1, needs 3:1`);
    }
  });
}
