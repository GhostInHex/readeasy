# 004 — Ride the app's rise keyframe for the history list's hydration pop-in

- **Status**: DONE
- **Commit**: f1b6c3a
- **Execution note** (deviation, verified): the module-scoped `animation: rise …` did **not** work — CSS Modules renamed the reference to `HistoryList_rise__…`, a keyframe that does not exist, so the entrance never played. The plan's fallback `:global(rise)` was tried and **rejected by PostCSS** ("Syntax error … Double colon"). Shipped instead as a global class: `.history-enter` in `app/globals.css` (reusing the same `rise` keyframe — still one authored vocabulary, no duplicate) applied alongside `styles.history` in `components/HistoryList.tsx`. Verified live: `animation-name` computes to `rise`, 220ms, fill `both`.
- **Severity**: LOW
- **Category**: Missed opportunities (additive entrance, reusing the authored moment)
- **Estimated scope**: 1 file (components/HistoryList.module.css), 1 declaration

## Problem

"Your recent pages" renders `null` on the server and first appears in a `useEffect`
after hydration (`components/HistoryList.tsx:36-38`), so on every load where history
exists the list pops into existence between the transform box and the split view,
shoving the content below it down with no bridge. Frequency: once per session
(rare) — eligible for the entrance budget. The app already owns one entrance
vocabulary for exactly this "content arrives" seam: `@keyframes rise`.

Current, verbatim:

```css
/* components/HistoryList.module.css:10-13 */
.history {
  display: grid;
  gap: var(--space-2);
}
```

## Target

Apply the existing global `rise` keyframe at the standard duration. Enter-only by
construction (`animation`, not transition): the list then holds its natural end state.

```css
/* target — components/HistoryList.module.css (this file's idiom: bare tokens, no fallbacks) */
.history {
  display: grid;
  gap: var(--space-2);
  /* The list mounts after hydration; without this it pops in and shoves the split view
     down. It rides the app's entrance keyframe — `rise` in app/globals.css — at the
     standard duration, once per mount. */
  animation: rise var(--duration) var(--ease) both;
}
```

The keyframe it rides (`app/globals.css:1266-1271`), do not modify it:

```css
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(var(--space-3));
  }
}
```

## Repo conventions to follow

- One authored entrance moment exists (`app/globals.css:1262-1275` — comment block
  states the doctrine: *"One authored moment: the transformed page arrives"*). This
  plan does NOT create a second keyframes block; it reuses `rise` by name so the
  vocabulary stays singular.
- `rise` is declared in global CSS, so it is addressable by name from a CSS module
  (css-modules only renames keyframes defined inside the same file — this file defines
  none, so the name passes through untouched). **This is the plan's one mechanical
  risk — Verification below checks it actually resolves.**
- Duration/curve: `var(--duration)` (220ms, under the 300ms UI budget — deliberately
  shorter than `.reading`'s 400ms page-arrival, because this is utility UI) and
  `var(--ease)`. HistoryList.module.css uses bare `var()` with no fallbacks (file
  header: literals are bugs) — match that.
- Reduced motion: the global block at `app/globals.css:1281-1289` collapses
  `animation-duration` to 0.01ms with fill preserved — the list renders fully visible
  instantly. Do NOT add a per-rule block.

## Steps

1. `components/HistoryList.module.css` `.history` (rule ends line 13): add the
   `animation: rise var(--duration) var(--ease) both;` declaration with the comment
   from Target as the final declaration of the rule.
2. Do not define any `@keyframes` in this file. If you feel one is needed, STOP —
   that means the global `rise` did not resolve; report it instead.

## Boundaries

- Do NOT edit `app/globals.css`, the `rise` keyframe, or `.reading`/`.readability-badge`.
- Do NOT change `components/HistoryList.tsx` (no `data-mounted`, no JS — CSS only).
- Do NOT touch `.row`, `.open`, `.remove`, `.title`, `.meta`, or `app/print.css`
  (print hides the buttons; the heading/note print behavior is pre-existing and out
  of scope).
- No stagger, no exit animation, no second keyframes block, no new dependencies or
  tokens.
- If the code at these lines doesn't match (drift since commit f1b6c3a), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm test` (expect 146/146), `npm run
  build` (compiles).
- **Feel check**: dev server on http://localhost:3001, with ≥1 entry already in
  history (transform any demo page first, then reload), then:
  - Reload the landing: the history list rises from 12px below while fading in over
    220ms, once; nothing below it visibly jumps after the entrance settles.
  - **Keyframes resolution (the mechanical risk)**: DevTools → Elements → select the
    `.history` node → Computed → `animation-name` must read `rise` (not a
    module-hashed name, not `none`), and the Animations panel must show a running
    `rise` entry on load. If `animation-name` is anything else: STOP, report — do not
    inline a duplicate keyframes block.
  - Clear site storage (no history): nothing renders, no animation, no empty box.
  - Rendering → emulate `prefers-reduced-motion: reduce`: list appears instantly and
    fully opaque (0.01ms with fill `both` = end state immediately).
  - Double-reload: entrance re-fires per mount (once per page load) — never loops.
- **Done when**: `animation-name` computes to `rise`, the list rises once per load at
  220ms expo-out, is instantly visible under reduced motion, renders nothing when
  history is empty, and mechanical checks pass.
