# 10: Screenshot left panel for cached trio

**What to build:** For the Demo trio URLs, the left panel shows the bundled screenshot of the messy original page (from ticket 02's fixtures) instead of the cleaned text. URL matching against cached fixtures; every other URL keeps the default `cleanedOriginal` text panel. This makes the video's "before" cinematic and the live path failure-proof.

**Blocked by:** 02 (fixtures exist) and 03 (left panel exists).

**Files you touch:** left-panel component, fixture matching helper.

**Status:** ready-for-agent

- [ ] Trio URLs render their bundled screenshot on the left
- [ ] Non-cached URLs still render `cleanedOriginal` text (default rule unchanged)
- [ ] Missing/failed fixture falls back to text, never an error
- [ ] All tests green
