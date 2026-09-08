# ReadEasy — Architecture (Next Founders Hackathon)

> Video segment: **The Build** (codebase / stack / architecture). Companion to `BUSINESS_MODEL.md` (Business & Finance) and `docs/NEXT_FOUNDERS_SUBMISSION.md` (rubric checklist).

---

## 1. One-sentence architecture

```
Client  →  POST /api/transform {url | rawText, level}
          →  fetch + Readability clean (no AI)
          →  OpenRouter JSON restructure (with fallback chain)
          →  {cleanedOriginal, restructured}  →  Mode registry renders same JSON
```

Every Mode is a pure client renderer of one JSON shape. The pipeline is stateless. No database, no auth.

---

## 2. Textual diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Browser (Next.js App Router, React 19)                                │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │  URL / Paste │→ │  POST /api/     │→ │  Mode registry           │   │
│  │  input       │  │  transform      │  │  components/modes/       │   │
│  │  + level     │  │  (route.ts)     │  │  registry.ts             │   │
│  │  toggle      │  └────────┬────────┘  │  Focus · Dyslexia ·      │   │
│  └──────────────┘           │           │  Action · Listen · ADHD  │   │
│         ▲                   │           └────────────┬─────────────┘   │
│         │            ┌──────▼──────┐                 │                 │
│         │            │ lib/history │  localStorage   │ same JSON       │
│         │            │ .ts (6 cap) │←────────────────┘                 │
│  ┌──────┴──────┐     └─────────────┘                                   │
│  │  Ask this   │  POST /api/ask  (grounded in cleanedOriginal,         │
│  │  page       │  demo trio pre-cached via lib/ask-cache.ts)           │
│  └─────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Server (Vercel)  │
                    │  app/api/         │
                    │  transform/route  │  maxDuration 60s, runtime nodejs
                    │  .ts              │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
     ┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼─────────┐
     │ lib/fetch-    │ │ lib/clean   │ │ lib/llm/       │
     │ page.ts       │→│ .ts         │→│ restructure.ts │
     │ fetch HTML    │ │ Readability │ │ prompt.ts →    │
     │ (rawText      │ │ + jsdom     │ │ OpenRouter     │
     │  bypass)      │ │ normalize   │ │ + fallback.ts  │
     └───────────────┘ └─────────────┘ └──────┬─────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │ OpenRouter          │
                                   │ minimax-m3:free     │
                                   │ → glm-5.2:free     │
                                   │ → openrouter/free  │
                                   │ + cached demo trio  │
                                   │ (fixtures/)         │
                                   └─────────────────────┘
```

**Data contract (the seam everything depends on):**

```ts
// lib/types.ts — RestructuredPage
{
  title: string,
  summary: string,
  readingTimeMinutes: number,
  actionItems: { task: string, urgency: "high"|"medium"|"low", deadline?: string }[],
  sections: { heading: string, simplifiedText: string, keyTakeaway: string }[]
}
```

Validated by `lib/schema.ts` (Zod-style strict JSON). One retry with `RETRY_NUDGE` on malformed JSON, then a structured `{error:{code,message,hint}}` — never a crash.

---

## 3. Codebase walkthrough (for the video)

Talk through these five files in order — they tell the whole story in under 90 seconds:

### 3.1 `app/api/transform/route.ts` — the pipeline boundary

- **One route owns the whole pipeline.** `POST` accepts `{url}` or `{rawText}` plus optional `level: "standard" | "simpler"`. Returns `{cleanedOriginal, restructured, level}` or `{error:{code,message,hint}}`.
- Handles: JSON parse → `isReadingLevel` check → **cached demo-trio short-circuit** (`loadCachedTransform` — no network, no key, for the recorded demo) → `resolveTransformDeps()` → `runTransform` with `withReadingLevel(deps.llm, level)`.
- `rawText` wins over cached pages (so pasting your own text about a cached URL doesn't silently return the cached fixture).
- `export const runtime = "nodejs"` and `maxDuration = 60` — the only Vercel config.

### 3.2 `lib/clean.ts` — Cleaning (no AI)

- `cleanHtml(html, url?)`: `JSDOM` → `new Readability(document).parse()` → `normalizeText`. Throws `TransformFailure("no_readable_content")` if `<200` chars (hint: use Raw text tab). `VirtualConsole` silences jsdom CSS noise.
- `cleanRawText(rawText)`: same normalization, no Readability, `raw_text_too_short` guard.
- This is the "fetch & clean" half — deterministic, testable with fixture HTML, no LLM interface.

### 3.3 `lib/llm/` — Restructure (the AI boundary)

| File | Role |
|------|------|
| `lib/llm/prompt.ts` | `SYSTEM_PROMPT` + `buildUserPrompt(input)` + `RETRY_NUDGE`. Prompts demand strict JSON matching `RestructuredPage`; the level (`simpler`/`standard`) is folded into the prompt by `withReadingLevel` in `lib/restructure.ts`. |
| `lib/llm/openrouter.ts` | `createOpenRouterClient({apiKey, model, fallbackModels})`. Primary `minimax/minimax-m3:free`, fallbacks `z-ai/glm-5.2:free`, `openrouter/free`. Builds `messages: [system, user, (assistant+retryNudge)?]` and calls `runWithFallbacks` with per-model timeout `attemptTimeoutMs(55_000, models.length)`. |
| `lib/llm/fallback.ts` | `runWithFallbacks(models[])` — tries models in order on rate-limit/outage/timeout/unusable JSON. `attemptTimeoutMs` budgets the 55s window across attempts. |
| `lib/llm/stub.ts` | Canned JSON restructure when `READEASY_LLM_MODE=stub` or no `OPENROUTER_API_KEY` — lets the app build/run and tests stay deterministic without a key. |
| `lib/llm/types.ts` | `LlmClient { name, complete(input): Promise<string> }` — injectable interface; `lib/restructure.ts` owns parsing/validation/retry above it. |

### 3.4 `components/modes/registry.ts` — the Mode seam

```ts
export const MODES: ModeDefinition[] = [
  { id: "focus",    label: "Focus",    Renderer: FocusMode },
  { id: "dyslexia", label: "Dyslexia",  Renderer: DyslexiaMode },
  { id: "action",   label: "Action",   Renderer: ActionMode },
  { id: "listen",   label: "Listen",   Renderer: ListenMode },
  { id: "adhd",     label: "ADHD",     Renderer: AdhdMode },
];
```

**One line per Mode. That line plus its renderer file is the entire cost of adding a Mode.** Nothing else knows the list (`findMode` is the only accessor, `DEFAULT_MODE_ID = MODES[0].id`). Each `Renderer` is a pure function of `RestructuredPage` — no defensive parsing, because the pipeline guarantees the shape. Mention `lib/bionic.ts` (bolded word starts for Dyslexia/ADHD) and `lib/microcards.ts` (ADHD sentence splitting) as Mode helpers.

### 3.5 `lib/history.ts` — localStorage, no database

- `HISTORY_STORAGE_KEY = "readeasy.page-history"`, `HISTORY_LIMIT = 6` (keeps the transform box above the fold; seventh visit drops the oldest).
- Pure rules + injected storage (modeled on `lib/preferences.ts`): `toEntry`, newest-first, dedupe, `isWebAddress` guard (only `http:`/`https:`), cached pages contribute `slug` via `matchCachedPage`. Pasted pages are not recordable (no URL to return to).
- Why no DB: what somebody reads is private. This also makes the architecture stateless and horizontally scalable.

**Supporting cast to name-drop in the video if time allows:** `lib/fetch-page.ts` (fetch with error mapping), `lib/schema.ts` (strict JSON validation), `lib/readability.ts` + `lib/text.ts` (grade → "college → grade 5"), `fixtures/` + `lib/cached-transform.ts` (demo trio bundle), `app/api/ask/` + `lib/ask-cache.ts` (grounded Q&A, pre-cached for trio).

---

## 4. Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15 App Router** | File-based routing, `app/api/*` routes, Vercel-native deploy, `runtime: "nodejs"` for jsdom |
| UI | **React 19** | Server + client components; Modes are client renderers |
| Language | **TypeScript 5.6** (strict) | `RestructuredPage` contract enforced end-to-end |
| Cleaning | **Mozilla Readability 0.6 + jsdom 24** | Industry-standard article extraction; jsdom pinned to 24 for fully CommonJS tree |
| LLM | **OpenRouter** | Model-agnostic JSON completions; free-tier primary + 2 fallbacks; `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS` env overrides |
| Hosting | **Vercel** | Stateless deploy, zero extra config beyond `OPENROUTER_API_KEY` env |
| Persistence | **localStorage** (history, preferences) | No DB, no auth, no PII on server |
| Tests | **node:test + tsx** | External-behavior tests: HTTP in, JSON out; LLM behind injectable interface; fixture HTML for cleaning |
| Fonts | Atkinson Hyperlegible + OpenDyslexic | Accessibility-first typography |

**Project layout (from README):**

```
app/api/transform/   pipeline route (fetch → clean → restructure)
app/api/ask/         grounded Q&A over cleaned text
components/modes/    one renderer per Mode + registry
lib/                 fetch, clean, restructure, bionic, readability, history, …
lib/llm/             OpenRouter client, prompt, fallback chain, stub
fixtures/            cached demo pages (cleaned text + screenshots)
tests/               node:test suites — external behavior only
```

---

## 5. Scalability — handling more data and more users

The video must answer "can this handle more data/users?" — here's the narrative:

### 5.1 Stateless and horizontally scalable

- **No database, no session, no auth.** Every `POST /api/transform` is independent: fetch → clean → LLM → JSON. Vercel runs it as a serverless function (`maxDuration 60`) that scales horizontally to N concurrent invocations. More users = more function instances, not a migration.
- **No per-user server state.** History and preferences live in `localStorage` on the device. The server never stores what somebody read — which also eliminates a GDPR/COPPA surface.
- **Cheap, cacheable hot path.** The three demo pages (and any future curated bundles) are served from `fixtures/` + `loadCachedTransform` without hitting the network or the LLM — effectively a CDN-friendly cache for the pages that will be demoed most. Additional curated pages are one fixture each.

### 5.2 More data: longer pages, more pages

- **Longer pages:** Readability + `normalizeText` reduce arbitrary HTML to bounded article text before the LLM sees it. The prompt's JSON shape (`sections[]`) already paginates output into cards; the UI renders `sections` as Focus/ADHD cards, so a 10-section government guide is 10 cards, not a wall of text. No schema change needed for longer inputs.
- **More pages (batch/crawl for B2B):** the pipeline is a function (`runTransform`) behind one route. An Enterprise batch endpoint is `Promise.all` over the same function with concurrency caps — no new cleaning or LLM code. The B2B API vision is literally `POST /api/transform` metered.
- **Q&A grounding** (`POST /api/ask`) reuses `cleanedOriginal` — no second fetch, bounded context.

### 5.3 Resilience (more users without more failures)

- **Fallback model chain** (`lib/llm/fallback.ts`): primary `minimax-m3:free` → `glm-5.2:free` → `openrouter/free` router. A rate limit or outage on one model tries the next within the 55s budget — the demo has survived model outages during the Sep build this way.
- **One retry on malformed JSON** with `RETRY_NUDGE` in `lib/restructure.ts`, then a structured error (not a crash) with `hint` for the UI.
- **Fetch-blocked sites** (proven: `ssa.gov` 403) are handled by the `rawText` path — same pipeline, no fetch. API customers can POST HTML directly.
- **Stub path** (`READEASY_LLM_MODE=stub`) keeps the app shippable even with no key — useful for CI, previews, and load testing the non-LLM path.

### 5.4 Cost scales linearly and predictably

- COGS is dominated by tokens per transform (~$0.002–0.01 at paid pricing; free tier today). Revenue per transform in the API tier is $0.04–0.08 → margin stays ~75–88% as volume grows. Vercel cost grows with invocations, not with stored data (there is none). See `BUSINESS_MODEL.md` §5 for the math.

### 5.5 What would need to change at 10× and 100×

| Scale | Change | Effort |
|-------|--------|--------|
| **10× users** (1k→10k transforms/day) | None — Vercel auto-scales; add paid OpenRouter model + rate-limit env tuning | Config only |
| **100× users** (100k/day) | Add Redis/Vercel KV for response cache keyed by `(url, level, promptVersion)`; meter API with existing route middleware; optional queue for batch crawls | Small feature, no arch rewrite |
| **100× data** (very long docs) | Chunk `cleanedOriginal` into overlapping windows, restructure per-window, concat `sections[]` | One new function in `lib/transform.ts` |

No rewrite, no DB, no state migration — the architecture was chosen to defer those decisions until revenue justifies them.

---

## 6. Links

- Repo (this branch): https://github.com/GhostInHex/readeasy/tree/hackathon/next-founders
- Demo: [readeasy-founders.vercel.app](https://readeasy-founders.vercel.app)
- Business model: `BUSINESS_MODEL.md`
- Submission checklist: `docs/NEXT_FOUNDERS_SUBMISSION.md`
- Disclosure: `HACKATHON_DISCLOSURE.md`
