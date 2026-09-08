# ML Empowerment Build Challenge 3.0 — Disclosure

## Statement

Built on ReadEasy Sep 1-6, extended during challenge window with learning journey integration, social impact framing. Pre-existing disclosed, new work is this commit.

This branch (`hackathon/ml-empowerment`) was built on the ReadEasy codebase originally developed Sep 1-6, 2026 (Buildverse). During the ML Empowerment Build Challenge 3.0 window (through Oct 5, 2026 @5pm PDT), the project was extended with learning-journey integration and social-impact framing for the Learn AI curriculum. All pre-existing work is disclosed below; new work created inside the challenge window is this commit.

This disclosure satisfies Devpost / hackathon rules requiring that pre-existing work be declared and that only work performed inside the challenge window be presented as new.

## Pre-existing Assets (Built Before Challenge Window — Disclosed)

The following were built Sep 1-6, 2026 and pre-date the ML Empowerment window. They are disclosed as pre-existing and reused as foundation:

- **Fetch & Clean pipeline** — server-side `fetch()` + Mozilla Readability + jsdom stripping ads/nav/scripts (no AI). In `lib/clean.ts` / `lib/fetch.ts`.
- **Restructure pipeline** — `POST /api/transform` in `app/api/transform/` accepting `{url}` or `{rawText}` and returning `{cleanedOriginal, restructured}` with strict JSON schema `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}` via OpenRouter. One automatic retry on malformed JSON (`lib/llm/prompt.ts` `RETRY_NUDGE`), fallback model chain in `lib/llm/client.ts`.
- **Prompt engineering** — `lib/llm/prompt.ts` (`SYSTEM_PROMPT`, `RESTRUCTURE_SCHEMA_TEXT`, `SHARED_RULES`, `VARIANT_INSTRUCTIONS`, `READING_LEVEL_RULES`) — person-first language, grade-5 plain language, hallucination ban, grounded-to-page-text constraint.
- **Modes registry** — `components/modes/registry.ts` + per-mode renderers in `components/modes/`: Focus (one card + progress), Dyslexia/Bionic (OpenDyslexic, warm tint, Bionic Reading), Action checklist, Listen (browser `speechSynthesis` + karaoke word highlighting), ADHD micro-cards.
- **Ask this page** — `POST /api/ask` grounded Q&A over cleaned page text, cached answers for demo trio.
- **Reading level toggle** — Simpler/Standard restructure variants (second prompt variant, `ReadingLevel` in `lib/types.ts`).
- **Readability score** — original vs. transformed grade level (`lib/readability.ts`).
- **Cosmetic controls** — text size, line spacing, high-contrast/dark theme (pure CSS, no AI).
- **Page history** — localStorage, no database (`lib/history.ts`).
- **Export** — print-friendly simplified page.
- **Cached demo trio** — `fixtures/` (cleaned text + screenshots for IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment) + raw-text paste fallback for blocked sites (e.g. ssa.gov 403).
- **Stateless deploy** — Next.js 15 App Router + Vercel, no DB, no auth.

## New Work During Challenge Window (This Commit)

Work created specifically for the ML Empowerment Build Challenge 3.0 inside the allowed window — the delta in this commit:

- **Learning journey integration** — `LEARNING_JOURNEY.md` mapping the five ML Empowerment curriculum lessons to ReadEasy's implementation (AI fundamentals, ML/data/algorithms, neural nets/LLMs, prompt engineering in `lib/llm/prompt.ts`, ethics).
- **Social impact framing** — `docs/ML_SUBMISSION.md` Devpost-ready description (Problem Statement / Solution Overview / Key Features / Technologies Used / Target Users / Project Files / Team Details) reframing ReadEasy for neurodivergent/low-vision accessibility.
- **Disclosure + submission banner** — this file (`HACKATHON_DISCLOSURE.md`) and the ML Empowerment banner added to `README.md` with links to curriculum, demo, and submission branch.
- **Building with OpenRouter after curriculum** — prompt and grounding refinements verified against curriculum ethics (no hallucination, privacy, person-first language) — no model weights or private datasets added.

No model weights, private datasets, or undisclosed third-party code are included beyond what is listed above.

## Compliance

> ML Empowerment Build Challenge 3.0 requires disclosure of pre-existing work.

- **Pre-existing disclosed** in full above (Sep 1-6, 2026 ReadEasy foundation).
- **New work is this commit** — `HACKATHON_DISCLOSURE.md`, `LEARNING_JOURNEY.md`, `docs/ML_SUBMISSION.md`, `README.md` banner — authored inside the challenge window through Oct 5, 2026 @5pm PDT.
- **No pre-existing work is claimed as new.** Buildverse work is cited as foundation with meaningful extension (learning-journey integration + social-impact framing) per hackathon reuse rules.
- **Learn AI curriculum applied** — curriculum completed before extending the project; building followed learning, as documented in `LEARNING_JOURNEY.md`.

## Links

- Base repo: https://github.com/GhostInHex/readeasy
- This submission branch: https://github.com/GhostInHex/readeasy/tree/hackathon/ml-empowerment
- Live demo (submission branch): https://readeasy-git-hackathon-ml-empowerment-ghostinhex.vercel.app
- ML Empowerment Build Challenge 3.0: https://ml-build-challenge-3.devpost.com
- Curriculum: https://mlempowermentfoundation.org/curriculum
- Instagram: @mlempowermentfoundation
