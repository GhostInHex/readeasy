# 001 — Add press feedback to every flat control

- **Status**: DONE
- **Commit**: f1b6c3a
- **Severity**: MEDIUM
- **Category**: Physicality & origin (press feedback)
- **Estimated scope**: 4 files (app/globals.css + 3 CSS modules), ~9 small edits

## Problem

Only `button.primary` has press feedback. Every other pressable control in the app —
chips, tabs, mode options, theme options, the "Read another page" pill, secondary
buttons, ask-suggestion pills, reading-level pills, history Remove buttons — gives
nothing on `:active`. On a touch device the tap lands with zero confirmation that the
interface heard the reader. This is the app's highest-frequency interaction seam
(every mode switch, every card Next, every chip).

Current — the only `:active` rule in the app (`app/globals.css:595-598`):

```css
button.primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}
```

Controls with no `:active` rule (current code, verbatim):

```css
/* app/globals.css:1217-1228 */
.chip {
  background: transparent;
  color: var(--ink-soft);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  padding: var(--space-1) 0.7rem;
  font: inherit;
  cursor: pointer;
  min-width: 2.2rem;
  transition: background var(--duration) var(--ease), color var(--duration) var(--ease),
    border-color var(--duration) var(--ease);
}
```

```css
/* app/globals.css:479-491 */
.tab {
  background: transparent;
  color: var(--ink-soft);
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  margin-bottom: -1px;
  padding: var(--space-1) 0 var(--space-3);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--duration) var(--ease), border-color var(--duration) var(--ease);
}
```

```css
/* app/globals.css:212-222 */
.mode-option {
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: var(--text-small);
  padding: 0.4rem 0.85rem;
  cursor: pointer;
  transition: background var(--duration) var(--ease), color var(--duration) var(--ease);
}

```css
/* app/globals.css:119-132 (line 131 is the transition) */
.theme-option {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: var(--text-small);
  cursor: pointer;
  transition: background var(--duration) var(--ease), color var(--duration) var(--ease);
}
```

```css
/* app/globals.css:235-246 (line 245 is the transition) */
.readingbar-change {
  flex: none;
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  color: var(--ink-soft);
  font: inherit;
  font-size: var(--text-small);
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  transition: color var(--duration) var(--ease), border-color var(--duration) var(--ease);
}
```

```css
/* app/globals.css:931-941 */
button.secondary {
  background: var(--surface);
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.65rem 1.1rem;
  border-radius: var(--radius-sm);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--duration) var(--ease);
}
```

```css
/* components/AskPanel.module.css:41-54 (lines 51-53 are the transition) */
.suggestion {
  border: 1px solid var(--line-strong, #948a7a);
  border-radius: var(--radius-pill, 999px);
  padding: var(--space-1, 0.25rem) 0.7rem;
  background: transparent;
  color: var(--ink-soft, #5c5348);
  font: inherit;
  font-size: var(--text-small, 0.9rem);
  text-align: left;
  cursor: pointer;
  transition: background var(--duration, 220ms) var(--ease, ease-out),
    color var(--duration, 220ms) var(--ease, ease-out),
    border-color var(--duration, 220ms) var(--ease, ease-out);
}
```

```css
/* components/ReadingLevel.module.css:23-34 (lines 31-33 are the transition) */
.pill {
  background: transparent;
  color: var(--ink-soft, #5c5348);
  border: 1px solid var(--line-strong, #948a7a);
  border-radius: var(--radius-pill, 999px);
  padding: var(--space-1, 0.25rem) 0.7rem;
  font: inherit;
  cursor: pointer;
  transition: background var(--duration, 220ms) var(--ease, cubic-bezier(0.16, 1, 0.3, 1)),
    color var(--duration, 220ms) var(--ease, cubic-bezier(0.16, 1, 0.3, 1)),
    border-color var(--duration, 220ms) var(--ease, cubic-bezier(0.16, 1, 0.3, 1));
}
```

```css
/* components/HistoryList.module.css:100-111 (line 110 is the transition) */
.remove {
  flex: none;
  padding: var(--space-1) var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: none;
  color: var(--ink-soft);
  font: inherit;
  font-size: var(--text-small);
  cursor: pointer;
  transition: color var(--duration) var(--ease), border-color var(--duration) var(--ease);
}
```

## Target

Press feedback per AUDIT.md §3: `transform: scale(0.97)` on `:active`, `transition:
transform 160ms <ease-out curve>`. Duration 160ms is the top of the 100–160ms press
budget; the curve is the repo's own `--ease` (expo ease-out — the repo convention is
to extend `tokens.css`, never invent a parallel curve).

For every selector below: (a) append `, transform 160ms var(--ease)` as the final item
of its existing `transition` list (keep existing entries and line wrapping intact), and
(b) add the paired `:active` rule directly after that control's existing `:hover` rule,
or directly after the base rule where none exists.

```css
/* target — globals.css uses tokens with no fallbacks (file header: a literal here is a bug) */
.chip:active:not(:disabled) {
  transform: scale(0.97);
}
.tab:active:not(:disabled) {
  transform: scale(0.97);
}
.mode-option:active:not(:disabled) {
  transform: scale(0.97);
}
.theme-option:active:not(:disabled) {
  transform: scale(0.97);
}
.readingbar-change:active:not(:disabled) {
  transform: scale(0.97);
}
button.secondary:active:not(:disabled) {
  transform: scale(0.97);
}
```

```css
/* target — AskPanel.module.css: this file's own fallback style is `var(--ease, ease-out)` */
.suggestion {
  /* ...existing declarations unchanged... */
  transition: background var(--duration, 220ms) var(--ease, ease-out),
    color var(--duration, 220ms) var(--ease, ease-out),
    border-color var(--duration, 220ms) var(--ease, ease-out),
    transform 160ms var(--ease, ease-out);
}

.suggestion:active:not(:disabled) {
  transform: scale(0.97);
}
```

```css
/* target — ReadingLevel.module.css: this file's own fallback style is the full curve */
.pill {
  /* ...existing declarations unchanged... */
  transition: background var(--duration, 220ms) var(--ease, cubic-bezier(0.16, 1, 0.3, 1)),
    color var(--duration, 220ms) var(--ease, cubic-bezier(0.16, 1, 0.3, 1)),
    border-color var(--duration, 220ms) var(--ease, cubic-bezier(0.16, 1, 0.3, 1)),
    transform 160ms var(--ease, cubic-bezier(0.16, 1, 0.3, 1));
}

.pill:active:not(:disabled) {
  transform: scale(0.97);
}
```

```css
/* target — HistoryList.module.css: no-fallback idiom (file header: literals are bugs) */
.remove {
  /* ...existing declarations unchanged... */
  transition: color var(--duration) var(--ease), border-color var(--duration) var(--ease),
    transform 160ms var(--ease);
}

.remove:active:not(:disabled) {
  transform: scale(0.97);
}
```

## Repo conventions to follow

- Easing/duration tokens live in `app/tokens.css`: `--duration: 220ms`,
  `--ease: cubic-bezier(0.16, 1, 0.3, 1)` — reference them, never restate the curve in
  globals.css or HistoryList.module.css; AskPanel/ReadingLevel modules restate it only
  as the `var()` fallback, matching each file's existing fallback style.
- Exemplar for the `:active` shape: `button.primary:active:not(:disabled)` at
  `app/globals.css:595-598` — base rule → `:hover` rule → `:active` rule, in that order.
- Exemplar for extending a transition list: `.chip` at `app/globals.css:1226-1227`.
- Reduced motion is handled globally at `app/globals.css:1281-1289` (collapses durations
  to 0.01ms, end-state preserved). Do NOT add per-rule `prefers-reduced-motion` blocks —
  the global block is this repo's settled convention.

## Steps

1. `app/globals.css` `.chip` (lines 1226-1227): append `, transform 160ms var(--ease)`
   to its transition list; insert `.chip:active:not(:disabled) { transform: scale(0.97); }`
   immediately after `.chip:hover:not(.chip-active)` (ends line 1233).
2. `app/globals.css` `.tab` (line 490): append `, transform 160ms var(--ease)`; insert
   `.tab:active:not(:disabled)` after `.tab:hover:not(.tab-active)` (ends line 495).
3. `app/globals.css` `.mode-option` (line 221): append `, transform 160ms var(--ease)`;
   insert `.mode-option:active:not(:disabled)` after
   `.mode-option:hover:not(.mode-option-active)` (ends line 227).
4. `app/globals.css` `.theme-option` (line 131): append `, transform 160ms var(--ease)`;
   insert `.theme-option:active:not(:disabled)` after the base rule (ends line 132) —
   this control has no hover rule.
5. `app/globals.css` `.readingbar-change` (line 245): append
   `, transform 160ms var(--ease)`; insert `.readingbar-change:active:not(:disabled)`
   after its hover rule (ends line 251).
6. `app/globals.css` `button.secondary` (line 940): append
   `, transform 160ms var(--ease)`; insert `button.secondary:active:not(:disabled)` after
   `button.secondary:hover:not(:disabled)` (ends line 945).
7. `components/AskPanel.module.css` `.suggestion`: append
   `, transform 160ms var(--ease, ease-out)` as the fourth transition item; insert
   `.suggestion:active:not(:disabled) { transform: scale(0.97); }` after its hover rule
   (ends line 60).
8. `components/ReadingLevel.module.css` `.pill`: append
   `, transform 160ms var(--ease, cubic-bezier(0.16, 1, 0.3, 1))` as the fourth
   transition item; insert `.pill:active:not(:disabled) { transform: scale(0.97); }`
   after its hover rule (ends line 39) — before the `:focus-visible` comment.
9. `components/HistoryList.module.css` `.remove`: append
   `, transform 160ms var(--ease)` as the third transition item; insert
   `.remove:active:not(:disabled) { transform: scale(0.97); }` after its hover rule
   (ends line 116).

## Boundaries

- Do NOT touch `button.primary`, `button.link`, `.open` (the wide history row — a 0.97
  scale on a full-width row reads as layout jitter; its hover/focus states already
  carry feedback), `.readingbar-page`, or anything in `app/print.css`.
- Do NOT change markup, JSX, or any declaration other than the listed `transition`
  lists and the new `:active` rules — no colors, spacing, radii, focus styles.
- Do NOT add new dependencies, tokens, or `prefers-reduced-motion` blocks.
- No hover-motion changes: this is press-only. Do not gate `:active` behind
  `@media (hover: hover)` — press is not hover.
- If a step doesn't match the code you find (drift since commit f1b6c3a), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm test` (expect 146/146 — includes
  `tests/tokens.test.ts`, which fails if a color literal appears in globals.css; this
  plan adds none), `npm run build` (compiles, route table prints).
- **Feel check**: dev server on http://localhost:3001, then:
  - Press-and-hold a text-size chip (A/A/A in the reading toolbar): it eases to ~97%
    of its size within 160ms and returns on release; the row beneath never shifts
    (transform must not reflow siblings).
  - Press a Mode option in the header: brief squeeze, then the mode switches; spam
    Next/Back in Focus mode — the card button must never look stuck at 0.97
    (transitions retarget from current state; a stuck scale means the rule landed
    outside `:active`).
  - Keyboard: Tab to a chip, hold Enter — same brief press (some browsers fire
    `:active` on keydown); the 3px focus outline stays visible throughout.
  - In DevTools Animations panel at 10% playback: the scale runs 160ms on the
    expo-out curve (fast start, gentle settle) — not linear, not ease-in.
  - DevTools Rendering → emulate `prefers-reduced-motion: reduce`: press still
    reports as pressed (color/focus states intact) but no scale movement plays.
- **Done when**: all nine controls visibly depress on pointer press, no layout shift
  occurs, mechanical checks pass, and reduced-motion emulation drops the movement
  while keeping every static state.
