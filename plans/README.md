# Animation improvement plans — ReadEasy

Written by `improve-animations plan` from commit **f1b6c3a**. Four findings survived the
find-animation-opportunities gate; each has one self-contained plan below. Nothing here
has been applied — plans are read-only output until executed.

## Plans

| Plan | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-press-feedback-flat-controls.md) | Add press feedback to every flat control | MEDIUM | DONE |
| [002](002-async-block-enter-fade.md) | Fade async blocks up instead of teleporting them in | MEDIUM | DONE |
| [003](003-action-done-state-ease.md) | Ease the Action checklist into its done state | LOW | DONE |
| [004](004-history-list-rise.md) | Ride the app's rise keyframe for the history list | LOW | DONE |

## Recommended execution order

**001 → 002 → 003 → 004** (leverage order: 001 touches every interaction; 002 fixes the
largest content teleport; 003/004 are polish).

**Dependencies:** none are hard dependencies — plans target disjoint rules. Same-file
adjacency to execute sequentially (or expect trivial merges if parallelized):

- `app/globals.css` — touched by 001, 002, 003 (different rules in each)
- `components/AskPanel.module.css` — touched by 001 (`.suggestion`) and 002 (`.answer`)

## How to execute

- Any agent, e.g. `improve-animations execute <plan>`, or hand the single plan file to
  any executor — each plan carries its own verbatim current code, exact target values,
  scope boundaries, and feel-check; zero conversation context required.
- Every plan's verification ends with `npm run typecheck && npm test && npm run build`
  (146 tests green — includes the `tokens.test.ts` color-literal and contrast suites).
- After a passed plan: mark its Status **DONE** in the table above, and per `AGENTS.md`
  commit the applied changes with a concise conventional commit message (one commit per
  plan keeps review clean). This `plans/` directory itself is untracked — commit it
  separately if you want it versioned; the planning session itself makes no commits.
- Feel checks need the dev server (`npm run dev`) — as of writing, running on
  http://localhost:3001 (port 3000 occupied).

## Conventions every plan inherits (do not re-litigate)

- Tokens: `--duration: 220ms`, `--ease: cubic-bezier(0.16, 1, 0.3, 1)` (`app/tokens.css`).
- One authored entrance: `@keyframes rise` (`app/globals.css:1266`); plans reuse it,
  never duplicate it.
- Reduced motion: single global block (`app/globals.css:1281-1289`) collapses durations
  to end-state — no per-rule `prefers-reduced-motion` blocks anywhere.
- Motion doctrine comment lives at `app/globals.css:1262-1265`.
