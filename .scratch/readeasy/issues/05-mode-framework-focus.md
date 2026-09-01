# 05: Mode framework + Focus mode + stubs for all modes

**What to build:** The Mode system. A toggle bar above the right panel listing every Mode: Focus, Dyslexia, Action, Listen, ADHD. **Register all of them now** — Focus fully working, the others as stubs that render "coming soon". Focus mode: one card at a time ("Step 2 of 4") with a progress indicator. This ticket defines the contract every later mode ticket relies on: **a Mode is one new renderer file plus one registry line — nothing else changes.**

**Blocked by:** 04 (real restructured JSON exists).

**Files you touch:** mode registry, mode framework, Focus renderer, stub renderers, mode-bar UI.

**Status:** done

- [x] Toggle bar lists all five modes; switching works
- [x] Focus mode shows one card at a time with "Step n of m" progress
- [x] Dyslexia/Action/Listen/ADHD render as stubs without errors
- [x] Adding a mode requires only a new renderer file + one registry line (structure proves it)
- [x] Existing Seam-1 tests still green

## Notes

- `components/modes/registry.ts` is the single list. A Mode is `{ id, label, description, Renderer }`;
  `ModeBar` and `ReadingView` read the registry and know nothing about individual modes, so tickets
  06–08 and 11 each add one renderer file and one line here.
- `tests/modes.test.ts` (new) checks the registry contract only — five unique ids, each with a
  renderer/label/description, Focus as default, unknown ids falling back to Focus. Mode *rendering*
  stays out of automated tests per the spec's "no automated UI tests".
- Verified live against `next start` with `READEASY_LLM_MODE=stub` driving a real browser: mode bar
  renders `Focus / Dyslexia / Action / Listen / ADHD`, Focus showed "Step 1 of 4" and advanced to
  "Step 2 of 4" on Next, and each stub rendered its "coming soon" panel with no console or page
  errors. 23 tests green, typecheck clean, production build clean.

## Deviations, noted per tracker rule 4

- Touched three files outside the stated scope, all to host the mode bar:
  - `components/RightPanel.tsx` now delegates to the new `ReadingView` instead of rendering the flat
    section list and action-item preview that ticket 04 put there. Focus is the default Mode, so that
    flat list would have duplicated it, and ticket 07's Action mode owns the checklist. The
    `.actions-preview` / `.badge-*` CSS is left in place for ticket 07.
  - `components/SplitView.tsx` and `components/Workspace.tsx` thread a new `source: TransformRequest | null`
    down to the modes. Nothing uses it yet; ticket 11's ADHD mode needs the original request to ask the
    pipeline for its own `variant`, and adding the prop now keeps that ticket to "one renderer + one
    registry line".
- `app/globals.css` gained the mode-framework and Focus styles (`.mode-bar`, `.mode-description`,
  `.mode-body`, `button.secondary`, `.coming-soon`, `.focus-*`, `.progress-*`).

