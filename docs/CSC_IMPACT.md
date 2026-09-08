# CSC Impact — School Problem ReadEasy Solves

> Judging: Impact + Learning + Functionality. School-life problem, real users, no invented data.

## The School Problem

**UT Dallas First-Year Apply is a wall of deadlines buried in paragraphs.**

The live first-year admissions page (`enroll.utdallas.edu/freshman/apply/` — fixture `fixtures/utdallas-first-year-apply/`, captured 2026-09-01) presents every deadline, requirement, and checklist item as dense prose. Deadlines sit mid-sentence, prerequisites span multiple paragraphs, and "required / recommended / optional" all look typographically identical. For a 17-year-old applying to college for the first time, the cognitive load is high; for a student with ADHD, dyslexia, or low vision, it is exclusionary.

This is not a UT Dallas-specific bug — it is the pattern across admissions, financial-aid, and enrollment pages (IRS EITC, USCIS Students & Employment show the same structure in the demo trio). But UT Dallas Apply is the canonical school-life example for this CSC submission: **if you miss the buried date, you miss admission**.

**Proof of the problem:** the left panel of ReadEasy shows the cleaned original (or the pre-captured screenshot `public/fixtures/utdallas-first-year-apply.png` for the demo) exactly as the student would encounter it. The right panel is the restructured version — the delta is the impact.

## Who Is Affected

- **First-generation applicants** — no family precedent for parsing admissions bureaucracy; deadlines that are implied rather than listed become silent failure modes.
- **Neurodivergent students (ADHD, dyslexia)** — walls of text, inconsistent heading hierarchy, and absent visual chunking disproportionately increase reading time and error rate. Person-first framing; no pity language.
- **Students with low vision / reading fatigue** — small type, low contrast, and long paragraphs compound the burden.
- **All students under time pressure** — even typical readers skim and miss a "must submit by December 1" that sits in paragraph three.

The harm is concrete: missed deadlines, incomplete checklists, and late discovery of required forms — each with real admissions consequences.

## Why ReadEasy Is Useful (What It Does About the Problem)

ReadEasy restructures any bureaucratic page — URL or pasted raw text — into formats a student can actually act on:

- **Action checklist** — `actionItems[{task, urgency, deadline}]` extracted from the source text and rendered as "Step 2 of 4" with explicit urgency (`high` = required/time-bound, `medium` = recommended, `low` = optional) and deadline copied as written. Turns "you must submit..." paragraphs into a doable list.
- **Focus cards** — one card at a time with a progress indicator; never a wall of text. Proven for ADHD readers.
- **ADHD micro-cards** — one idea per screen, max two sentences, key words bolded (`**April 15**`), headings of 2–5 words; the same page split into 6–14 scannable cards.
- **Dyslexia mode** — OpenDyslexic font, warm background tint, Bionic Reading (`lib/bionic.ts` pure function) that bolds the leading half of each word so eye anchoring is easier.
- **Listen + Karaoke highlighting** — browser `speechSynthesis` reads the simplified text while each word highlights in sync; supports auditory learners and low-vision readers.
- **Reading level (Simpler/Standard)** — same content at ~grade 3 vs. ~grade 5; simpler keeps every deadline/amount/requirement ("Simpler means easier words, never less of the page").
- **Ask this page & readability score** — grounded Q&A over the cleaned text (demo answers pre-cached) and original→transformed grade score for transparency.

Crucially, **the original stays visible on the left** (`CONTEXT.md:105` left panel rule). A student or counselor can verify nothing was dropped or invented. The AI only reshapes text already on the page — never adds outside facts (`lib/llm/prompt.ts` SHARED_RULES).

## Demo Trio + Fallback as Proof the Solution Generalizes

- **Demo trio** (fixtures captured 2026-09-01, `fixtures/README.md`):
  - `irs-eitc` (IRS Who Qualifies for EITC, 1,005 words) — benefits/eligibility bureaucracy.
  - `utdallas-first-year-apply` (UT Dallas First-Year Apply, 941 words) — **lead CSC example**.
  - `uscis-students-employment` (USCIS Students and Employment, 560 words) — immigration/employment rules students encounter.
- **Fallback proof:** `ssa.gov` returns HTTP 403 to non-browser fetches (verified 2026-09-01; `enroll.utdallas.edu` does the same). The **Raw text paste** path (`{rawText}` to `POST /api/transform`) covers every blocked page — paste the page text, same restructure, no network dependency. `npm run verify:trio` schema-checks the pipeline end-to-end.

These three pages demonstrate that the same pipeline — Fetch & Clean (no AI) → Restructure (strict JSON, one retry, fallback models `OPENROUTER_FALLBACK_MODELS`) → Render (registry) — handles admissions, financial, and regulatory text without per-page customization.

## Impact if Widely Used

- Fewer missed deadlines for first-gen and neurodivergent applicants.
- Less counselor triage on "where is the deadline?" questions; more time for advising.
- A reusable pattern for any school district: point any bureaucratic URL at ReadEasy and get a checklist, cards, and listenable version in seconds — no integration, no database, no account.

## How to Verify

1. Open the live demo: [readeasy-csc.vercel.app](https://readeasy-csc.vercel.app)
2. Paste `https://enroll.utdallas.edu/freshman/apply/` (or use the pre-cached UT Dallas fixture) → Transform → compare left (original) vs. right (Action checklist + Focus).
3. Toggle Dyslexia / ADHD / Listen karaoke. Try a non-trio school page. Try the raw-text paste with a few paragraphs copied from any blocked page.

