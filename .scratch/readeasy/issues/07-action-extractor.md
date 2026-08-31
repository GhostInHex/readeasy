# 07: Action Extractor mode

**What to build:** The Action Mode renderer — the demo's centerpiece. `actionItems` from the restructured JSON render as an interactive checklist: checkbox per item, urgency badge (high/medium/low), deadline highlighted where present. Checking an item persists only in page state. This is the "10 paragraphs of legalese → 3 checkboxes" moment.

**Blocked by:** 05 (mode framework; un-stub Action).

**Files you touch:** the Action renderer file + its registry line, mode-scoped styles.

**Status:** ready-for-agent

- [ ] Action mode shows a checklist of all `actionItems` with urgency badges
- [ ] Deadlines render prominently when present
- [ ] Checkboxes toggle state
- [ ] Demo trio pages produce meaningful checklists (spot-check all three fixtures)
- [ ] All tests green
