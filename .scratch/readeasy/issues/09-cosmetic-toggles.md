# 09: Cosmetic toggles

**What to build:** Accessibility toggles that are pure CSS — no AI, no mode logic. Text size (S/M/L), line spacing (normal/wide), and a high-contrast/dark theme. Implemented as CSS variables applied at the reading-view level, working across all modes. Preference persists in localStorage.

**Blocked by:** 04 (reading view exists). Independent of the mode framework — can run in parallel with 05.

**Files you touch:** toggle-bar UI component, CSS variables/theme file, localStorage hook.

**Status:** done

- [x] Text size, line spacing, and dark/high-contrast each toggle and combine
- [x] Toggles apply across all modes, including stubs
- [x] Preference survives a page reload
- [x] No changes to the transform route or LLM code
- [x] All tests green

## Notes

- `lib/preferences.ts` is the pure part: the three preference types, defaults, `parsePreferences`
  (per-field fallback so one corrupt value cannot break the view) and `preferenceAttributes`, which
  produces the `data-text-size` / `data-spacing` / `data-theme` attributes the stylesheet keys off.
  `tests/preferences.test.ts` covers it at Seam 2, including hostile stored values.
- `components/useReadingPreferences.ts` wraps localStorage (`readeasy.reading-preferences`). The
  first render always uses defaults and the stored value is applied after mount, so server and
  client markup agree; storage failures are swallowed so the toggles still work for the session.
- All three attributes sit on the single `.reading` element, which declares
  `font-size: var(--reading-size)` and `line-height: var(--reading-line)`. Modes inherit without
  knowing the toggles exist — that is why the ADHD stub picks them up for free.
- Verified live in a real browser: text size 14.4 / 16.8 / 20.8px, spacing 26.88px → 44.72px at large,
  high contrast switching the reading surface to `rgb(12, 14, 18)` on `rgb(247, 249, 252)`, all three
  combining, and inheritance confirmed in the header (31.2px h3) and in Dyslexia (50.96px line
  height on the dark cream surface), Action, Listen and the ADHD stub. localStorage held
  `{"textSize":"l","spacing":"wide","theme":"dark"}`; after a reload and a fresh transform the view
  came back large/wide/dark with the right chips `aria-pressed`, and switching everything back left
  no sticky styling. 36 tests green, typecheck and build clean.
- Untouched, as required: `app/api/transform/route.ts`, `lib/transform.ts`, `lib/restructure.ts`,
  `lib/llm/*`. This ticket adds no server code at all.

## Deviations, noted per tracker rule 4

- `components/ReadingView.tsx` mounts the toolbar and spreads the preference attributes onto
  `.reading`. The ticket listed the toolbar component, the CSS, and the storage hook; something had
  to host them, and the reading view is the level the ticket names.
- Font sizes inside the reading view changed from `rem` to `em` (`.reading h3`, `.summary`,
  `.reading-time`, `.mode-description`, `.focus-card h4`, `.mode-dyslexia h4`, `.switch`,
  `.action-count`, `.action-item label`, `.deadline-chip`, `.badge`, `.listen-status`). `rem` is
  root-relative, so it would have ignored the text-size toggle. Dyslexia mode's fixed
  `line-height: 1.9` became `calc(var(--reading-line) + 0.3)` so it still reads looser than the rest
  while following the spacing toggle. Left-panel and page-chrome sizes stay in `rem`.
- Removed the dead `.section` / `.section h4` rules, orphaned when ticket 05 replaced ticket 04's
  flat section list.
- The dark theme also needs a few mode-specific overrides (badges, deadline chip, ticked rows, the
  Dyslexia cream surface) because those colours are deliberately hardcoded rather than variable.

