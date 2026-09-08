# GIBC V2 Track 03 — Disclosure

## Statement

Built on ReadEasy (Buildverse Sep 1-6). Extended for GIBC Track 03 during July 11-Sep 21 window with: invention framing as generative AI for accessibility, reproducibility docs, screenshot set prep. Pre-existing pipeline disclosed. New work is this commit.

This document discloses the lineage of this submission branch (`hackathon/gibc-open`) for the Global Innovation Build Challenge V2, Track 03 Open (General Technical Invention).

- **Base repository:** https://github.com/GhostInHex/readeasy
- **Submission branch:** `hackathon/gibc-open`
- **Demo deployment:** [Live Demo](https://readeasy-gibc.vercel.app) (branch deploy fallback: [readeasy-git-hackathon-gibc-open-imvrp555s-projects.vercel.app](https://readeasy-git-hackathon-gibc-open-imvrp555s-projects.vercel.app))
- **GIBC build window:** July 11 – September 21, 2026 (deadline Sep 21 @ 11:45pm CST, Taipei UTC+8)
- **Original build:** ReadEasy was built for Buildverse (Sep 1–6, 2026) by ACM Dallas / HackCulture.

## Pre-existing vs New

### Pre-existing (Buildverse Sep 1–6 — disclosed, not claimed as GIBC-new)

All core product code existed before the GIBC-specific commit:

- **Pipeline:** `POST /api/transform` — Fetch (server-side HTML fetch) → Clean (Mozilla Readability + jsdom, stripping ads/nav/scripts) → Restructure (LLM via OpenRouter returning strict JSON `{title, summary, readingTimeMinutes, actionItems, sections}` with one retry on malformed JSON) → Render (client-side Mode renderers).
- **Modes:** Focus (one card at a time), Dyslexia (OpenDyslexic + warm tint + Bionic Reading), Action (deadlines/steps checklist), Listen (browser speech synthesis + karaoke highlighting), ADHD (micro-cards).
- **Features:** Ask this page (grounded Q&A, pre-cached for demo trio), Reading level (Simpler/Standard toggle), Readability score (original vs transformed), cosmetic controls (text size, line spacing, high-contrast/dark), page history (localStorage), export/print, split-view verification (cleaned original left vs restructured right), raw-text paste fallback for blocked sites.
- **Fixtures & testing:** Cached demo trio (IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment), `npm run verify:trio`, `npm test` suites with stubbed LLM.
- **Stack & deploy:** Next.js 15 (App Router), React 19, TypeScript, Readability + jsdom, OpenRouter, Vercel (stateless, no DB/auth).

### New for GIBC V2 Track 03 (built within July 11–Sep 21 window — this commit)

New work in this commit is limited to invention framing and reproducibility for Track 03:

- **Invention framing as generative AI for accessibility:** Positioning ReadEasy as a generative-AI invention that restructures any web page for accessibility (plain-language rewrite + semantic restructuring, never inventing facts), aligning with Track 03 Open criteria (Creativity / Execution / Impact / Presentation).
- **Reproducibility docs:**
  - `HACKATHON_DISCLOSURE.md` (this file) — lineage and pre-existing vs new disclosure.
  - `docs/GIBC_SUBMISSION.md` — judge replication checklist (setup, verify, test).
  - `docs/SCREENSHOTS_GUIDE.md` — exact 3-screenshot capture spec.
- **README banner:** GIBC submission banner linking disclosure and submission docs.
- **Screenshot set prep:** Specification and preparation of the 3 required screenshots (split view, dyslexia mode, action checklist); captures themselves are against the pre-existing fixtures trio, no new product code.
- **Branch & deployment:** `hackathon/gibc-open` branch and its Vercel preview deployment for judge access.

No new pipeline, model, or Mode logic was added for GIBC beyond disclosure and reproducibility docs — the invention claim rests on the existing generative-AI restructuring pipeline reframed for the GIBC Track 03 window.

## Timeline Compliance

GIBC requires work built July 11 – Sep 21, 2026. This branch was created within that window and all GIBC-specific artifacts (disclosure, submission checklist, screenshot guide, README banner) are authored in this commit. Pre-existing code is explicitly disclosed above per GIBC originality rules.

## Reproducibility

Judges can replicate the build without an API key (stub fallback) or with `OPENROUTER_API_KEY`:

```bash
npm install
cp .env.example .env.local  # add OPENROUTER_API_KEY for live transforms
npm run dev                 # http://localhost:3000
npm run verify:trio         # live-transform trio + schema check
npm test                    # node:test suites
```

See `docs/GIBC_SUBMISSION.md` for the full checklist.
