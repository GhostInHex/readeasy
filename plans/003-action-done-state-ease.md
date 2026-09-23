# 003 — Ease the Action checklist into its done state

- **Status**: TODO
- **Commit**: f1b6c3a
- **Severity**: LOW
- **Category**: Cohesion & tokens (state change outside the repo's own transition idiom)
- **Estimated scope**: 1 file (app/globals.css), 2 declarations

## Problem

Ticking a checklist item snaps the row's background to `--done-bg` and the label to
`--ink-soft` instantly, while every comparable state change elsewhere in the app eases
(background/color transitions on chips at `app/globals.css:1226-1227`, theme options at
line 131, mode options at line 221). The snap reads as a glitch beside them. Frequency
is occasional-to-tens; this is a pure state indication, so a standard background/color
transition qualifies.

Current, verbatim:

```css
/* app/globals.css:1092-1100 */
.action-item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.85rem var(--space-4);
  background: var(--surface);
}
```

```css
/* app/globals.css:1116-1121 */
.action-item label {
  margin: 0;
  font-weight: 500;
  font-size: 1.05em;
  cursor: pointer;
}
```

The done state they must ease toward/away from (`app/globals.css:1141-1148`):

```css
.action-done {
  background: var(--done-bg);
}

.action-done label {
  color: var(--ink-soft);
  text-decoration: line-through;
}
```

## Target

Transitions declared on the **base** rules so both directions ease — tick (gaining
`.action-done`) and untick (losing it) resolve their after-change style against
`.action-item` / `.action-item label`. The strike-through itself cannot transition
(CSS does not animate `text-decoration`); it appears instantly and that is fine — the
checkbox tick, background and color already carry the cue.

```css
/* target — app/globals.css (tokens, no fallbacks) */
.action-item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.85rem var(--space-4);
  background: var(--surface);
  transition: background var(--duration) var(--ease);
}
```

```css
/* target — app/globals.css */
.action-item label {
  margin: 0;
  font-weight: 500;
  font-size: 1.05em;
  cursor: pointer;
  transition: color var(--duration) var(--ease);
}
```

Leave `.action-done` and `.action-done label` (lines 1141-1148) byte-for-byte unchanged.

## Repo conventions to follow

- Exemplar: `.chip` at `app/globals.css:1226-1227` —
  `transition: background var(--duration) var(--ease), …` (note the repo writes the
  property as `background`, not `background-color`; match it).
- Tokens from `app/tokens.css`: `--duration: 220ms`, `--ease: cubic-bezier(0.16, 1, 0.3, 1)`.
- Reduced motion: the global block at `app/globals.css:1281-1289` collapses it — do NOT
  add a per-rule block (settled convention).

## Steps

1. `app/globals.css` `.action-item` (rule ends line 1100): add
   `transition: background var(--duration) var(--ease);` as its final declaration.
2. `app/globals.css` `.action-item label` (rule ends line 1121): add
   `transition: color var(--duration) var(--ease);` as its final declaration.
3. Touch nothing else — `.action-done`, `.action-done label`, the checkbox rule
   (`app/globals.css:1102-1109`), badges and deadline chips stay as they are.

## Boundaries

- Do NOT put the transition on `.action-done` — that would ease only the tick
  direction and leave the untick snapping.
- Do NOT attempt to animate `text-decoration` (impossible in CSS) or replace the
  strike with an animated pseudo-element (out of scope; the strike is a static cue).
- Do NOT change markup/JSX (`components/modes/ActionMode.tsx`), colors, spacing, or
  the checkbox's `accent-color`.
- Do NOT add new dependencies, tokens, or `prefers-reduced-motion` blocks.
- If the code at these lines doesn't match (drift since commit f1b6c3a), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm test` (expect 146/146 — includes
  the tokens/color-literal suite), `npm run build` (compiles).
- **Feel check**: dev server on http://localhost:3001, transform a demo page, open
  Action mode, then:
  - Tick a checkbox: background eases from `--surface` to `--done-bg` over 220ms on
    the expo-out curve; label color eases with it; the strike-through appears with the
    tick (instant — expected).
  - Untick: background and color ease back (proves the transition lives on the base
    rule; a snap-back on untick means it was placed on `.action-done` — wrong).
  - Spam-tick two rows quickly: each retargets smoothly from its current color —
    no flashing, no stuck mid-state.
  - DevTools Animations panel at 10% playback: one background-color/color transition
    ≈ 220ms per direction; no transform, no layout animation.
  - Rendering → emulate `prefers-reduced-motion: reduce`: state flips instantly,
    checkbox tick and strike still present (meaning never lives in the motion).
- **Done when**: tick and untick both ease in both directions, static cues (tick,
  strike, background) survive reduced motion unchanged, mechanical checks pass.
