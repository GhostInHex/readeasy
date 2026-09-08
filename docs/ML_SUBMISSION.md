# ML Empowerment Build Challenge 3.0 — Devpost Submission (ReadEasy)

> Branch: `hackathon/ml-empowerment` — Base repo: https://github.com/GhostInHex/readeasy
> Challenge: https://ml-build-challenge-3.devpost.com — Curriculum: https://mlempowermentfoundation.org/curriculum

## Project Title

**[PLACEHOLDER — Replace before submitting] ReadEasy — the web, made readable for every reader.**

Suggested final title for Devpost: `ReadEasy — the web, made readable for every reader`

## Description

### Problem Statement

The web is inaccessible for neurodivergent and low-vision readers. Pages are walls of text — dense bureaucratic syntax, ads, sidebars, buried deadlines, legalese, and inconsistent headings — that overwhelm readers with dyslexia, ADHD, or low vision. Browser reader modes and ad blockers strip styling but keep the original wording and structure; they do not rewrite, simplify, or extract what the reader must do and by when. The burden falls hardest on students, job-seekers, and families navigating government, health, and education pages where a missed deadline means a missed benefit. (Examples: IRS Earned Income Tax Credit, SSA benefits, university application portals.) Existing tools optimize for sighted, neurotypical skim-readers; they do not provide plain language, focus scaffolding, or deadline extraction.

### Solution Overview

ReadEasy is a web app that restructures any web page into clear, accessible formats. Paste a URL (or raw page text for sites that block fetching, e.g. ssa.gov 403) and get a split view: the **cleaned original on the left**, an **accessible version on the right**. One server route owns the pipeline:

1. **Fetch & Clean (no AI)** — `POST /api/transform` fetches HTML, strips ads/nav/scripts with Mozilla Readability + jsdom.
2. **Restructure (LLM via OpenRouter)** — cleaned text is reshaped into strict JSON `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}` using the prompt in `lib/llm/prompt.ts` (grounded-to-page-text, grade-5 plain language, person-first, hallucination ban). One automatic retry on malformed JSON, fallback model chain, then a structured error — never a crash.
3. **Render (client-side, no AI)** — every Mode is a renderer of that same JSON via `components/modes/registry.ts`; adding a Mode is one registry line + one file.

Answers from **Ask this page** (`POST /api/ask`) are grounded only in the cleaned page text (cached answers for the demo trio so the demo never depends on the network). Every page renders side-by-side with its original so the reader can verify nothing was dropped or invented. Simpler/Standard reading levels are two restructure variants of the same page — simpler means easier words, never less of the page.

### Key Features

Seven modes/features, each a renderer of the same restructured JSON:

1. **Focus** — one card at a time with a progress indicator; never a wall of text.
2. **Dyslexia** — OpenDyslexic font, warm background tint, **Bionic Reading** (bolded word starts for anchor points).
3. **Action** — deadlines and required steps extracted as a checklist ("Step 2 of 4") with urgency (`high`/`medium`/`low`) and verbatim deadlines only when the page states them.
4. **Listen** — read aloud via the browser's `speechSynthesis` with karaoke-style word highlighting in sync.
5. **ADHD** — micro-cards: one idea per screen (6-14 cards, ≤2 sentences each), 2-3 key words bolded with `**` per card, in page order.
6. **Ask this page** — ask questions about the transformed page; answers are grounded only in that page's text, with pre-cached demo answers so judges can verify offline.
7. **Reading level + readability score** — **Simpler/Standard** toggle (grade-3 vs. grade-5 plain language, same coverage) plus **readability score** (original vs. transformed reading grade, e.g. "college level → grade 5"). Also included: text size, line spacing, high-contrast/dark theme (pure CSS, no AI), localStorage page history, and print-friendly export.

### Technologies Used

| Technology | Role |
|---|---|
| **Next.js 15 (App Router)** | Full-stack framework; `app/api/transform` and `app/api/ask` routes |
| **React 19** | UI and mode renderers (`components/modes/`) |
| **TypeScript** | Strict types for restructured JSON and API contracts |
| **Mozilla Readability + jsdom** | Fetch & Clean: strip ads/nav/scripts, extract article HTML |
| **OpenRouter** | LLM restructuring via structured JSON (primary + `OPENROUTER_FALLBACK_MODELS` chain, `READEASY_LLM_MODE=stub` for tests) |
| **Vercel** | Stateless deploy (no DB, no auth); branch deploy for submission |
| **Browser `speechSynthesis`** | Listen mode TTS with karaoke highlighting |
| **node:test + tsx** | Test harness (`tests/*.test.ts`) — HTTP-in/JSON-out, injectable LLM stub |

Stateless: no database, no auth. Requires Node.js 22.x. See `.env.example` for `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODELS`, `READEASY_LLM_MODE`.

### Target Users

- **Primary:** Students and adults with **dyslexia, ADHD, or low vision** who need plain language, focus scaffolding, and deadline extraction to use the web independently.
- **Secondary:** Educators and support workers who prepare accessible versions of government/health/education pages; families navigating benefits, immigration (e.g. USCIS), and tax credit pages; low-vision readers who benefit from Listen + high-contrast + large-type controls.
- **Universal:** Any reader facing bureaucratic pages — the design principle is "what do I need to do, and by when?" as a checklist.

The product uses **person-first, neutral language** throughout (enforced in `lib/llm/prompt.ts` `SHARED_RULES`) and a **side-by-side original** so any user can verify the transform.

### Project Files (for Devpost upload)

Devpost "Project Files" expects screenshots and/or video. Locations in this branch:

- **Screenshots (cached demo trio):** `fixtures/` — cleaned text + screenshots for IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment; additional screenshots can be captured from the live demo at [readeasy-ml.vercel.app](https://readeasy-ml.vercel.app) (Focus / Dyslexia / Action / Listen / ADHD views).
- **Demo video (placeholder before upload):** `demo-output/` — prior demo assets; record a ≤5 min video (problem 30s → paste URL + Transform split-screen 45s → five Modes 2 min → Ask + Reading level 45s → readability score + close 30s) and upload unlisted to YouTube or Loom. Paste the URL in Devpost and below.
- **Screenshots to upload to Devpost:** Capture 3-5 images: (1) split-screen original vs. restructured, (2) Focus card, (3) Dyslexia/Bionic view, (4) Action checklist, (5) ADHD micro-cards. Save to `demo-output/` and attach in Devpost Project Files.

| Item | Location / URL |
|---|---|
| Screenshots | `fixtures/` + live demo captures |
| Demo video | _[PLACEHOLDER — paste YouTube/Loom URL after uploading]_ |
| Deck (if required by judging) | This file + `LEARNING_JOURNEY.md` and `HACKATHON_DISCLOSURE.md` in branch root |
| Live demo | [readeasy-ml.vercel.app](https://readeasy-ml.vercel.app) |
| Submission branch | https://github.com/GhostInHex/readeasy/tree/hackathon/ml-empowerment |

### Team Details

**[PLACEHOLDER — Replace before submitting]**

| Field | Value |
|---|---|
| Team / Submitter Name | _[Your name / team name]_ |
| Contact | _[Email for Devpost contact]_ |
| Members & Roles | _[e.g. Your Name — Design + Frontend + Prompt Engineering; optional collaborators]_ |
| Base repo | https://github.com/GhostInHex/readeasy |
| Submission branch | https://github.com/GhostInHex/readeasy/tree/hackathon/ml-empowerment |
| Learn AI curriculum | Completed via https://mlempowermentfoundation.org/curriculum (Instagram: @mlempowermentfoundation) — see `LEARNING_JOURNEY.md` |

Optional for Devpost "Built with" / tags: `Next.js`, `React`, `TypeScript`, `OpenRouter`, `Accessibility`, `Education`, `Social Impact`.

---

## Setup Instructions (for judges / local run)

```bash
git clone https://github.com/GhostInHex/readeasy.git
cd readeasy
git checkout hackathon/ml-empowerment
npm install
cp .env.example .env.local   # add your OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

Without an API key the app still builds and runs — Restructure falls back to a canned stub so the UI and all Modes remain usable:

```bash
npm run typecheck      # tsc --noEmit — must pass
npm test               # node:test suites in tests/
npm run build          # production build
npm run verify:trio    # live-transform the demo trio and schema-check every answer
```

## Judging Alignment

- **Technical 30%** — strict JSON pipeline, one-retry + fallback chain, injectable LLM stub for deterministic tests, fixture-based verification.
- **Creativity 20%** — five distinct reading Modes from one JSON contract; ADHD micro-cards, Bionic reading, karaoke Listen, reading-level variants.
- **Real-World Impact 20%** — reframes bureaucratic pages as checklists for dyslexic/ADHD/low-vision readers; preserves deadlines, never hallucinates.
- **Design 15%** — split-screen verification, OpenDyslexic + warm tint, focus scaffolding, high-contrast/dark theme, print export.
- **Presentation 15%** — this file + `LEARNING_JOURNEY.md` + `HACKATHON_DISCLOSURE.md` + live demo branch deploy.

## Links

- Curriculum: https://mlempowermentfoundation.org/curriculum
- Instagram: @mlempowermentfoundation
- Challenge: https://ml-build-challenge-3.devpost.com
- Demo: [readeasy-ml.vercel.app](https://readeasy-ml.vercel.app)
- Branch: https://github.com/GhostInHex/readeasy/tree/hackathon/ml-empowerment
