# 12: Readability score (STRETCH)

**What to build:** A pure-function readability calculator (standard formula, e.g., Flesch-Kincaid — no AI). Shows a badge on the transformed view: "Original: college level → ReadEasy: grade 5". Computed from `cleanedOriginal` vs the flattened simplified text.

**Blocked by:** 04 — **but per the tracker rules, STRETCH tickets only start after every non-stretch ticket is complete.**

**Files you touch:** the readability pure function + its Seam-2 test, badge UI on the right panel.

**Status:** ready-for-agent (stretch-gated)

- [ ] Function unit-tested at Seam 2 (known texts → known grades)
- [ ] Badge renders original vs transformed grade for the trio fixtures
- [ ] Handles very short/empty text gracefully
- [ ] All tests green
