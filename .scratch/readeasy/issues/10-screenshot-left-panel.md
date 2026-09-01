# 10: Screenshot left panel for cached trio

**What to build:** For the Demo trio URLs, the left panel shows the bundled screenshot of the messy original page (from ticket 02's fixtures) instead of the cleaned text. URL matching against cached fixtures; every other URL keeps the default `cleanedOriginal` text panel. This makes the video's "before" cinematic and the live path failure-proof.

**Blocked by:** 02 (fixtures exist) and 03 (left panel exists).

**Files you touch:** left-panel component, fixture matching helper.

**Status:** done

- [x] Trio URLs render their bundled screenshot on the left
- [x] Non-cached URLs still render `cleanedOriginal` text (default rule unchanged)
- [x] Missing/failed fixture falls back to text, never an error
- [x] All tests green

## Notes

- `lib/fixtures.ts` is the matching helper and the pure part: it reads ticket 02's
  `fixtures/index.json` (an array, not a map) and exposes `matchCachedPage(url)`. Matching is on
  host + path only, so protocol, a leading `www.`, a trailing slash, a query string, a fragment,
  surrounding whitespace and path casing all still match — but a different path on a cached host
  does not. Non-http(s) and unparseable input returns `null` rather than throwing.
- `TransformSuccess.sourceUrl` already existed for exactly this ("so the UI can match fixtures")
  and is absent for raw-text transforms, so pasted text can never pick up a screenshot.
- `tests/fixtures.test.ts` covers it at Seam 2 (5 tests, 41 total). One of them asserts every
  advertised screenshot actually exists in `public/fixtures/`, so a deleted or renamed capture
  fails the suite instead of the demo.
- Fallback is belt and braces: the text panel is used when there is no fixture, and `onError` on
  the `<img>` flips back to text if the file 404s, so a broken image can never be on screen.
- Verified in a real browser against `next start`, transforming the live USCIS trio URL:
  the left panel rendered `/fixtures/uscis-students-employment.png` (510×698 in the panel, alt
  text "The original page as published: USCIS — Students and Employment") with no `pre` element,
  and the screenshot visibly shows the cluttered original — masthead, breadcrumb, left nav,
  ALERT box. "Show the cleaned text" swapped in the cleaned text and back again. A raw-text
  transform and an uncached URL both kept the plain text panel with no toggle. With
  `/fixtures/*` forced to 404, the cached URL fell back to the cleaned text with no broken image
  and no page errors. Typecheck, 41 tests and the production build all clean.

## Deviations, noted per tracker rule 4

- `app/globals.css` gained `.original-shot` (and its `img` / `figcaption`), `.shot-switch` and a
  `button.link` style. A full-page capture is several thousand pixels tall, so it needs
  `max-height: 70vh` with `object-fit: cover; object-position: top` or it stretches the split view;
  the ticket's file list has no room for that, and the alternative was inline styles.
- Added a "Show the cleaned text" / "Show the original page" toggle. The left panel's stated job is
  letting a reader verify nothing was invented or dropped, and a screenshot cannot do that; the
  toggle keeps the verification path one click away for the three URLs that now default to an image.
- No `next/image`: the screenshots are already sized, local, and never remote, so the plain `<img>`
  avoids adding image-optimisation config for five static files. This is also what gives us the
  `onError` fallback for free.

