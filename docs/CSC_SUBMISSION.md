# CSC Back-to-School — Submission Checklist (ReadEasy)

> Branch: `hackathon/csc` · Base repo: https://github.com/GhostInHex/readeasy · Window: Sep 4–Oct 4, 2026

## Project Name

**ReadEasy — the web, made readable for every reader.**

## Problem (School-Life)

Bureaucratic school pages (exemplar: **UT Dallas First-Year Apply** — `enroll.utdallas.edu/freshman/apply/`) bury deadlines and required steps inside walls of paragraphs. Students with dyslexia, ADHD, low vision — and especially first-generation applicants with no family precedent — miss deadlines because "required / recommended / optional" all look identical and dates sit mid-sentence. Harm = missed admission/financial-aid deadlines. See `docs/CSC_IMPACT.md`.

## What It Does

Paste a URL (or raw page text for blocked sites like `ssa.gov` 403) → `POST /api/transform` returns `{cleanedOriginal, restructured}` → split view: **left = cleaned original** (or screenshot for cached demo trio, `CONTEXT.md:105`), **right = accessible version** with toggleable Modes:

- **Focus** — one card at a time + progress, no wall of text
- **Dyslexia/Bionic** — OpenDyslexic, warm tint, `lib/bionic.ts` bolded word-starts (pure function, no AI)
- **Action** — `actionItems[{task, urgency, deadline}]` checklist ("Step 2 of 4")
- **Listen** — browser `speechSynthesis` + karaoke word highlighting
- **ADHD** — micro-cards: one idea per screen, ≤2 sentences, key words `**bolded**`
- **Reading level** — Simpler (~grade 3) / Standard (~grade 5); simpler keeps every deadline/amount
- **Ask this page** — grounded Q&A over cleaned text (demo answers pre-cached for trio)
- **Other:** readability score, text size / line spacing / high-contrast (CSS-only), history (localStorage), print-friendly export. No DB, no auth.

The AI only reshapes text already on the page into strict JSON; it never invents facts — verifiable side-by-side.

## Demo

| Item | Link / Location |
|---|---|
| **Live demo (submission branch)** | [readeasy-csc.vercel.app](https://readeasy-csc.vercel.app) |
| **Screenshots** | `public/fixtures/*.png` (UT Dallas, IRS EITC, USCIS) + in-app split view |
| **Demo video** | _upload to YouTube unlisted or Loom (≤5 min) and paste link here + Devpost field_ — suggested arc: problem (UT Dallas wall of text, 30s) → paste URL → Transform → split-screen (45s) → Focus / Dyslexia / Action / Listen karaoke / ADHD (2 min) → Ask this page + Simpler toggle (45s) → readability score + close (30s). Record against cached trio so it never fails; show one live non-trio paste + raw-text fallback. |
| **Fixtures (offline demo proof)** | `fixtures/` (`cleaned.txt` + `meta.json` + `public/fixtures/*.png`), `fixtures/README.md` |

## How It Works (for "Explain how it works" field)

One server route owns the pipeline:

1. **Fetch & Clean (no AI)** — fetch HTML, strip ads/nav/scripts with Mozilla Readability + jsdom.  
2. **Restructure (LLM via OpenRouter)** — cleaned text → strict JSON `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}` (see `lib/llm/prompt.ts` `RESTRUCTURE_SCHEMA_TEXT` + `SHARED_RULES`). One retry on malformed JSON (`RETRY_NUDGE`), fallback chain `OPENROUTER_FALLBACK_MODELS`.  
3. **Render** — every Mode is a client-side renderer of that same JSON (`components/modes/registry.ts`); adding a Mode = one registry line + one file.

## Tools / Tech / APIs / AI

- **Stack:** Next.js 15 (App Router), React 19, TypeScript, Vercel (deploy)
- **LLM:** OpenRouter (`minimax/minimax-m3:free` primary, `z-ai/glm-5.2:free` / `openrouter/free` fallbacks; configurable via `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS`) — see `lib/llm/openrouter.ts`, `lib/llm/fallback.ts`, `lib/llm/prompt.ts`, `lib/llm/types.ts`, `lib/llm/stub.ts`
- **Cleaning:** Mozilla Readability 0.6.0 + jsdom 24.x (no AI)
- **Speech:** browser `speechSynthesis` (Listen karaoke)
- **Pure helpers:** `lib/bionic.ts` (Bionic), `lib/readability.ts` (grade score), `lib/history.ts` (localStorage)
- **Datasets / fixtures:** cached demo trio (IRS EITC, UT Dallas Apply, USCIS Students; backups in `fixtures/README.md`); `ssa.gov` 403 as raw-text fallback proof
- **Open-source:** listed above + `package.json` deps; licenses credited in `AI_DISCLOSURE.md`

## AI Disclosure

- **File:** `AI_DISCLOSURE.md` (also summarized in `HACKATHON_DISCLOSURE.md`)
- **One-liner for Devpost:** AI used only to restructure already-cleaned page text into strict JSON (`lib/llm/prompt.ts` schema + no-invented-facts/person-first rules, one retry, fallback chain); cleaning, Bionic, cosmetic toggles, and karaoke are non-AI. Verifiable side-by-side (`CONTEXT.md:105` left panel rule).

## Team Members

- _Fill: names, roles, school (ages 13–18 per CSC eligibility). Solo is allowed (team of 1)._

## Source Code

- **Repo (public):** https://github.com/GhostInHex/readeasy
- **Submission branch (public link for judges):** https://github.com/GhostInHex/readeasy/tree/hackathon/csc
- **Branch deploy:** [readeasy-csc.vercel.app](https://readeasy-csc.vercel.app)
- **Disclosure:** `HACKATHON_DISCLOSURE.md` — pre-existing assets vs. CSC-window work (Sep 4–Oct 4), confirms opt-in 1–6

## Judging Criteria — Where to Point Judges

- **Learning:** `AI_DISCLOSURE.md` — prompt/schema/retry/fallbacks with file:line refs; human oversight via left panel (`CONTEXT.md:105`).
- **Design:** warm & calm tokens (cream/off-white, deep ink, Atkinson Hyperlegible + OpenDyslexic), side-by-side skeleton, generous spacing/large type.
- **Creativity:** semantic restructuring vs. reader-mode stripping; ADHD micro-cards + Action checklist + Simpler level as novel accessibility shapes.
- **Functionality:** URL + raw-text paths; `npm run typecheck` / `npm test` / `npm run build` / `npm run verify:trio` all green; `ssa.gov` 403 → raw-text fallback.
- **Impact:** `docs/CSC_IMPACT.md` — UT Dallas Apply wall-of-deadlines problem, first-gen + neurodivergent users, generalized trio proof.

## Setup Instructions (for judges / local run)

Requires Node.js 22.x.

```bash
git clone https://github.com/GhostInHex/readeasy.git
cd readeasy
git checkout hackathon/csc
npm install
cp .env.example .env.local   # add OPENROUTER_API_KEY (https://openrouter.ai/keys)
npm run dev                  # http://localhost:3000
```

Without a key the app still builds and runs — Restructure returns a canned stub so the UI and all Modes remain usable:

```bash
npm run typecheck      # tsc --noEmit — must pass
npm test               # node:test suites in tests/
npm run build          # production build
npm run verify:trio    # live-transform the demo trio and schema-check answers
```

### Environment variables (see `.env.example`)

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | for real transforms | OpenRouter key |
| `OPENROUTER_MODEL` | no | Override default restructure model |
| `OPENROUTER_FALLBACK_MODELS` | no | Comma-separated fallback models in order |
| `READEASY_LLM_MODE` | no | `stub` forces canned stub (used by tests) |

## Submission Checklist (Devpost — https://csc-back-to-school.devpost.com)

- [ ] Devpost project created for **CSC Back-to-School** before Oct 5, 2026 @12:00am PDT (12:00 PM PT)
- [ ] Project connects to back-to-school theme — description names UT Dallas Apply + student accessibility
- [ ] **GitHub link** set to submission branch: https://github.com/GhostInHex/readeasy/tree/hackathon/csc (repo public, branch pushed)
- [ ] **Live demo URL** set to [readeasy-csc.vercel.app](https://readeasy-csc.vercel.app)
- [ ] **Demo video** (and/or screenshots + demo link) uploaded and linked
- [ ] **AI disclosure** — link or paste `AI_DISCLOSURE.md`; form field "How did you use AI?" points to it
- [ ] **Open source / public link** confirmed (CSC opt-in 1–2)
- [ ] **Permission to feature** and contact acknowledged (CSC opt-in 3–4)
- [ ] Can explain what was built / how it works / AI role (CSC opt-in 5–6) — rehearse 60-sec answer from AI_DISCLOSURE.md §5
- [ ] Tested live demo with a non-trio school URL + raw-text paste before submitting
- [ ] No private/sensitive student data collected; no harm/cheating/harassment content

## Provenance (for reviewers)

- Pre-existing pipeline (`lib/` Readability + `POST /api/transform` + `components/modes/registry.ts` + `fixtures/` trio) built for BUILDVERSE Sep 1–6, 2026 — disclosed in `HACKATHON_DISCLOSURE.md` as pre-existing, not claimed as CSC work.
- New work on this branch during Sep 4–Oct 4 window: school-specific framing (`docs/CSC_IMPACT.md`), disclosure/docs, README banner — the delta of commit `feat(csc): school impact + AI disclosure for CSC window`.

## Quick Verify

```bash
npm run typecheck
npm test
npm run build
```
