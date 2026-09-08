# Hackathon Disclosure — UnivaBio (univabio.devpost.com)

**Project:** ReadEasy — the web, made readable for every reader (health literacy track)  
**Team:** GhostInHex (solo)  
**Repository:** https://github.com/GhostInHex/readeasy  
**Submission branch:** `hackathon/univabio` → https://github.com/GhostInHex/readeasy/tree/hackathon/univabio  
**Hackathon window:** Aug 7 – Oct 6, 2026 (deadline Oct 6 @11:45pm EDT)  
**Theme:** AI for Human Health

## Summary

This disclosure distinguishes **pre-existing work** from **new work created during the UnivaBio window** per Devpost rules.

## 1. Base project — ReadEasy (pre-existing, disclosed)

ReadEasy was built **Sep 1–6, 2026** for the BuildVerse Hackathon (ACM Dallas / HackCulture). That work includes:

- Core Next.js App Router app (`app/api/transform`, `app/api/ask`, `components/modes/`, `lib/`).
- Fetch & Clean pipeline (Mozilla Readability + jsdom, no AI) and Restructure pipeline (LLM via OpenRouter → strict JSON `{title, summary, readingTimeMinutes, actionItems, sections}`).
- Reading Modes: Focus, Dyslexia, Action, Listen (karaoke), ADHD; plus Ask this page, Reading level (Simpler/Standard), readability score, cosmetic controls, history, print export.
- Cached demo trio fixtures: `fixtures/irs-eitc`, `fixtures/utdallas-first-year-apply`, `fixtures/uscis-students-employment` (captured 2026-09-01) with screenshots under `public/fixtures/`.
- Deployed on Vercel; no database, no auth.

All pre-existing code is on `main` and prior commits before this branch diverged. It is **disclosed here as pre-existing** and not claimed as built within the UnivaBio window.

## 2. Extension for UnivaBio — Aug 7 – Oct 6, 2026

During the **UnivaBio window (Aug 7 – Oct 6)** the project was **extended with a health literacy focus**:

- **Reframing:** Health literacy barrier — medical jargon, dense health pages, and unreadable after-visit summaries prevent patients from acting on care. ReadEasy is positioned for **AI for Human Health**: restructuring medical pages into plain language + action checklists for appointments and meds.
- **New health demo fixture:** `fixtures/univabio-health/` added in **this commit** (see below). CDC MedlinePlus-inspired "Understanding Diabetes" page — 3-paragraph cleaned text covering what diabetes is, symptoms, management, and when to see a doctor. Shape: `{url, title, cleanedText, fetchedAt}` mirroring the existing trio pattern (`cleaned.txt`/`meta.json` → simplified `cleaned.json` for this health demo).
- **New disclosure & submission docs (this commit):**
  - `HACKATHON_DISCLOSURE.md` (this file)
  - `docs/UNIVABIO_ONE_PAGER.md` — one-page PDF content (health problem/solution, features, stack, impact, demo link)
  - `docs/CODE_PDF_GUIDE.md` — Code PDF export guide
  - `docs/UNIVABIO_SUBMISSION.md` — submission checklist
  - `README.md` banner noting the UnivaBio branch, health focus, and links
  - `fixtures/univabio-health/screenshot-placeholder.md` — live screenshot capture note

No model weights, private datasets, or closed-source components are introduced. All new work is in **this commit only**.

## 3. What counts as new work for judging

For UnivaBio judging, **only the health framing, health fixture, and submission artifacts listed above** (this commit `feat(univabio): health literacy framing + fixture + one-pager for UnivaBio window`) should be considered as built during Aug 7 – Oct 6. The underlying ReadEasy engine is disclosed prior art that this health extension builds on.

## 4. Compliance

- Pre-existing work is disclosed (Section 1). New work is documented (Section 2) and isolated to this commit.
- No other team's code is included. All fixtures are mock cleaned text (MedlinePlus-inspired, synthetic) or previously captured public government pages disclosed under fair use for accessibility demo.
- Live demo remains: [readeasy-univabio.vercel.app](https://readeasy-univabio.vercel.app)

## 5. Contact

Questions: open an issue on the submission branch or contact via GitHub @GhostInHex.
