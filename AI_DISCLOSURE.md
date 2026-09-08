# AI Disclosure — ReadEasy (CSC Back-to-School)

> Required by CSC Rules: "AI tools are allowed and encouraged. Teams will not lose points for using AI. However, teams must disclose how they used AI and must be able to explain the final project." This file is that disclosure.

## Summary

ReadEasy uses AI in **one bounded place**: the **Restructure** step that reshapes already-cleaned page text into strict JSON. Everything else — fetching, cleaning, rendering, cosmetic controls, Bionic formatting — runs without AI. The AI is a **rewriter, not an author**: it never invents facts, and the reader can verify the output side-by-side against the original.

This disclosure maps directly to CSC judging criterion **Learning** (transparency and explainability).

---

## 1. How AI Is Used

### Where: Restructure via OpenRouter (`lib/llm/`)

- **Entry point:** `POST /api/transform` in `app/api/transform/` calls `lib/restructure.ts`, which calls the `LlmClient` interface (`lib/llm/types.ts`) implemented by `lib/llm/openrouter.ts`.
- **Prompt:** `lib/llm/prompt.ts` — `SYSTEM_PROMPT` + `buildUserPrompt(input)` + JSON schema `RESTRUCTURE_SCHEMA_TEXT` + `SHARED_RULES` + variant/level rules. The prompt is versioned in code, not hidden.
- **Schema (strict JSON):**

  ```json
  {
    "title": "string",
    "summary": "string — two short sentences: what this page is, and who it is for",
    "readingTimeMinutes": "number — whole minutes, at least 1",
    "actionItems": [{ "task": "string", "urgency": "high|medium|low", "deadline?": "string" }],
    "sections": [{ "heading": "string", "simplifiedText": "string", "keyTakeaway": "string" }]
  }
  ```

  Mirrored by `validateRestructured` in `lib/restructure.ts`. If the model returns anything else, the call fails with a structured error — never a crash, never silent corruption.

- **Guardrails in the prompt (verbatim paraphrase of `SHARED_RULES` in `lib/llm/prompt.ts:17`):**
  - Use ONLY facts, numbers, names, and dates that appear in the provided text. Never add outside knowledge, never guess, never fill gaps. If the text does not say something, leave it out.
  - Do not soften or exaggerate requirements. If the text says "must", keep it a must.
  - Write in plain language at roughly a US grade 5 reading level (Simpler variant targets grade 3). Expand jargon only using the text's own explanation.
  - Use person-first, neutral language. No pity, no labels, no praise, no encouragement, no marketing tone.
  - Keep every section's `simplifiedText` faithful to that part of the page; cover the page in order; do not merge unrelated topics.
  - `keyTakeaway` is one plain sentence a reader could skim on its own.
  - `actionItems` are things the reader has to do, taken from the text. `urgency` reflects the source: `high` if required/time-bound, `medium` if recommended, `low` if optional. `deadline` is included only when the source states a date/time, copied as written. Empty array if the page asks nothing.
  - Answer with JSON only — no prose, no markdown fences.

- **Retries and fallbacks:**
  - **One automatic retry** on malformed JSON: `RETRY_NUDGE` in `lib/llm/prompt.ts` is appended with the prior answer (truncated to 4000 chars) and the schema again. No more than one retry.
  - **Fallback model chain** in `lib/llm/openrouter.ts` / `lib/llm/fallback.ts`: primary model `DEFAULT_MODEL` (`minimax/minimax-m3:free`, overridable via `OPENROUTER_MODEL`), then `FALLBACK_MODELS` (`z-ai/glm-5.2:free`, `openrouter/free`) or the comma-separated list in `OPENROUTER_FALLBACK_MODELS` (parsed by `parseModelList`). Time budget is split across attempts via `attemptTimeoutMs` with a 10s floor. Non-retriable codes (`restructure_unauthorized`, `ask_unauthorized`) stop the chain immediately.
  - **Ask this page:** `POST /api/ask` is also LLM-backed but grounded strictly in the cleaned page text; answers for the demo trio are **pre-cached** so the demo never depends on the network.

- **Models and parameters:** OpenRouter `https://openrouter.ai/api/v1/chat/completions`, `temperature: 0.2`, `max_tokens: 4000`, `response_format: {type: "json_object"}`. `RESTRUCTURE_SCHEMA_TEXT` and `RETRY_NUDGE` are documented in `lib/llm/prompt.ts:5` and `lib/llm/prompt.ts:77`.

- **Stub for offline/testing:** `lib/llm/stub.ts` returns a canned restructure when `OPENROUTER_API_KEY` is absent or `READEASY_LLM_MODE=stub`, so the app builds and the UI remains usable without a key. Tests inject this stub deterministically via the `LlmClient` interface.

### Variants (same model, different instructions)

- `default` — 3–7 sections, one to three short paragraphs per `simplifiedText`.
- `adhd` — 6–14 micro-cards, one idea per card, at most two short sentences, 2–5 word headings, `**bolded**` key words (double-asterisk markup resolved client-side).
- `simpler` / `standard` reading levels — orthogonal to variant; Simpler aims at ~grade 3, sentences <12 words, plainest word, "you" voice, but keeps every requirement/deadline/amount ("Simpler means easier words, never less of the page" — `lib/llm/prompt.ts:49`).

---

## 2. How AI Is NOT Used

These parts of ReadEasy **do not call any model** and are testable without a key:

- **Cleaning** — server-side `fetch()` + Mozilla Readability + jsdom. Strips ads/nav/scripts. Proven with real fixture HTML. No AI involved.
- **Cosmetic toggles** — text size, line spacing, high-contrast/dark theme. Pure CSS variables and classes, no LLM.
- **Bionic Reading** — `lib/bionic.ts` `toBionicSegments(text)` is a deterministic pure function: splits on whitespace, preserves URLs/emails/file paths as opaque tokens, bolds the leading half of each word (`boldLength`). Returns `BionicSegment[]` rendered as real `<strong>` elements without `dangerouslySetInnerHTML`. Testable at seam 2 without a browser.
- **Renderers / registry** — `components/modes/registry.ts` maps mode → component; each renderer is a client-side view of the same validated JSON. No mode re-parses or re-prompts.
- **Karaoke Listen** — browser `speechSynthesis` with word-level highlighting. No LLM.
- **Readability score** — `lib/readability.ts` grade-level formula on original vs. transformed text.
- **History / Export** — localStorage and print stylesheet.

If AI is down, the UI still renders the cleaned original and the fixture path; the error contract returns `{error:{code,message,hint}}` (e.g., `restructure_timeout`, `restructure_rate_limited`) with an actionable hint.

---

## 3. Human Oversight — Verification

- **Left panel rule (`CONTEXT.md:105`):** every transform renders **side-by-side** — left = cleaned original text (pre-AI, original wording, plain style) or, for the cached demo trio, the pre-captured screenshot of the messy page; right = restructured output. The reader never has to trust the model blindly.
- **"Never invent facts" contract:** the prompt rule above + schema validation + single-retry-then-error means missing or hallucinated fields surface as errors, not as plausible fiction.
- **Fixtures keep the demo honest:** `fixtures/` holds the cleaned text used for verification (`fixtures/<slug>/cleaned.txt`) and the screenshot the left panel shows (`public/fixtures/<slug>.png`). `npm run verify:trio` live-transforms the trio and schema-checks every answer.
- **Explainability:** judges can ask "what role did AI play?" and the answer is one sentence — *the model reshapes text already on the page into the JSON above; it adds no new facts* — demonstrable by diffing left and right panels.

---

## 4. Tools, APIs, Datasets, Open-Source Code

| Category | Item | How used | License / Terms |
|---|---|---|---|
| **LLM API** | [OpenRouter](https://openrouter.ai) (`/api/v1/chat/completions`) | Restructure + Ask this page; primary `minimax/minimax-m3:free`, fallbacks `z-ai/glm-5.2:free`, `openrouter/free` (or `OPENROUTER_FALLBACK_MODELS`) | API terms; keys via `OPENROUTER_API_KEY` env. No training on user data claimed. |
| **Cleaning** | [Mozilla Readability](https://github.com/mozilla/readability) `0.6.0` | Extract article text from HTML, strip ads/nav/scripts | Apache-2.0 |
| **DOM** | [jsdom](https://github.com/jsdom/jsdom) `24.x` | DOM for Readability server-side | MIT |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript | App shell, API routes, components | MIT |
| **Hosting** | [Vercel](https://vercel.com) | Stateless deploy; no DB, no auth | Vercel terms |
| **Speech** | Browser `speechSynthesis` Web API | Listen + Karaoke highlighting | Browser API |
| **Fixtures** | IRS EITC, UT Dallas Apply, USCIS Students (captured 2026-09-01) + `usa.gov/visas`, `irs-pub596` backup; `ssa.gov` as 403 fallback proof | Demo trio cleaned text + screenshots; `fixtures/README.md` documents capture | Public government pages; cached as fair-use excerpts for demo verification |
| **Fonts / UI** | Atkinson Hyperlegible, OpenDyslexic | Dyslexia mode | OFL / custom open |

Additional open-source libraries listed in `package.json` (`puppeteer-core` for fixture capture, `tsx`, `typescript`, `@types/*`) are used as documented; no hidden SDKs, no private datasets, no undisclosed AI-generated code beyond the Restructure prompt above.

---

## 5. What Judges Can Ask (CSC Requirement #6)

> "Teams must be able to explain what they built, how it works, and what role outside tools or AI played in the final project."

- **What:** ReadEasy — paste a URL or raw text, get the cleaned original on the left and an accessible plain-language version on the right with toggleable Modes (Focus, Dyslexia/Bionic, Action, Listen karaoke, ADHD) plus Ask this page and Reading level.
- **How:** `POST /api/transform` → Fetch & Clean (no AI) → Restructure (OpenRouter strict JSON, one retry, fallback chain) → Render (registry). One shared JSON feeds every mode.
- **Role of AI:** Only the Restructure reshaping step; every other transform is deterministic code or CSS, verifiable side-by-side.

---

## 6. Links

- Disclosure for CSC window: `HACKATHON_DISCLOSURE.md`
- Impact statement: `docs/CSC_IMPACT.md`
- Submission checklist: `docs/CSC_SUBMISSION.md`
- Prompt + schema: `lib/llm/prompt.ts`; Client + fallbacks: `lib/llm/openrouter.ts` / `lib/llm/fallback.ts`; Types: `lib/llm/types.ts` / `lib/types.ts`
