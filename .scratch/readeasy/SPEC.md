# ReadEasy — Build Spec

> Labels: `ready-for-agent`
> Source: grill session 2026-09-01 (see `CONTEXT.md` for vocabulary and decisions)
> Clock: Build Day opens **Sep 4, 5:00 PM CST** · submission deadline **Sep 6, 11:00 AM CST**

## Problem Statement

Web pages full of ads, sidebars, legalese, and buried deadlines are hard to read — and much harder for readers with dyslexia, ADHD, or low vision. Browser "reader modes" strip styling but keep the original wording and structure: walls of text, bureaucratic syntax, and action items hidden inside ten paragraphs. The information a reader needs — *what does this page ask me to do, and by when?* — stays locked inside clutter.

## Solution

**ReadEasy** — a web app. A user pastes a URL (or, if the site blocks fetching, the page text itself). The server cleans the page (ads, nav, scripts removed — no AI involved), then an LLM **Restructures** the clean text into strict JSON: title, summary, action items with deadlines, and sections rewritten in plain language. The result renders as a split screen: the cleaned original on the left, a calm, structured view on the right with **Modes** the user can toggle — Focus cards, Dyslexia/Bionic, Action checklist, and Listen (read aloud). The AI only reshapes text that was already on the page; it never invents facts.

## User Stories

1. As a reader with dyslexia, I want an OpenDyslexic font option, so that letters stop blurring together.
2. As a reader with dyslexia, I want the first half of each word bolded (Bionic Reading), so that my eye has an anchor in every word.
3. As a reader with dyslexia, I want a cream/warm background tint, so that high-contrast white backgrounds stop vibrating.
4. As a reader with ADHD, I want content presented one card at a time ("Step 2 of 4"), so that I never face a wall of text.
5. As a reader with ADHD, I want a progress indicator across cards, so that I know how much is left and can keep momentum.
6. As a reader with ADHD (stretch), I want an ADHD Mode with one idea per micro-card and bolded key words, so that every screen view holds exactly one thought.
7. As a low-vision reader, I want text-size toggles, so that I can read without zooming.
8. As a light-sensitive reader, I want a high-contrast/dark toggle and adjustable line spacing, so that long reading doesn't hurt.
9. As a reader facing a bureaucratic page, I want deadlines and required actions extracted into a checklist, so that a policy page becomes a to-do list.
10. As a reader facing legalese, I want each section rewritten in plain language with a one-line key takeaway, so that I understand without a law degree.
11. As a reader who processes language literally (stretch), I want figurative phrases rewritten literally, so that idioms stop misleading me.
12. As a reader who can't comfortably read long text, I want a Listen button that reads the content aloud, so that I can absorb the page by ear.
13. As a reader who arrives from a blocked site, I want to paste raw page text instead of a URL, so that scraping blocks don't stop me.
14. As any reader, I want to see the original page and the accessible version side by side, so that I can verify nothing was invented or dropped.
15. As any reader, I want a two-line summary and reading time at the top, so that I know what the page is and whether to continue.
16. As any reader, I want each section to end with its key takeaway, so that skimming works.
17. As any reader, I want a clear error message when a page can't be fetched or transformed, so that I know what to do next (use raw-text paste).
18. As a judge, I want a live URL where I can paste my own page link, so that I can verify the transformation isn't cherry-picked.
19. As a judge, I want a 90–120 second demo video, so that I can score the project without setting anything up.
20. As a judge, I want a readability score comparing original vs transformed ("college level → grade 5", stretch), so that the accessibility claim has a number.
21. As the builder, I want the LLM to return strict JSON validated against a schema, so that every Mode can render without defensive parsing.
22. As the builder, I want the demo trio (IRS EITC, UT Dallas Apply, USCIS Students) cached with cleaned text and screenshots, so that the demo video can never fail live.
23. As the builder, I want the Listen mode built on the browser's built-in speech (no highlight sync), so that audio costs 20 minutes, not a day.
24. As the builder, I want the restructured output language always to be person-first and neutral, so that the product's tone matches its mission.
25. As the builder, I want deployment on Vercel from the repo, so that the live URL survives judge traffic.

## Implementation Decisions

- **Delivery form: web app** (Next.js, App Router). The browser extension remains a Q&A talking point ("in production…"), never build scope.
- **One server route owns the pipeline**: `POST /api/transform` accepts `{url}` or `{rawText}` and returns `{cleanedOriginal, restructured}`. Fetching, Cleaning (Readability + DOM parser), and Restructure (LLM) all live behind this single boundary.
- **LLM access via OpenRouter** using a fast, cheap model with JSON/structured output; the restructure prompt enforces the strict schema: `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}`. One automatic retry on malformed JSON, then an error response.
- **No invented facts rule**: the prompt is constrained to reshaping the provided text; no external knowledge.
- **Error contract**: fetch/Clean/Restructure failures return `{error:{code,message}}` with a raw-text-paste hint — never a crash.
- **Modes are client-side renderers** of the same `restructured` JSON. Cosmetic toggles (text size, line spacing, contrast/dark) are pure CSS variables and touch no AI logic.
- **Bionic formatter and readability-score calculator are pure functions** (text in → text/number out).
- **Listen** uses the browser's built-in `speechSynthesis`; no sentence-highlight sync.
- **Left panel rule**: default = `cleanedOriginal` text rendered in a deliberately plain style; for the three cached Demo trio pages, a pre-captured screenshot is bundled and shown instead.
- **Cached pages are bundled fixtures** (cleaned text + screenshot in the repo), not runtime caches — the demo path has no live-network dependency.
- **Stateless**: no database, no auth, no saved history. Vercel deployment from the repo.
- **Stretch ladder, in order**: cosmetic toggles → ADHD Mode (new restructure prompt variant) → readability score → literal-language mode. Nothing above MVP starts until MVP renders end-to-end.

## Testing Decisions

- **Good tests test external behavior only**: HTTP requests in, JSON out — no peeking at internals.
- **Seam 1 (primary): the transform route.** Black-box tests against `POST /api/transform`:
  - a real IRS-page HTML fixture yields `cleanedOriginal` plus `restructured` passing schema validation (all fields present, deadlines extracted)
  - a blocked-URL response yields the structured error, not a 500
  - `rawText` input skips fetching and satisfies the same output contract
  - malformed LLM JSON triggers exactly one retry, then the error contract
  - the LLM client sits behind an injectable interface so tests stub it deterministically; Cleaning is exercised with real fixture HTML
- **Seam 2: pure helpers** — Bionic formatter and readability-score calculator tested directly (text in → expected output).
- **No automated UI tests.** Modes are verified by a manual smoke checklist against the cached Demo trio before recording the video. Deliberate trade-off for a 40-hour solo build.

## Out of Scope

- Browser extension (talk track only)
- Accounts, auth, saved history, sharing links
- Sentence-highlight TTS sync
- Runtime server-side screenshots of arbitrary pages
- PDFs, documents, non-HTML inputs
- Multi-language output
- Literal-language mode as a guaranteed deliverable (stretch/talking point)
- Mobile apps

## Further Notes

- **Demo video script (90–120s)**: problem (15s, messy IRS page) → paste URL, Transform, split-screen reveal (25s) → mode walk-through: Focus, Dyslexia, Action checklist, Listen (40s) → readability score + extension line (15s). Recorded against cached fixtures; re-recordable at will.
- **Demo trio (verified server-rendered 2026-09-01)**: IRS Earned Income Tax Credit · UT Dallas First-Year Apply · USCIS Students & Employment. Backup: usa.gov/visas. SSA.gov returns 403 to our fetch — deliberately kept as the live proof point for the raw-text fallback in the video.
- **Identity**: tagline "ReadEasy — the web, made readable for every reader." Submission-form description in `CONTEXT.md`; person-first language always.
- **Q&A defense**: "Reader mode strips styling. ReadEasy performs semantic restructuring: plain language, deadlines as checklists, formatting for specific needs. In production, a browser extension reading the client DOM."
