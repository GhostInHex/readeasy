# ReadEasy

**ReadEasy — the web, made readable for every reader.**

ReadEasy restructures any web page into clear, accessible formats for readers with dyslexia, ADHD, or low
vision — rewritten in plain language, with deadlines extracted into simple checklists.

- Product spec: `.scratch/readeasy/SPEC.md`
- Current build context: `CONTEXT.md`
- Ticket tracker: `.scratch/readeasy/issues/README.md`

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm test           # node:test suites in tests/
npm run build      # production build
```

## How it works

One server route owns the whole pipeline: `POST /api/transform` accepts `{url}` or `{rawText}` and returns
`{cleanedOriginal, restructured}`, or `{error:{code,message,hint}}` when a page cannot be fetched or
transformed. Fetching and Cleaning (ads/nav/scripts stripped, no AI) happen server-side; the LLM Restructure
step reshapes the cleaned text into strict JSON. Every Mode in the UI is a client-side renderer of that same
JSON, so no Mode needs defensive parsing.

## Deploying to Vercel

The app is a stock Next.js App Router project with no database and no auth, so Vercel needs no extra
configuration beyond environment variables.

```bash
npm i -g vercel     # once
vercel link         # connect this directory to a Vercel project
vercel env add OPENROUTER_API_KEY      # preview + production
vercel --prod       # deploy
```

Environment variables (see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | for real transforms | OpenRouter key used by the Restructure step |
| `OPENROUTER_MODEL` | no | Overrides the default restructure model |
| `READEASY_LLM_MODE` | no | `stub` forces the canned Restructure stub (used by tests) |

Without `OPENROUTER_API_KEY` the app still builds and runs; the Restructure step falls back to the stub so the
shell and Modes remain usable.
