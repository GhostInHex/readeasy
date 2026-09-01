# 07: Action Extractor mode

**What to build:** The Action Mode renderer — the demo's centerpiece. `actionItems` from the restructured JSON render as an interactive checklist: checkbox per item, urgency badge (high/medium/low), deadline highlighted where present. Checking an item persists only in page state. This is the "10 paragraphs of legalese → 3 checkboxes" moment.

**Blocked by:** 05 (mode framework; un-stub Action).

**Files you touch:** the Action renderer file + its registry line, mode-scoped styles.

**Status:** done

- [x] Action mode shows a checklist of all `actionItems` with urgency badges
- [x] Deadlines render prominently when present
- [x] Checkboxes toggle state
- [x] Demo trio pages produce meaningful checklists (spot-check all three fixtures)
- [x] All tests green

## Notes

- One checkbox per action item, sorted high → medium → low. Badges read as instructions rather than
  severity words ("Do this" / "Should do" / "Optional") because that is what a reader needs from a
  checklist; the underlying `urgency` values and `.badge-high/medium/low` colours are unchanged.
- Deadlines render as a red "By <deadline>" chip next to the badge, and ticked rows grey out with a
  line-through plus an `aria-live` "n of m done" counter. Ticks are `useState` only — nothing is
  persisted or sent anywhere — and they reset when a new transform arrives.
- Pages that genuinely ask nothing of the reader get an explicit message pointing at Focus mode
  instead of an empty list.
- Spot-checked all three trio fixtures through the real UI (`next start`, stub engine, real browser):
  irs-eitc, utdallas-first-year-apply and uscis-students-employment each produced 4 checkboxes with
  sensible high/low split and no console errors. Also checked mixed-urgency text end to end:
  `Do this {By June 30} / Should do / Should do / Optional`, ticking the first row moved the counter
  to "1 of 4 done" and applied `line-through`.
- Honest limit: the *wording* of each item is only as good as the Restructure engine. On the stub
  engine items are whole sentences lifted from the page, so some read long. Item quality on the real
  model is covered by ticket 04's still-outstanding live verification (`npm run verify:trio` with
  `OPENROUTER_API_KEY`); the checklist structure itself is verified.

## Deviations, noted per tracker rule 4

- The Action registry line from ticket 05 already described this mode, so no registry change was
  needed.
- Removed the now-dead `.actions-preview` and `.deadline` rules from `app/globals.css`. They belonged
  to the flat action preview that ticket 04 put in `RightPanel` and ticket 05 replaced with the mode
  framework; Action mode uses `.action-*` and `.deadline-chip` instead. The `.badge-*` rules are
  still used.

