# GIBC V2 Track 03 — Submission Checklist (Judge Replication)

> **Track:** Global Innovation Build Challenge V2 — Track 03 Open (General Technical Invention)
> **Project:** ReadEasy — generative AI that restructures any web page for accessibility
> **Branch:** `hackathon/gibc-open` | **Repo:** https://github.com/GhostInHex/readeasy
> **Demo (Vercel preview):** https://readeasy-git-hackathon-gibc-open-ghostinhex.vercel.app
> **Deadline:** Sep 21, 2026 @ 11:45pm CST (Taipei UTC+8) | **Build window:** July 11–Sep 21

This checklist lets judges replicate the build from a clean clone.

## 1. Title

**ReadEasy — the web, made readable for every reader.**

Generative AI that restructures any web page into clear, accessible formats for readers with dyslexia, ADHD, or low vision — plain-language rewrite with deadlines extracted into checklists. Unlike reader mode (which only strips styling), ReadEasy performs semantic restructuring and never invents facts.

## 2. Problem Solved

Web accessibility. Public-service and informational pages (IRS, university admissions, immigration) are dense, jargon-heavy walls of text that exclude readers with dyslexia, ADHD, low vision, or limited literacy. ReadEasy makes any URL (or pasted raw text for blocked sites) verifiably readable: cleaned original side-by-side with a plain-language, card-based version.

## 3. How It Works

One server route owns the pipeline: `POST /api/transform` accepts `{url}` or `{rawText}` and returns `{cleanedOriginal, restructured}` or `{error:{code,message,hint}}`.

1. **Fetch** — server-side `fetch()` of the URL HTML (no AI).
2. **Clean** — Mozilla Readability + jsdom strips ads/nav/scripts to plain cleaned text.
3. **Restructure** — LLM via OpenRouter reshapes cleaned text into strict JSON `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}`. One automatic retry on malformed JSON, fallback models in order, never crashes.
4. **Render** — every Mode is a client-side renderer of that same JSON (`components/modes/registry.ts`). No Mode does defensive parsing; adding a Mode is one registry line + one file. `POST /api/ask` answers grounded Q&A over the cleaned text (pre-cached for the demo trio).

Cached fixtures (`fixtures/`) for the demo trio eliminate live-network dependency for the demo path.

## 4. Built With

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Mozilla Readability + jsdom** (cleaning)
- **OpenRouter** (LLM — restructure + ask)
- **Vercel** (deployment, stateless — no database, no auth)

Requires **Node.js 22.x**.

## 5. Setup Instructions (replication)

```bash
# 1. Clone and install
git clone https://github.com/GhostInHex/readeasy.git
cd readeasy
git checkout hackathon/gibc-open
npm install

# 2. Env (live transforms need a key; without it the app still runs via stub)
cp .env.example .env.local
# edit .env.local and set OPENROUTER_API_KEY (https://openrouter.ai/keys)
# optional: OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODELS, READEASY_LLM_MODE=stub

# 3. Run
npm run dev          # http://localhost:3000

# 4. Verify
npm run typecheck    # tsc --noEmit
npm test             # node:test suites in tests/
npm run build        # production build
npm run verify:trio  # live-transform the demo trio and schema-check every answer
```

Without `OPENROUTER_API_KEY` the Restructure step falls back to a canned stub — UI and all Modes remain usable for review.

Environment variables (see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | for real transforms | OpenRouter key |
| `OPENROUTER_MODEL` | no | Override default model |
| `OPENROUTER_FALLBACK_MODELS` | no | Comma-separated fallbacks |
| `READEASY_LLM_MODE` | no | `stub` forces canned stub (tests) |

## 6. Team Information

| Name | Role | Link |
|---|---|---|
| <!-- TODO: replace with real names per GIBC requirement --> |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

> GIBC requires real names. Fill this table before final submission on Devpost (gibc-v2.devpost.com).

## 7. Demo Video (2–5 min, YouTube unlisted)

- **Placeholder / TODO:** Replace with unlisted YouTube URL before submission.
- **Current placeholder:** `https://www.youtube.com/watch?v=REPLACE_ME` (upload 2–5 min walkthrough, set to Unlisted, paste link here and on Devpost).
- **Suggested outline (2–5 min):** 0:00 problem (dense page excludes readers) → 0:30 paste URL → transform (Fetch→Clean→Restructure→Render) → 1:15 split view + Focus cards → 1:45 Dyslexia/Bionic toggle → 2:15 Action checklist + readability score → 2:45 Ask this page (grounded) → 3:15 raw-text fallback for blocked sites → close with impact.
- **Recording tips:** Use fixtures trio pages (see Screenshots Guide) so no network dependency; 1280×720; show side-by-side verification.

## 8. Screenshots (at least 3 required)

Need 3 for Devpost gallery. Spec in `docs/SCREENSHOTS_GUIDE.md`:

1. **Split view** — cleaned original (left) vs Focus card (right).
2. **Dyslexia/Bionic mode** — OpenDyslexic font, warm tint, bolded word starts.
3. **Action checklist + readability score** — extracted deadlines/steps and grade-level drop (e.g., "college level → grade 5").

Capture 1280×720 against the fixtures trio; see guide for exact steps.

## 9. Submission Checklist (GIBC 6 components)

- [x] **Project Description** — this doc + README + `HACKATHON_DISCLOSURE.md`
- [x] **Source Code** — public GitHub `https://github.com/GhostInHex/readeasy` branch `hackathon/gibc-open` with README setup
- [ ] **Demo Video (2–5 min)** — upload unlisted YouTube, replace placeholder above and on Devpost
- [x] **Built With** — listed above (Section 4)
- [ ] **Team Information** — fill real names in Section 6 and on Devpost
- [ ] **Screenshots (≥3)** — capture per `docs/SCREENSHOTS_GUIDE.md`, upload to Devpost

## 10. Links

- **Devpost:** https://gibc-v2.devpost.com
- **Disclosure:** `HACKATHON_DISCLOSURE.md`
- **Screenshots guide:** `docs/SCREENSHOTS_GUIDE.md`
- **Spec:** `.scratch/readeasy/SPEC.md`
- **Context:** `CONTEXT.md`
