# 02: Cache the demo trio (fixtures)

**What to build:** Offline fixtures so the demo can never fail live. For each of the Demo trio pages (IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment; backup: usa.gov/visas): fetch the HTML, save the raw HTML, run the Cleaning step (Readability) to produce cleaned text, and save a full-page screenshot of the messy page. Store all of it as bundled fixtures inside the app repo. No app code changes.

**Blocked by:** None (can start immediately — designed to be done BEFORE Build Day).

**Files you touch:** the fixtures directory only.

**Status:** done

- [x] Fixture set (raw HTML + cleaned text + screenshot) for all three trio pages
- [x] Backup fixture for usa.gov/visas (plus `irs-pub596` as the substantive long-form backup)
- [ ] Each cleaned text is substantive (over ~2000 words) and matches its page — **not achievable for these
      pages.** Cleaning extracts 1,005 / 941 / 560 words from the three trio pages; that is all the prose they
      contain. Each cleaned text does match its page. `irs-pub596` (35,965 words) was added so one dense
      legalese fixture exists.
- [x] Screenshots show the cluttered original pages (nav, alerts, sidebars, footers — verified visually)
- [x] ssa.gov documented in the fixture README as the 403/blocked example (not fixtured)

**Deviations, noted per tracker rule 4**

- Two trio URLs from `CONTEXT.md` no longer work as written: the IRS EITC hub page cleans to 296 words (used
  the "Who Qualifies for the EITC" page instead) and `utdallas.edu/admissions/freshman/apply/` now 404s (used
  `enroll.utdallas.edu/freshman/apply/`).
- Files touched outside `fixtures/`: `public/fixtures/*.png` (Next.js only serves static files from `public/`,
  so screenshots must live there for ticket 10 to display them) and `package.json` (added
  `@mozilla/readability` + `jsdom`, which ticket 03 needs anyway, and dev-only `puppeteer-core`).
- `fixtures/index.json` is generated as the url → fixture lookup table ticket 10 will match against.
- `usa.gov/visas` cleans to 26 words (client-rendered link hub). Captured as required, but unusable as a demo
  page — see `fixtures/README.md`.
