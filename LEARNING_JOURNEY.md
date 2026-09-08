# Learning Journey — ML Empowerment Curriculum

> ML Empowerment Build Challenge 3.0 — Learn AI curriculum applied to ReadEasy.
> Curriculum: https://mlempowermentfoundation.org/curriculum — Instagram: @mlempowermentfoundation

ReadEasy was originally built Sep 1-6, 2026 (Buildverse). For the ML Empowerment Build Challenge 3.0 (deadline Oct 5, 2026 @5pm PDT), the Learn AI curriculum was completed first, then applied to extend ReadEasy with social-impact framing and curriculum-grounded implementation. This document traces five lessons from the curriculum and how each shaped the project.

Building with OpenRouter after curriculum: all LLM work in ReadEasy runs through OpenRouter (key in env, see `.env.example` / `lib/llm/client.ts` with fallback model chain). The prompt, grounding, and ethics constraints below were refined after completing the curriculum.

---

## 1) AI Fundamentals — what AI is and is not

**What we learned:** AI as pattern-based prediction from data, not magic or human understanding; the difference between rule-based systems and learning-based systems; capabilities and limitations; why human-in-the-loop verification matters for high-stakes text.

**How ReadEasy applied it:** ReadEasy deliberately splits the pipeline into a non-AI step and an AI step. Fetch & Clean (Mozilla Readability + jsdom, `lib/clean.ts`) is deterministic and rule-based — no model involved. Only the Restructure step (`POST /api/transform` → OpenRouter) uses AI, and its output is always rendered side-by-side with the cleaned original so a human can verify nothing was dropped or invented. The UI never presents the model as an authority; it is a rewriter of text already on the page.

## 2) ML / Data / Algorithms — data quality, bias, and the pipeline

**What we learned:** ML models learn from data; data quality, representativeness, and bias flow into outputs; algorithms encode choices about what to extract, emphasize, and omit; evaluation requires real fixtures, not just demos.

**How ReadEasy applied it:** The `fixtures/` trio (IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment) are cached cleaned texts + screenshots so behavior is evaluable without live-network variance. Action items (`actionItems[{task, urgency, deadline?}]`) are not inferred — urgency is assigned only from the page's own language ("must" → high, "recommended" → medium, optional → low), and `deadline` is copied verbatim only when the page states a date. Tests in `tests/` stub the LLM and exercise HTTP-in/JSON-out external behavior plus pure helpers (Bionic formatter, readability), so regressions are caught without flaky model calls. This keeps the data-grounding chain auditable.

## 3) Neural Nets / LLMs — how large language models work

**What we learned:** Neural networks as layered function approximators; transformers and attention; LLMs as next-token predictors trained on large corpora; why they hallucinate (plausible continuation vs. factual grounding); JSON-mode / structured output as a control surface.

**How ReadEasy applied it:** The restructure prompt in `lib/llm/prompt.ts` treats the LLM as a constrained rewriter, not an open-ended author. `RESTRUCTURE_SCHEMA_TEXT` forces a strict JSON contract (`{title, summary, readingTimeMinutes, actionItems, sections}`) validated by `validateRestructured`; the route does one automatic retry with `RETRY_NUDGE` on malformed JSON, then returns a structured error — never a crash. `VARIANT_INSTRUCTIONS` separates the default rewrite (3-7 sections, 1-3 paragraphs each) from the ADHD variant (6-14 micro-cards, one idea per card, `**bold**` only for 2-3 key words), and `READING_LEVEL_RULES` adds a Simpler level (grade-3, <12-word sentences, "you" voice) without dropping requirements. Fallback models in `lib/llm/client.ts` are tried in order on rate limits/outages. All of this assumes the model will drift unless tightly scaffolded.

## 4) Prompt Engineering — shaping the model with `lib/llm/prompt.ts`

**What we learned:** System vs. user prompts, few-shot vs. rule-driven prompting, constraint layering, and the practice of building prompts that are testable, versioned, and retry-aware.

**How ReadEasy applied it:** `lib/llm/prompt.ts` is the curriculum's prompt-engineering lesson made concrete:

- **`SYSTEM_PROMPT`** — "You are the restructuring step of ReadEasy... You are a rewriter, not an author: every fact must come from the text you are given." Role + boundary in one sentence.
- **`SHARED_RULES`** — hallucination ban ("Use ONLY facts... Never add outside knowledge"), mood/style guardrails ("person-first, neutral language. No pity, no labels"), plain-language target (grade 5: short sentences, everyday words, active voice, jargon expanded only from the text itself), and output discipline ("Answer with JSON only. No prose before or after, no markdown fences.").
- **`VARIANT_INSTRUCTIONS`** — default vs. ADHD card constraints (sentence counts, heading length, `**bold**` rules, full-page coverage requirement).
- **`READING_LEVEL_RULES`** — Standard adds nothing (preserving the proven prompt); Simpler adds grade-3 rules, early verb placement ("You must send..."), and the critical invariant: "Simpler means easier words, never less of the page. Keep every requirement, deadline, and amount."
- **`RETRY_NUDGE`** and `buildUserPrompt()` — composes variant + shared rules + level rules + schema + page title/text into a single deterministic user prompt, with a single retry path. This file is importable, diffable, and tested via `verify:trio` and `validateRestructured`, so prompt changes are reviewable like code.

## 5) Ethics — hallucination, privacy, and person-first language

**What we learned:** Ethical AI means no fabrication, no unnecessary data collection, and respectful language; hallucination harms are highest for readers who depend on the output; privacy is a design choice, not a footnote; person-first language preserves dignity.

**How ReadEasy applied it:**

- **No hallucination** — The prompt's first rule forbids outside knowledge; `SHARED_RULES` and `READING_LEVEL_RULES` require copying names, numbers, dates, amounts, and form/office names exactly as written. The side-by-side view (cleaned original vs. restructured) exists so the reader can verify. `POST /api/ask` answers are grounded only in the cleaned page text, with cached answers for the demo trio. One retry, then a structured error — the app never silently invents.
- **Privacy** — Stateless by design: no database, no auth, no accounts. Page history lives only in `localStorage` on the reader's device. The only server-side data path is `POST /api/transform` forwarding cleaned text to OpenRouter; raw HTML is never stored. Deployed on Vercel with only `OPENROUTER_API_KEY` in env.
- **Person-first language** — `lib/llm/prompt.ts` enforces "Use person-first, neutral language. No pity, no labels, no praise, no encouragement, no marketing tone." Mode copy and UI labels follow the same rule (e.g., "ReadEasy — the web, made readable for every reader" — the reader is the actor, not the diagnosis).

---

## After the Curriculum — Building with OpenRouter

After completing the Learn AI curriculum, ReadEasy's OpenRouter integration was used as the applied project: the prompt in `lib/llm/prompt.ts`, the client + fallback chain in `lib/llm/client.ts`, and the grounded Q&A in `app/api/ask/route.ts` together demonstrate curriculum-to-build translation. Verification remains deterministic: `npm run typecheck`, `npm test`, `npm run build`, and `npm run verify:trio` (live-transform the demo trio and schema-check every answer). The result is an accessibility tool shaped by what the curriculum teaches AI should be — grounded, private, and human-centered.

## Links

- Curriculum: https://mlempowermentfoundation.org/curriculum
- Instagram: @mlempowermentfoundation
- Challenge: https://ml-build-challenge-3.devpost.com
- Branch: https://github.com/GhostInHex/readeasy/tree/hackathon/ml-empowerment
- Demo: https://readeasy-git-hackathon-ml-empowerment-ghostinhex.vercel.app
