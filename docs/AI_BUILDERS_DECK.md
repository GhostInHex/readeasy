# ReadEasy — AI Builders Hackathon Deck (10 Slides)

> 10-slide deck for AI Builders. Companion: `HACKATHON_DISCLOSURE.md`. Live demo: [readeasy-ai-builders.vercel.app](https://readeasy-ai-builders.vercel.app)

---

## Slide 1: Problem Statement

**Title:** The web is unreadable for the people who need it most

**Body:**

- Government, healthcare, and education pages are walls of text — ads, sidebars, legalese, buried deadlines.
- Browser "reader modes" strip styling but keep the same wording and structure.
- Readers with **dyslexia, ADHD, or low vision** pay the highest price: fatigue, missed deadlines, reliance on others.
- 1 in 5 U.S. adults reads below a 5th-grade level; bureaucratic pages are written at college+ level.

**Visual:** Left = raw IRS EITC page (cluttered, dense). Right = same page failing a readability check (college level).

**Speaker notes:**
> Open with a page everyone has suffered through — an IRS or USCIS page. Ask the audience: "Where is the deadline? What do you actually need to do?" Count 5 seconds of silence — that's the burden. Browser reader mode helps 10%; it doesn't rewrite or restructure. For a dyslexic or ADHD reader, the wall of text is the product failing, not a cosmetic issue. We built for that exact gap.

---

## Slide 2: Solution Overview

**Title:** ReadEasy — the web, made readable for every reader

**Body:**

- **Paste any URL** (or raw text for blocked sites) → **Transform** → split-screen: original on the left, accessible version on the right.
- **Clean** (no AI) → **Restructure** (LLM, strict JSON) → **Render** (mode renderers).
- AI only reshapes text already on the page — **never invents facts**.
- Stateless, no account, no database. Works on any page in seconds.

**Visual:** 3-step pipeline graphic: Fetch→Clean → Restructure → Render. Arrow from URL input to side-by-side result.

**Speaker notes:**
> One button, one promise: paste a link, get a readable version you can verify. The left panel keeps the cleaned original so you can see nothing was dropped or invented. The right panel is the AI doing what reader mode never could — rewriting in plain language and pulling deadlines into a checklist. Emphasize the "no hallucination" constraint; judges care.

---

## Slide 3: Target Users

**Title:** Built for readers the web leaves behind — useful for everyone

**Body:**

| Segment | Pain | How ReadEasy helps |
|---|---|---|
| **Students** | Dense syllabus / admissions pages | Plain language + summary + reading time |
| **Dyslexic / ADHD readers** | Walls of text, letter blurring, lost focus | Dyslexia/Bionic, Focus cards, ADHD micro-cards |
| **Low-vision readers** | Small type, low contrast | Text size, spacing, high-contrast/dark |
| **Educators & families** | Need to share accessible versions | Print/export, shareable transform |
| **Any reader on a deadline** | "What do I actually need to do?" | Action checklist with urgency + deadlines |

**Visual:** Four persona cards with icons + one-line quote each.

**Speaker notes:**
> Person-first language throughout — "readers with dyslexia," not labels. The accessibility story is the wedge, but the benefit is universal: anyone facing a bureaucratic page wants the checklist. Name the demo trio pages as proof we tested on real government text, not toy content.

---

## Slide 4: Product Features

**Title:** One transform, many ways to read

**Body:**

- **Focus** — one card at a time + progress indicator ("Step 2 of 4"); never a wall of text.
- **Dyslexia / Bionic** — OpenDyslexic font, warm cream tint, Bionic Reading (bolded word starts) for anchoring.
- **Action checklist** — deadlines and required steps extracted as `actionItems` with urgency + deadline.
- **Listen (karaoke)** — browser `speechSynthesis` with word highlighting in sync.
- **ADHD micro-cards** — one idea per screen, key words bolded, max 2 sentences visible.
- **Ask this page** — grounded Q&A over the cleaned text; pre-cached answers for the demo trio so the demo never depends on the network.
- **Reading level** — Simpler / Standard toggle (two restructure variants).

**Visual:** 2×3 grid of mode thumbnails; highlight Focus → Dyslexia → Action in the talk track.

**Speaker notes:**
> Walk through three modes live if time allows — Focus, Dyslexia, Action. Point out that cosmetic controls (size/spacing/contrast) are pure CSS, zero AI cost. "Ask this page" is grounded — answers cite only the page text, and the demo trio's answers are cached so the stage demo can't fail on network. Reading level shows we can dial complexity without re-fetching.

---

## Slide 5: Technical Architecture

**Title:** One route owns the whole pipeline

**Body:**

```
[URL or rawText]
      │
      ▼
  POST /api/transform
      │
      ├─ 1. Fetch & Clean (server, no AI)
      │     fetch() HTML → jsdom + Mozilla Readability → cleanedOriginal
      │
      ├─ 2. Restructure (LLM via OpenRouter)
      │     cleaned text → strict JSON {title, summary, readingTimeMinutes,
      │                actionItems[], sections[{heading, simplifiedText, keyTakeaway}]}
      │     One retry on malformed JSON → structured {error:{code,message,hint}}
      │
      └─ 3. Render (client)
            same JSON → Mode renderers via components/modes/registry.ts
            Adding a mode = one registry line + one renderer file
```

- `POST /api/ask` — grounded Q&A over `cleanedOriginal`.
- `fixtures/` — cached demo trio (cleaned text + screenshots) so video/demo has no live dependency.

**Visual:** Diagram as above, plus file-tree callout: `app/api/transform/`, `components/modes/registry.ts`, `lib/`, `fixtures/`.

**Speaker notes:**
> Architecture is deliberately boring — that's the strength. Single boundary, testable, stateless. Fetch/Clean has no AI; Restructure is the only LLM call and it returns validated JSON so modes never need defensive parsing. Registry pattern keeps modes isolated — judges can read `registry.ts` and understand extensibility in 30 seconds.

---

## Slide 6: AI Technologies Used

**Title:** Constrained AI — reshapes, never invents

**Body:**

- **OpenRouter** — model-agnostic LLM gateway; primary model + comma-separated fallbacks (`OPENROUTER_FALLBACK_MODELS`), retried on rate limits/outages.
- **JSON-constrained restructure prompt** — enforced schema, validated server-side; malformed JSON triggers exactly one retry then a structured error (never a crash).
- **No hallucination by design** — prompt reshapes provided text only; no external knowledge, no browsing, no invented deadlines. Side-by-side original lets the reader verify.
- **Deterministic tests** — LLM client behind injectable interface; tests stub it, Cleaning exercised with real fixture HTML.
- **Stub fallback** — without `OPENROUTER_API_KEY`, `READEASY_LLM_MODE=stub` returns canned JSON so the app still builds and modes remain usable.

**Visual:** Prompt snippet (schema) + error-contract example `{error:{code,message,hint}}`.

**Speaker notes:**
> This is the "Responsible AI" slide. Hammer three guarantees: JSON schema, one retry, grounded answers. No invented facts is a product decision, not a prompt trick — the split-screen is the accountability UI. Mention fallback models as reliability, and that tests don't mock the cleaner — they use real IRS fixture HTML.

---

## Slide 7: Impact and Value Proposition

**Title:** From college level to grade 5 — in seconds

**Body:**

- **Readability delta:** original vs. transformed grade level shown on every transform ("college level → grade 5").
- **Time saved:** bureaucratic page → checklist in one click; deadlines no longer buried in paragraph 7.
- **Accessibility compliance:** dyslexia-friendly typography, bionic reading, focus segmentation, karaoke listening — without asking the original site to change.
- **Health-literacy lens:** plain-language + checklist format directly addresses missed deadlines and misunderstood instructions on benefits/health/education pages.
- **Zero friction:** no account, no install, paste a link or pasted text for blocked sites (proven: ssa.gov 403 handled by raw-text path).

**Visual:** Before/after readability gauge + testimonial-style quote: "I finally saw what I had to do."

**Speaker notes:**
> Quantify: pick one demo page and show its before/after grade level live. Time-to-comprehension is the real metric — not model latency. Frame health literacy: a missed IRS or USCIS deadline is a health/financial outcome, not just UX. Accessibility is not a feature — it's the product.

---

## Slide 8: Demo

**Title:** Live — UT Dallas Apply page, transformed

**Body:**

- **Step 1:** Paste `https://www.utdallas.edu/apply/` (or use cached fixture) → **Transform**.
- **Step 2:** Split-screen reveal — left: cleaned original (or screenshot for demo trio), right: Focus cards.
- **Step 3:** Toggle **Action** — deadlines become a checklist. Toggle **Dyslexia/Bionic**. Press **Listen** — karaoke highlight follows voice.
- **Backup:** If fetch blocked, paste raw text — same output contract.
- **Video:** 90–120s recorded against cached fixtures (re-recordable); live URL remains verifiable for judges.

**Visual:** Side-by-side screenshots: raw UT Dallas page vs. ReadEasy Focus + Action.

**Speaker notes:**
> Do it live, but narrate the cached-fixture safety net — judges respect a demo that can't fail. Keep the walk-through to 60 seconds: Transform, Focus, Action, Dyslexia, Listen. End on the action checklist — it's the "aha" moment. Point to the live URL on the slide so judges can try their own link after.

---

## Slide 9: Scalability / Roadmap

**Title:** Stateless today, extensible tomorrow

**Body:**

- **Today:** Vercel, stateless, no DB, no auth — scales horizontally for free; env-only config (`OPENROUTER_API_KEY`).
- **Tomorrow (no scope creep, ordered):**
  1. **Browser extension** — read DOM directly, one-click transform on any page (talk track today, build next).
  2. **Multi-page flow** — crawl linked pages (e.g., full admissions journey) into one checklist.
  3. **Export** — PDF/print + shareable link; today's print stylesheet is the seed.
  4. **More modes** — literal-language mode for cognitive accessibility (spec'd, not shipped).
  5. **Eval harness** — hallucination / reading-level regression suite (the "AI Evals" track).
- **What we won't do:** multi-language output (quality risk), PDFs/non-HTML, mobile apps.

**Visual:** Roadmap timeline: Now → Next → Later, with "extension" as the first next step.

**Speaker notes:**
> Emphasize that stateless + no DB is a scaling decision, not a shortcut. Extension is the credible next step — raw-text paste already proves the demand, the extension just removes the paste. Keep "what we won't do" on the slide; it signals discipline.

---

## Slide 10: Team & Ask

**Title:** Ship it, share it, extend it

**Body:**

- **Team:** Solo builder (online, Buildverse → AI Builders). Stack: Next.js 15 + React 19 + TypeScript + OpenRouter + Readability + Vercel.
- **Repo:** https://github.com/GhostInHex/readeasy (public) · Branch: `hackathon/ai-builders` · Live: [readeasy-ai-builders.vercel.app](https://readeasy-ai-builders.vercel.app)
- **Ask:**
  - **Users:** Try your hardest page — paste a link, see the checklist.
  - **Judges:** Verify live — any URL, plus raw-text fallback.
  - **Collaborators:** Accessibility testers + educators — help us tune reading levels and checklist extraction.

**Visual:** Team photo / avatar + QR codes: repo + live demo.

**Speaker notes:**
> Close on the mission sentence: "ReadEasy — the web, made readable for every reader." State the branch and live URL slowly for judges taking notes. Thank Buildverse as foundation, AI Builders as the health-literacy extension — provenance matters. End with the QR codes up while you take questions.

---

## Appendix (Not Presented — Backup Slides)

- **A1: Error contract** — fetch/clean/restructure failures return `{error:{code,message,hint}}` with raw-text hint; never a 500.
- **A2: Demo trio** — IRS EITC, UT Dallas Apply, USCIS Students & Employment (verified 2026-09-01) + backup usa.gov/visas.
- **A3: Testing** — `npm test` (node:test, external behavior only), `npm run verify:trio` (live-transform schema check).
