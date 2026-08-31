# 09: Cosmetic toggles

**What to build:** Accessibility toggles that are pure CSS — no AI, no mode logic. Text size (S/M/L), line spacing (normal/wide), and a high-contrast/dark theme. Implemented as CSS variables applied at the reading-view level, working across all modes. Preference persists in localStorage.

**Blocked by:** 04 (reading view exists). Independent of the mode framework — can run in parallel with 05.

**Files you touch:** toggle-bar UI component, CSS variables/theme file, localStorage hook.

**Status:** ready-for-agent

- [ ] Text size, line spacing, and dark/high-contrast each toggle and combine
- [ ] Toggles apply across all modes, including stubs
- [ ] Preference survives a page reload
- [ ] No changes to the transform route or LLM code
- [ ] All tests green
