# 002 — Fade async blocks up instead of teleporting them in

- **Status**: DONE
- **Commit**: f1b6c3a
- **Severity**: MEDIUM
- **Category**: Interruptibility (enter-only via `@starting-style`)
- **Estimated scope**: 2 files (app/globals.css, components/AskPanel.module.css), 2 rules + 2 `@starting-style` blocks

## Problem

Two blocks of fetched content appear from nothing inside/next to the reading column:

1. The Ask-this-page answer card (`components/AskPanel.module.css:92-100`, rendered
   conditionally by `components/AskPanel.tsx:178`).
2. The transform error notice (`app/globals.css:626-630`, rendered conditionally by
   `components/Workspace.tsx:158` and the AskPanel error at `components/AskPanel.tsx:171`).

Both teleport to their final position with no bridge — exactly the "content that
appears with no transition" seam this product's own motion doctrine (`app/globals.css:1262-1265`)
already solves elsewhere with its authored `rise` entrance. Frequency is occasional
(per question / per failed transform), so a standard enter is appropriate.

Current, verbatim:

```css
/* components/AskPanel.module.css:92-100 */
.answer {
  display: grid;
  gap: var(--space-2, 0.5rem);
  border: 1px solid var(--line, #cfc4ac);
  border-top: 2px solid var(--accent, #22406a);
  border-radius: var(--radius-sm, 0.5rem);
  padding: var(--space-4, 1rem);
  background: var(--surface, #fffcf5);
}
```

```css
/* app/globals.css:626-630 */
.notice {
  border-radius: var(--radius);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--line);
}
```

## Target

Enter-only rise using the repo's own `rise` values (`opacity: 0` +
`translateY(var(--space-3))`, i.e. 12px) as a transition, at the standard duration
(`var(--duration)` = 220ms) on the repo's curve (`var(--ease)`). Exit stays instant
(these blocks leave by unmounting; no exit animation is wanted on errors or answers).
Browsers without `@starting-style` support render exactly today's instant behavior —
a graceful fallback by construction.

```css
/* target — components/AskPanel.module.css (this file's fallback idiom: `var(--ease, ease-out)`) */
.answer {
  display: grid;
  gap: var(--space-2, 0.5rem);
  border: 1px solid var(--line, #cfc4ac);
  border-top: 2px solid var(--accent, #22406a);
  border-radius: var(--radius-sm, 0.5rem);
  padding: var(--space-4, 1rem);
  background: var(--surface, #fffcf5);
  transition: opacity var(--duration, 220ms) var(--ease, ease-out),
    transform var(--duration, 220ms) var(--ease, ease-out);
}

/* The answer rises rather than teleporting into the reading column. Enter-only; without
   @starting-style support it appears instantly, which is the behavior before this plan. */
@starting-style {
  .answer {
    opacity: 0;
    transform: translateY(var(--space-3, 0.75rem));
  }
}
```

```css
/* target — app/globals.css (tokens, no fallbacks; place directly after the .notice rule) */
.notice {
  border-radius: var(--radius);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--line);
  transition: opacity var(--duration) var(--ease), transform var(--duration) var(--ease);
}

/* Notices rise rather than teleporting into the page. Enter-only; without @starting-style
   support they appear instantly. */
@starting-style {
  .notice {
    opacity: 0;
    transform: translateY(var(--space-3));
  }
}
```

## Repo conventions to follow

- The authored entrance this extends: `@keyframes rise` at `app/globals.css:1266-1271`
  — same `from` values (`opacity: 0; transform: translateY(var(--space-3))`), expressed
  as `@starting-style` because these blocks mount conditionally at runtime rather than
  on page load.
- Per-file fallback style: AskPanel.module.css writes `var(--token, fallback)` (see its
  own transition at lines 51-53); globals.css writes bare `var(--token)` (file header:
  a literal is a bug).
- Reduced motion: rely on the global block at `app/globals.css:1281-1289` — do NOT add
  a per-rule `prefers-reduced-motion` block (settled repo convention).
- Both consumers conditionally render (`{result && …}`, `{error && …}`), so the element
  is freshly inserted each time it appears — `@starting-style` re-fires per appearance.
  Do not change that rendering pattern.

## Steps

1. `components/AskPanel.module.css`: in `.answer` (lines 92-100), append the two-line
   `transition` declaration shown in Target before the closing brace; directly after the
   rule's closing brace, add the `@starting-style` block from Target (with its comment).
2. `app/globals.css`: in `.notice` (lines 626-630), append the `transition` declaration
   from Target before the closing brace; directly after the rule's closing brace (before
   `.notice-error`), add the `@starting-style` block from Target (with its comment).
3. Confirm no other selector in either file already declares a transition on
   `.answer`/`.notice` or their children (there is none at f1b6c3a).

## Boundaries

- Do NOT touch `.notice-error`, `.notice-message`, `.notice-hint`, `.asked`, `.body`,
  `.note`, or any JSX — motion declarations on these two selectors only.
- Do NOT add an exit animation (no `transition-behavior`, no fade-out): these blocks
  unmount, and an error must not linger while fading.
- Do NOT animate `role="alert"` content with anything that could delay its insertion —
  `@starting-style` never delays insertion; keep it that way (no `animation-delay`).
- Do NOT add new dependencies, tokens, keyframes, or `prefers-reduced-motion` blocks.
- If the code at these lines doesn't match (drift since commit f1b6c3a), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm test` (expect 146/146; the
  globals.css color-literal test still passes — no colors added), `npm run build`
  (compiles; `@starting-style` parses in all evergreen targets).
- **Feel check**: dev server on http://localhost:3001, then:
  - Transform a demo page (IRS starter), scroll to Ask this page, click a suggested
    question: the answer card rises from 12px below while fading in over 220ms —
    content readable throughout, never blank longer than the fade.
  - Ask a second question: the rise re-fires (the card unmounts while busy, remounts
    with the new answer).
  - Submit an empty-URL transform or break the fetch: the error notice under the box
    rises the same way; the `role="alert"` still announces immediately (check the
    accessibility tree fires on insert).
  - DevTools Animations panel at 10% playback: pure opacity + 12px translate on the
    expo-out curve; no scale, no horizontal movement; total ≈ 220ms.
  - DevTools Rendering → emulate `prefers-reduced-motion: reduce`: block appears
    instantly at full opacity (global block collapses duration) — content must never
    be stuck at `opacity: 0`.
  - Quick-toggle sanity: spam question → question; confirm no state where the answer
    is invisible after the transition should finish (a transition always settles at
    its declared end state — verify visually).
- **Done when**: both blocks enter with the 220ms rise, re-trigger on each appearance,
  announce on time, appear instantly under reduced motion, and mechanical checks pass.
