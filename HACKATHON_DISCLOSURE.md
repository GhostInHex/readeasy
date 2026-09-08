# Practice to Create — Disclosure

> **Hackathon:** Practice to Create (practicetocreate.devpost.com) — Ideathon, deadline Sep 25 @ 11:45pm ICT
> **Submission branch:** `hackathon/practice` | **Base repo:** https://github.com/GhostInHex/readeasy

## Reuse Statement

This submission reuses ReadEasy built for Buildverse Sep 1-6. Reuse is explicitly allowed per Practice rules ('You're allowed to reuse a project you have made before as long as it fits'). New work during Sep 25 window: ideathon framing, slide deck, video script. If AI was used, disclose.

Practice to Create is an ideathon — no code required. This entry reframes the existing working product as an accessible-web solution for ideathon judging on Originality 25%, Presentation 25%, Visuals 25%, Plausibility 25%. Reusing a shipped product is permitted and disclosed here.

## What Is New vs. Pre-existing

### Pre-existing Assets (Built Sep 1-6 for Buildverse — reused as allowed)

- **Application code:** Next.js 15 (App Router) + React 19 + TypeScript codebase — `app/`, `components/`, `lib/`, `fixtures/`, `tests/`, `public/`
- **Pipeline:** `POST /api/transform` (Fetch & Clean with Mozilla Readability → Restructure via OpenRouter → Render) and `POST /api/ask` (grounded Q&A)
- **Reading Modes:** Focus, Dyslexia, Action, Listen, ADHD renderers + registry (`components/modes/registry.ts`)
- **Fixtures & demo trio:** Cached cleaned text + screenshots for IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment
- **UI / Design system:** Warm & calm tokens, Atkinson Hyperlegible, OpenDyslexic, Bionic Reading, high-contrast/dark theme, print export, localStorage history
- **Infrastructure:** Vercel deployment, stateless (no DB, no auth), environment config (`.env.example`)
- **Docs:** `.scratch/readeasy/SPEC.md`, `CONTEXT.md`, `README.md` (pre-practice content)

### New Work During Sep 25 Window (For This Ideathon)

- Ideathon framing: this disclosure file, pitch narrative, and slide-deck outline
- `docs/PRACTICE_PITCH.md` — 3–5 min video script (timed beats, does not exceed 5 min)
- `docs/SLIDES_OUTLINE.md` — 6-slide deck outline optimized for Visuals/Presentation scoring
- `README.md` banner — Practice branch callout with disclosure + pitch + demo links
- Video production (Figma/Canva/slides + screen capture + voiceover) — deliverable for Devpost

No new application code was required for the ideathon; changes in this window are presentation/framing only.

## AI Disclosure

Generative AI was used and is disclosed here, per Practice rules.

- **OpenRouter (LLM):** Used for the Restructure prompt — transforms cleaned page text into strict JSON `{title, summary, readingTimeMinutes, actionItems[], sections[]}`. One retry on malformed JSON, fallback models on failure. Model configurable via `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS`. Not hidden — documented in `README.md`, `CONTEXT.md`, `.scratch/readeasy/SPEC.md`, and `lib/llm/`.
- **Stub fallback:** Without `OPENROUTER_API_KEY`, the app falls back to a canned stub so UI/Modes remain usable — no undisclosed generation.
- **Other AI:** No AI-generated code, images, or video narration hidden from judges. If any slide or voiceover segment used generative AI during production, it is disclosed on the Devpost submission.

## Verification

- **Demo (live):** [Live Demo](https://readeasy-practice.vercel.app)
- **Repo:** https://github.com/GhostInHex/readeasy (branch `hackathon/practice`)
- **Pitch script:** `docs/PRACTICE_PITCH.md`
- **Slides outline:** `docs/SLIDES_OUTLINE.md`
- **Buildverse origin:** Sep 1–6 build window; commit history preserves original authorship.
