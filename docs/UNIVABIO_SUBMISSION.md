# UnivaBio Submission Checklist — ReadEasy (AI for Human Health)

**Hackathon:** UnivaBio (univabio.devpost.com) — Deadline **Oct 6 @11:45pm EDT** — Theme **AI for Human Health** — 400 participants · $38k  
**Branch:** `hackathon/univabio` — https://github.com/GhostInHex/readeasy/tree/hackathon/univabio  
**Base repo:** https://github.com/GhostInHex/readeasy  
**Live demo (Vercel):** https://readeasy-git-hackathon-univabio-ghostinhex.vercel.app  
**Disclosure:** `HACKATHON_DISCLOSURE.md` (pre-existing Sep 1–6 disclosed; new health work in this commit, Aug 7–Oct 6 window)

Use this checklist to verify every required artifact before submitting on Devpost. Check off each item; do not submit until all are green.

## Required artifacts (Devpost)

- [ ] **Project (website / app / prototype with user interaction)**
  - [ ] Live URL works: https://readeasy-git-hackathon-univabio-ghostinhex.vercel.app
  - [ ] User can paste a URL **or** raw text and get the split view (cleaned original left, restructured right)
  - [ ] Health demo path tested: paste `fixtures/univabio-health/cleaned.json` → `cleanedText` via Raw text tab → restructures to plain language + Action checklist
  - [ ] No auth, no DB; `READEASY_LLM_MODE=stub` fallback verified (builds without `OPENROUTER_API_KEY`)
  - [ ] Link on Devpost points to the branch deploy, not `main`

- [ ] **Demo Video (explains purpose, features, user interaction)**
  - [ ] Length 2–3 min, hosted (YouTube / Loom unlisted), link added to Devpost
  - [ ] Outline covered:
    1. **Purpose (0:00–0:30):** Health literacy barrier — medical jargon → missed care. ReadEasy = plain language + action checklist, never invents facts.
    2. **Features (0:30–1:30):** Paste health URL/raw text → Fetch & Clean → Restructure (~grade 5, key takeaway per section, action items with urgency) → Modes (Focus, Dyslexia, ADHD micro-cards, Listen karaoke, Action checklist) + Ask this page (grounded) + Simpler/Standard + readability score.
    3. **User interaction (1:30–2:30):** Live interaction — paste MedlinePlus Diabetes fixture (or CDC page), show before/after side-by-side, toggle a Mode (e.g., Action checklist), ask a question ("When should I see a doctor?"), show verification (original always visible). Trio fixtures (IRS/UT Dallas/USCIS) as fallback if network blocks.
    4. **Close (2:30–end):** Who it helps (low literacy, dyslexia/ADHD/low vision, caregivers) + branch link.
  - [ ] Captions / narration clear; no secrets on screen; screenshot for health fixture captured live per `fixtures/univabio-health/screenshot-placeholder.md`

- [ ] **One Page Project Description PDF**
  - [ ] Generated from `docs/UNIVABIO_ONE_PAGER.md` (limit: one page when rendered, ~430 words)
  - [ ] Contains: Title + Tagline, Problem (health literacy + jargon), Solution (restructures health pages → plain language + checklist), Key Features (health-specific: plain language restructure, key takeaway per section, action items for appointments/meds), Tech Stack, Health Impact (who benefits, would it help), Demo link
  - [ ] Export: open `docs/UNIVABIO_ONE_PAGER.md` in VS Code → Print → Save as PDF (margins minimum, scale fit-to-one-page) or `pandoc docs/UNIVABIO_ONE_PAGER.md -o docs/UNIVABIO_ONE_PAGER.pdf`
  - [ ] PDF is one page, readable, includes live demo + GitHub branch links in footer
  - [ ] Uploaded to Devpost (not just linked)

- [ ] **GitHub Repository / Code PDF**
  - [ ] GitHub branch link on Devpost: https://github.com/GhostInHex/readeasy/tree/hackathon/univabio
  - [ ] Code PDF generated per `docs/CODE_PDF_GUIDE.md`
  - [ ] Code PDF includes at minimum: `app/api/transform/route.ts`, `lib/clean.ts`, `lib/llm/prompt.ts`, `components/modes/registry.ts` + file tree + cover (branch/date/link)
  - [ ] No secrets in PDF (no `.env`, no keys)
  - [ ] Code PDF uploaded to Devpost

## Branch & disclosure

- [ ] `HACKATHON_DISCLOSURE.md` present on branch (Sep 1–6 pre-existing disclosed; Aug 7–Oct 6 health extension = this commit)
- [ ] `README.md` banner present (UnivaBio submission branch, health focus, `fixtures/univabio-health/`, links to disclosure + one-pager, demo + GitHub URLs)
- [ ] Health fixture present: `fixtures/univabio-health/cleaned.json` (mock MedlinePlus Diabetes, shape `{url, title, cleanedText, fetchedAt}`) + `fixtures/univabio-health/screenshot-placeholder.md`
- [ ] `docs/` present: `UNIVABIO_ONE_PAGER.md`, `CODE_PDF_GUIDE.md`, `UNIVABIO_SUBMISSION.md` (this file)
- [ ] Commit `feat(univabio): health literacy framing + fixture + one-pager for UnivaBio window` on `hackathon/univabio` (do not push until ready; `git log --oneline -3` shows it)

## Pre-flight

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] Live deploy health check: `POST /api/transform` with `{"rawText":"Diabetes is... long enough text..."}` returns `{cleanedOriginal, restructured}`
- [ ] Devpost fields: Project title, tagline, problem/solution, tech stack, track (AI for Human Health), team, links all filled; disclosure referenced

## Links to paste into Devpost

- **Website / App:** https://readeasy-git-hackathon-univabio-ghostinhex.vercel.app
- **GitHub branch:** https://github.com/GhostInHex/readeasy/tree/hackathon/univabio
- **One-pager source:** `docs/UNIVABIO_ONE_PAGER.md` (PDF export of this file)
- **Code PDF guide:** `docs/CODE_PDF_GUIDE.md`
- **Health fixture:** `fixtures/univabio-health/cleaned.json` (MedlinePlus-inspired diabetes page, `fetchedAt: 2026-10-01`)
- **Disclosure:** `HACKATHON_DISCLOSURE.md`

## Notes

- Do not push before video + PDFs are ready unless intentional; branch is the submission artifact.
- Existing trio fixtures (`fixtures/irs-eitc`, `fixtures/utdallas-first-year-apply`, `fixtures/uscis-students-employment`) remain for network-independent demo; health fixture follows the same pattern for PDF/video.
