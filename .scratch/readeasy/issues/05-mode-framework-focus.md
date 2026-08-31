# 05: Mode framework + Focus mode + stubs for all modes

**What to build:** The Mode system. A toggle bar above the right panel listing every Mode: Focus, Dyslexia, Action, Listen, ADHD. **Register all of them now** — Focus fully working, the others as stubs that render "coming soon". Focus mode: one card at a time ("Step 2 of 4") with a progress indicator. This ticket defines the contract every later mode ticket relies on: **a Mode is one new renderer file plus one registry line — nothing else changes.**

**Blocked by:** 04 (real restructured JSON exists).

**Files you touch:** mode registry, mode framework, Focus renderer, stub renderers, mode-bar UI.

**Status:** ready-for-agent

- [ ] Toggle bar lists all five modes; switching works
- [ ] Focus mode shows one card at a time with "Step n of m" progress
- [ ] Dyslexia/Action/Listen/ADHD render as stubs without errors
- [ ] Adding a mode requires only a new renderer file + one registry line (structure proves it)
- [ ] Existing Seam-1 tests still green
