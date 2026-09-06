# ReadEasy

**ReadEasy — the web, made readable for every reader.**

ReadEasy restructures any web page into clear, accessible formats for readers with dyslexia,
ADHD, or low vision — rewritten in plain language, with deadlines extracted into simple
checklists. Unlike a browser reader mode, which only strips styling, ReadEasy performs
semantic restructuring: the AI reshapes text that is already on the page into plain language
and never invents facts.

## Features

Paste a URL (or raw page text, for sites that block fetching) and get a split view: the
cleaned original on the left, an accessible version on the right with toggleable reading
Modes:

- **Focus** — one card at a time with a progress indicator, so there is never a wall of text.
- **Dyslexia** — OpenDyslexic font, warm background tint, Bionic Reading (bolded word starts).
- **Action** — deadlines and required steps pulled out as a checklist ("Step 2 of 4").
- **Listen** — read aloud using the browser's speech synthesis, with karaoke-style word
  highlighting in sync.
- **ADHD** — micro-cards: one idea per screen, key words bolded.

Plus:

- **Ask this page** — ask questions about the transformed page; answers are grounded only in
  that page's text. Answers for the demo pages are pre-cached so the demo never depends on
  the network.
- **Reading level** — a Simpler/Standard toggle between two restructure variants of the same
  page.
- **Readability score** — original vs. transformed reading grade ("college level → grade 5").
- **Cosmetic controls** — text size, line spacing, high-contrast/dark theme (pure CSS, no AI).
- **Page history** — past transforms saved in localStorage; no account, no database.
- **Export** — print-friendly version of the simplified page.

Every page renders side by side with its original, so you can verify nothing was dropped or
invented.

## Quick start

Requires Node.js 22.x.

```bash
npm install
cp .env.example .env.local   # add your OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

Without an API key the app still builds and runs — the Restructure step falls back to a
canned stub, so the UI and all Modes remain usable.

```bash
npm run typecheck      # tsc --noEmit
npm test               # node:test suites in tests/
npm run build          # production build
npm run verify:trio    # live-transform the demo trio and schema-check every answer
```

### Environment variables

See `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | for real transforms | OpenRouter key used by the Restructure step ([get one](https://openrouter.ai/keys)) |
| `OPENROUTER_MODEL` | no | Overrides the default restructure model |
| `OPENROUTER_FALLBACK_MODELS` | no | Comma-separated fallback models, tried in order on rate limits/outages |
| `READEASY_LLM_MODE` | no | `stub` forces the canned Restructure stub (used by tests) |

## How it works

One server route owns the whole pipeline: `POST /api/transform` accepts `{url}` or
`{rawText}` and returns `{cleanedOriginal, restructured}`, or `{error:{code,message,hint}}`
when a page cannot be fetched or transformed.

1. **Fetch & Clean** (server-side, no AI) — the page HTML is fetched and stripped of ads,
   nav, and scripts with Mozilla Readability.
2. **Restructure** (LLM via OpenRouter) — the cleaned text is reshaped into strict JSON:
   `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}],
   sections[{heading, simplifiedText, keyTakeaway}]}`. One automatic retry on malformed
   JSON, then a structured error — never a crash. Fallback models are tried in order if the
   primary fails.
3. **Render** — every Mode is a client-side renderer of that same JSON (see
   `components/modes/registry.ts`), so no Mode needs defensive parsing. Adding a Mode is one
   registry line plus one renderer file.

`POST /api/ask` answers questions grounded in the cleaned page text, with cached answers for
the bundled demo pages.

The repo bundles **cached fixtures** (cleaned text + screenshots) for the demo trio —
IRS Earned Income Tax Credit, UT Dallas First-Year Apply, and USCIS Students & Employment —
so the demo path has no live-network dependency. Sites that block fetching (e.g. ssa.gov
returns 403) are covered by the raw-text paste path.

## Project layout

```
app/api/transform/   the pipeline route (fetch → clean → restructure)
app/api/ask/         grounded Q&A over the cleaned page text
components/modes/    one renderer per reading Mode + the registry
lib/                 fetch, clean, restructure, bionic, readability, history, ...
lib/llm/             OpenRouter client, prompt, fallback chain, stub
fixtures/            cached demo pages (cleaned text + screenshots)
tests/               node:test suites — external behavior only
```

## Testing

Tests exercise external behavior only: HTTP requests in, JSON out. The LLM client sits
behind an injectable interface so tests stub it deterministically; Cleaning is exercised
with real fixture HTML; pure helpers (Bionic formatter, readability calculator) are tested
directly.

## Deploying to Vercel

The app is a stock Next.js App Router project with no database and no auth, so Vercel needs
no extra configuration beyond environment variables.

```bash
npm i -g vercel     # once
vercel link         # connect this directory to a Vercel project
vercel env add OPENROUTER_API_KEY      # preview + production
vercel --prod       # deploy
```

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · OpenRouter (LLM) · Mozilla Readability +
jsdom · deployed on Vercel. Stateless: no database, no auth.

## Project docs

- Product spec: `.scratch/readeasy/SPEC.md`
- Current build context: `CONTEXT.md`
- Ticket tracker: `.scratch/readeasy/issues/README.md`
