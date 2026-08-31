# 06: Dyslexia mode

**What to build:** The Dyslexia Mode renderer. OpenDyslexic font, cream/warm background tint, and Bionic Reading (first half of each word bolded). The Bionic formatter is a pure function with direct Seam-2 tests. Styling is scoped to this mode only.

**Blocked by:** 05 (mode framework; un-stub Dyslexia).

**Files you touch:** the Dyslexia renderer file + its registry line (already a stub), the Bionic pure function + its test, mode-scoped styles.

**Status:** ready-for-agent

- [ ] Dyslexia toggle switches font, tint, and bionic formatting on, and off cleanly
- [ ] Bionic formatter: unit-tested at Seam 2 (edge cases: single words, punctuation, URLs)
- [ ] Other modes are visually unaffected
- [ ] Stub "coming soon" replaced by full renderer
- [ ] All tests green
