# 02: Cache the demo trio (fixtures)

**What to build:** Offline fixtures so the demo can never fail live. For each of the Demo trio pages (IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment; backup: usa.gov/visas): fetch the HTML, save the raw HTML, run the Cleaning step (Readability) to produce cleaned text, and save a full-page screenshot of the messy page. Store all of it as bundled fixtures inside the app repo. No app code changes.

**Blocked by:** None (can start immediately — designed to be done BEFORE Build Day).

**Files you touch:** the fixtures directory only.

**Status:** ready-for-agent

- [ ] Fixture set (raw HTML + cleaned text + screenshot) for all three trio pages
- [ ] Backup fixture for usa.gov/visas
- [ ] Each cleaned text is substantive (over ~2000 words) and matches its page
- [ ] Screenshots show the cluttered original pages
- [ ] ssa.gov documented in the fixture README as the 403/blocked example (do not fixture it)
