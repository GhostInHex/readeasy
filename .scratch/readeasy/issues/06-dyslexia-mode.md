# 06: Dyslexia mode

**What to build:** The Dyslexia Mode renderer. OpenDyslexic font, cream/warm background tint, and Bionic Reading (first half of each word bolded). The Bionic formatter is a pure function with direct Seam-2 tests. Styling is scoped to this mode only.

**Blocked by:** 05 (mode framework; un-stub Dyslexia).

**Files you touch:** the Dyslexia renderer file + its registry line (already a stub), the Bionic pure function + its test, mode-scoped styles.

**Status:** done

- [x] Dyslexia toggle switches font, tint, and bionic formatting on, and off cleanly
- [x] Bionic formatter: unit-tested at Seam 2 (edge cases: single words, punctuation, URLs)
- [x] Other modes are visually unaffected
- [x] Stub "coming soon" replaced by full renderer
- [x] All tests green

## Notes

- `lib/bionic.ts` — `toBionicSegments(text)` returns `{lead, rest}` segments instead of an HTML
  string, so the renderer emits real `<strong>` elements and never needs `dangerouslySetInnerHTML`.
  Rule: words of 3 letters or fewer get one bold letter, longer words get `ceil(length / 2)`;
  leading punctuation does not count toward the bold half; whitespace, number-only tokens, URLs,
  emails and file paths are passed through unbolded.
- `tests/bionic.test.ts` — 8 Seam-2 tests covering the half rule, short words, single words, empty
  and whitespace-only input, punctuation, URLs/emails/paths, numbers, hyphens and apostrophes, plus
  a round-trip test that segments always rebuild the input string exactly.
- The Dyslexia registry line from ticket 05 was already correct, so this ticket really was one
  renderer file plus a pure function plus scoped CSS — the framework claim held.
- Bionic Reading is on by default with an in-mode "Bold the start of each word" checkbox, because
  bolding suits some readers and distracts others.
- Verified live against `next start` with a real browser: `.mode-dyslexia` computed to
  `OpenDyslexic, Verdana, Tahoma, sans-serif` on `rgb(253, 246, 227)` with 0.48px letter-spacing and
  30.4px line-height, `document.fonts.check('16px "OpenDyslexic"')` was true, bold leads came out as
  `Y / mu / ren / yo / self-em / per`, unchecking the toggle left the paragraph text identical with
  the bold spans gone, and switching back to Focus left no `.mode-dyslexia` node and restored the
  default `system-ui` font and transparent card background. 31 tests green, typecheck and build clean.

## Deviations, noted per tracker rule 4

- Added `public/fonts/opendyslexic-400.woff2`, `public/fonts/opendyslexic-700.woff2` and
  `public/fonts/OpenDyslexic-LICENSE.txt` (vendored from `@fontsource/opendyslexic@5.2.5`, SIL OFL).
  Serving the font ourselves keeps the demo working offline and adds no third-party runtime request;
  the `@font-face` rules prefer a locally installed OpenDyslexic before the vendored file.
- The `@font-face` declarations and the shared `.switch` checkbox style live in `app/globals.css`
  alongside the other mode styles rather than in a separate stylesheet; everything else is scoped
  under `.mode-dyslexia`.

