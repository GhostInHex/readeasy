# AI Builders Hackathon Disclosure

## Statement

Built on ReadEasy (Buildverse Sep 1-6, 2026). Extended for AI Builders during Aug 21-Sep 15 window with: health-literacy reframing + product polish + deck/video prep. Pre-existing pipeline disclosed (Readability + OpenRouter restructure `POST /api/transform`, modes in `components/modes/registry.ts`, cached demo trio `fixtures/`). New work during window is this commit.

This disclosure satisfies Devpost's "All submissions must be created during hackathon period" check by explicitly separating pre-existing work from work performed inside the AI Builders window.

## Pre-existing Assets (Built Before Aug 21, 2026 — Disclosed)

The following were built for Buildverse (Sep 1-6, 2026) and pre-date the AI Builders window. They are disclosed as pre-existing and reused with significant new work layered on top:

- **Fetch & Clean pipeline** — server-side `fetch()` + Mozilla Readability + jsdom stripping (ads/nav/scripts). No AI.
- **Restructure pipeline** — `POST /api/transform` in `app/api/transform/` accepting `{url}` or `{rawText}`, returning `{cleanedOriginal, restructured}` with strict JSON schema `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}` via OpenRouter (one retry on malformed JSON, fallback model chain).
- **Modes registry** — `components/modes/registry.ts` + per-mode renderers (`components/modes/`): Focus, Dyslexia/Bionic, Action checklist, Listen (browser `speechSynthesis` with karaoke word highlighting), ADHD micro-cards.
- **Ask this page** — `POST /api/ask` grounded Q&A over cleaned page text (cached answers for demo trio).
- **Reading level toggle** — Simpler/Standard restructure variants (second prompt variant).
- **Cosmetic controls** — text size, line spacing, high-contrast/dark theme (pure CSS, no AI).
- **Page history** — localStorage, no database.
- **Export** — print-friendly simplified page.
- **Cached demo trio** — `fixtures/` (cleaned text + screenshots for IRS EITC, UT Dallas Apply, USCIS Students & Employment) + raw-text paste fallback for blocked sites (e.g. ssa.gov 403).
- **Readability score** — original vs. transformed grade level.
- **Design tokens & visual overhaul** — palette/type/spacing via CSS variables.
- **Stateless deploy** — Next.js 15 App Router + Vercel, no DB, no auth.

## New Work During AI Builders Window (Aug 21 — Sep 15, 2026)

Work created specifically for the AI Builders Hackathon within the allowed window — this commit:

- **Health-literacy reframing** — positioned ReadEasy as a health-literacy / accessibility product (plain-language bureaucratic text, deadline checklists) for AI for Good framing.
- **Product polish for AI Builders review** — copy edits and verification that the live demo remains judge-verifiable against any URL + raw-text fallback.
- **Deck & video prep** — 10-slide deck in `docs/AI_BUILDERS_DECK.md` and submission checklist in `docs/AI_BUILDERS_SUBMISSION.md` authored in this window.
- **This disclosure** — `HACKATHON_DISCLOSURE.md` itself and the submission-branch banner in `README.md`.

No model weights, private datasets, or undisclosed third-party code are included beyond what is listed above.

## Compliance

> "All submissions must be created during hackathon period"

- **Pre-existing pipeline disclosed** above in full.
- **New work during window is this commit.** The delta in this commit (`HACKATHON_DISCLOSURE.md`, `docs/AI_BUILDERS_DECK.md`, `docs/AI_BUILDERS_SUBMISSION.md`, `README.md` banner) was authored inside the Aug 21–Sep 15, 2026 window.
- **No pre-existing work is claimed as new.** Buildverse work is cited as foundation with meaningful extension (reframing + polish + deck/video) per Devpost reuse rules.

## Links

- Base repo: https://github.com/GhostInHex/readeasy
- This submission branch: https://github.com/GhostInHex/readeasy/tree/hackathon/ai-builders
- Live demo (submission branch): https://readeasy-git-hackathon-ai-builders-ghostinhex.vercel.app
- AI Builders Hackathon: https://ai-builders-hackathon-2026.devpost.com
