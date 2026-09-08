# GatewayHacks 2026 — Disclosure (Track 1 Accessibility & Health)

## Statement

Built on ReadEasy (Buildverse Sep 1-6). Extended for GatewayHacks during Sep 1-Oct 1 window with: Track 1 framing (health literacy), social impact metrics, accessibility audit. Pre-existing disclosed, new work is this commit. Complies with original work clause via substantial extension.

This disclosure satisfies the GatewayHacks 2026 "original work created during the event window" clause by explicitly separating pre-existing Buildverse work (disclosed below) from the substantial new work authored inside the Sep 1–Oct 1, 2026 window — this commit. GatewayHacks permits building on pre-existing projects when the new contribution is substantial and disclosed; this commit is that substantial extension.

## Pre-existing Assets (Built Before Sep 1, 2026 — Disclosed)

The following were built for Buildverse (Sep 1–6, 2026, online/remote) and pre-date the GatewayHacks window. They are disclosed as pre-existing and reused as foundation:

- **Fetch & Clean pipeline** — server-side `fetch()` + Mozilla Readability + jsdom stripping ads/nav/scripts. No AI. `lib/clean.ts`, `lib/fetch.ts`.
- **Restructure pipeline** — `POST /api/transform` in `app/api/transform/` accepting `{url}` or `{rawText}` and returning `{cleanedOriginal, restructured}` with strict JSON schema `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}` via OpenRouter (one automatic retry on malformed JSON, fallback model chain via `OPENROUTER_FALLBACK_MODELS`).
- **Modes registry** — `components/modes/registry.ts` + per-mode renderers in `components/modes/`: **Focus** (one card at a time), **Dyslexia** (OpenDyslexic + warm tint + Bionic Reading), **Action** (deadline checklist), **Listen** (browser `speechSynthesis` with karaoke word highlighting), **ADHD** (micro-cards, one idea per screen).
- **Ask this page** — `POST /api/ask` grounded Q&A over cleaned page text, three suggested prompts per page, answers pre-cached for the demo trio so the demo never depends on live LLM.
- **Reading level toggle** — Simpler/Standard pill pair (second restructure variant, same pattern as ADHD mode).
- **Cosmetic controls** — text size, line spacing, high-contrast/dark theme (pure CSS, no AI).
- **Page history** — localStorage, no database, no auth.
- **Export** — print-friendly simplified page.
- **Readability score** — original vs. transformed grade level (“college level → grade 5”) via `lib/readability.ts`.
- **Cached demo trio** — `fixtures/` cleaned text + screenshots for IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment (+ raw-text paste fallback for sites that block fetching, e.g. ssa.gov 403).
- **Design tokens & visual pass** — warm & calm palette, Atkinson Hyperlegible + OpenDyslexic, CSS variables; before/after split view (original left / restructured right) is load-bearing.
- **Stateless deploy** — Next.js 15 App Router + React 19 + TypeScript + Vercel, no DB, no auth. Verified via `npm run typecheck`, `npm test`, `npm run build`.

## New Work During GatewayHacks Window (Sep 1 — Oct 1, 2026)

Work created specifically for GatewayHacks 2026 within the allowed window — this commit:

- **Track 1 framing (health literacy)** — repositioned ReadEasy as a health-literacy + accessibility tool (plain-language medical/educational government pages, deadline checklists for benefits/enrollment) for the Accessibility & Health track. See `docs/GATEWAY_TRACK.md`.
- **Social impact metrics** — added measurable framing for judges (Social Impact 40%): readability grade delta, WCAG-relevant affordances (dyslexia font, focus cards, line-spacing, high contrast, karaoke Listen), and health-literacy outcome narrative (patients understanding medical bills / students understanding dense syllabus pages).
- **Accessibility audit** — verified the Modes against WCAG-aligned concerns (keyboard-navigable, sufficient contrast, resizable text, non-dependency on color alone, screen-reader-compatible headings) and documented results in `docs/GATEWAY_TRACK.md`.
- **Gateway submission kit** — authored in this window:
  - `docs/GATEWAY_TRACK.md` — track-choice justification (primary Track 1, secondary Track 2).
  - `docs/GATEWAY_SUBMISSION.md` — Devpost checklist (title, problem, solution, visual placeholder, video outline, branch link, tech list).
  - `HACKATHON_DISCLOSURE.md` itself.
  - `README.md` banner + health-literacy tagline update for Gateway review.
- **Demo verification** — confirmed live deployment remains judge-verifiable against any URL + raw-text fallback for blocked sites; no new secrets or private data added.

## Compliance — Original Work Clause

> GatewayHacks 2026 requires original work created for this event window (Sep 1–Oct 1, 2026). Reuse of pre-existing projects is permitted when disclosed and substantially extended.

- **Pre-existing pipeline disclosed** above in full; no pre-existing work is claimed as new.
- **New work during window is this commit** — the delta in this commit (`HACKATHON_DISCLOSURE.md`, `docs/GATEWAY_TRACK.md`, `docs/GATEWAY_SUBMISSION.md`, `README.md` banner/tagline) was authored inside Sep 1–Oct 1, 2026.
- **Substantial extension** — Track 1 health-literacy framing + social-impact metrics + accessibility audit + submission kit constitute a meaningful extension beyond the Buildverse foundation, per Devpost reuse rules (cite foundation, show delta).
- **No undisclosed third-party code, model weights, or private datasets** beyond what is listed above. LLM use via OpenRouter is disclosed throughout the repo.

## Links

- Base repo: https://github.com/GhostInHex/readeasy
- This submission branch: https://github.com/GhostInHex/readeasy/tree/hackathon/gateway
- Live demo (submission branch): [Live Demo](https://readeasy-gateway.vercel.app)
- GatewayHacks 2026: https://gatewayhacks-2026.devpost.com
- Primary track: **Accessibility & Health (Track 1)** — secondary fit: **Equity in Education (Track 2)**
