# 11: ADHD mode (STRETCH)

**What to build:** A second Restructure variant targeting attention: one idea per micro-card, key words bolded, max two sentences per card, progress carried by the Focus-style step indicator. Implemented as a new restructure prompt variant selected by the ADHD mode; the mode framework contract doesn't change.

**Blocked by:** 05 (framework) — **but per the tracker rules, STRETCH tickets only start after every non-stretch ticket is complete.**

**Files you touch:** the ADHD renderer file + its registry line, the ADHD prompt variant + schema validation for it, seam tests for the new prompt path.

**Status:** ready-for-agent (stretch-gated)

- [ ] ADHD mode returns its own restructured variant for the trio fixtures
- [ ] Micro-cards: one idea, ≤2 sentences, bolded key words
- [ ] Progress indicator works across micro-cards
- [ ] No regression in other modes
- [ ] All tests green
