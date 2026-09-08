# AI Builders Hackathon — Submission Checklist (ReadEasy)

> Branch: `hackathon/ai-builders` · Base repo: https://github.com/GhostInHex/readeasy

## Title

**ReadEasy — the web, made readable for every reader.**

## Tagline

Restructures any web page into clear, accessible formats for readers with dyslexia, ADHD, or low vision — rewritten in plain language, with deadlines extracted into simple checklists.

## Description (Devpost-ready)

Web pages full of ads, sidebars, legalese, and buried deadlines are hard to read — and much harder for readers with dyslexia, ADHD, or low vision. Browser reader modes strip styling but keep the original wording and structure.

**ReadEasy** is a web app: paste a URL (or raw page text for blocked sites) and get a split-screen result — the cleaned original on the left, an accessible, plain-language version on the right with toggleable Modes (Focus cards, Dyslexia/Bionic, Action checklist, Listen with karaoke highlighting, ADHD micro-cards). An **Ask this page** box answers questions grounded only in that page's text, and a **Reading level** toggle switches between Standard and Simpler variants. The AI only reshapes text already on the page and never invents facts; the side-by-side view lets any reader verify.

Health-literacy framing: bureaucratic pages become checklists — "what do I need to do, and by when?" — directly addressing missed benefits/health/education deadlines.

## Problem

- Walls of text, bureaucratic syntax, and buried action items on government/health/education pages.
- Reader modes keep wording and structure; they don't rewrite or extract deadlines.
- Disproportionate burden on dyslexic, ADHD, and low-vision readers; universal time tax.

## Solution

One-button **Transform**: Fetch & Clean (Readability, no AI) → Restructure (OpenRouter, strict JSON, one retry) → Render (mode registry). Stateless, no DB, no auth, deployed on Vercel.

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript
- Mozilla Readability + jsdom (cleaning)
- OpenRouter (LLM restructuring, JSON schema, fallback model chain)
- Vercel (deploy), browser `speechSynthesis` (Listen)

## Links

| Item | URL |
|---|---|
| **GitHub (submission branch)** | https://github.com/GhostInHex/readeasy/tree/hackathon/ai-builders |
| **GitHub (repo root)** | https://github.com/GhostInHex/readeasy |
| **Live demo (submission branch)** | [Live Demo](https://readeasy-ai-builders.vercel.app) |
| **Deck** | `docs/AI_BUILDERS_DECK.md` (in this branch) |
| **Disclosure** | `HACKATHON_DISCLOSURE.md` (in this branch) |
| **Demo video** | _placeholder — upload to YouTube/Loom and paste link here (5 min max)_ |
| **Devpost** | https://ai-builders-hackathon-2026.devpost.com |

## Demo Video

- [ ] Record 5 min max (AI Builders requires ≤5 min): problem (30s) → paste URL, Transform, split-screen (45s) → modes: Focus, Dyslexia/Bionic, Action, Listen karaoke, ADHD micro-cards (2 min) → Ask this page + Reading level (45s) → readability score + close (30s).
- [ ] Record against **cached demo trio** (IRS EITC, UT Dallas Apply, USCIS Students) so it never fails; show at least one live URL paste + raw-text fallback mention.
- [ ] Upload (YouTube unlisted or Loom) and paste URL in table above + Devpost field.
- [ ] Add captions / transcript for accessibility.

## Setup Instructions (for judges / local run)

Requires Node.js 22.x.

```bash
git clone https://github.com/GhostInHex/readeasy.git
cd readeasy
git checkout hackathon/ai-builders
npm install
cp .env.example .env.local   # add your OPENROUTER_API_KEY (see below)
npm run dev                  # http://localhost:3000
```

Without an API key the app still builds and runs — Restructure returns a canned stub so the UI and all Modes remain usable:

```bash
npm run typecheck      # tsc --noEmit — must pass
npm test               # node:test suites in tests/
npm run build          # production build
npm run verify:trio    # live-transform the demo trio and schema-check answers
```

### Environment variables

See `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | for real transforms | OpenRouter key ([get one](https://openrouter.ai/keys)) |
| `OPENROUTER_MODEL` | no | Overrides default restructure model |
| `OPENROUTER_FALLBACK_MODELS` | no | Comma-separated fallbacks tried in order |
| `READEASY_LLM_MODE` | no | `stub` forces canned stub (used by tests) |

## Submission Checklist (Devpost)

- [ ] Devpost project created for **AI Builders Hackathon (ai-builders-hackathon-2026.devpost.com)** before Sep 15, 2026 @11pm EDT
- [ ] **GitHub link** set to submission branch: https://github.com/GhostInHex/readeasy/tree/hackathon/ai-builders (repo public)
- [ ] **Live demo URL** set to [Live Demo](https://readeasy-ai-builders.vercel.app)
- [ ] **Demo video** (≤5 min) uploaded and linked
- [ ] **Deck** — 10 slides: export `docs/AI_BUILDERS_DECK.md` to PDF/Google Slides and upload/link (Devpost deck field)
- [ ] **Disclosure** — keep `HACKATHON_DISCLOSURE.md` in repo root; Devpost "built on existing project" field points to it
- [ ] **Theme fit** — tagline/description emphasize "AI for real problems" + health-literacy/accessibility framing
- [ ] **Public repo** — confirm repo is public and branch is pushed (after local commit)
- [ ] Test live demo with a non-trio URL + raw-text paste before submitting

## Provenance (for reviewers)

- Pre-existing pipeline (Readability + `POST /api/transform` + `components/modes/registry.ts` + `fixtures/` demo trio) built for Buildverse Sep 1-6, 2026 — disclosed in `HACKATHON_DISCLOSURE.md`.
- New work in this branch during Aug 21-Sep 15 window: health-literacy reframing, polish, deck/video/disclosure. This commit is the window's delta. Complies with "All submissions must be created during hackathon period."

## Quick Verify

```bash
npm run typecheck
npm test
npm run build
```

All must be green before recording the video.
