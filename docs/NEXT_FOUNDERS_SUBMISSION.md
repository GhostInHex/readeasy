# Next Founders Hackathon — Submission Checklist

> Branch: `hackathon/next-founders` · Repo: https://github.com/GhostInHex/readeasy/tree/hackathon/next-founders · Demo: [readeasy-founders.vercel.app](https://readeasy-founders.vercel.app) · Disclosure: `HACKATHON_DISCLOSURE.md`

This file maps the **judging rubric (25% each)** and **5-minute video requirements** to concrete artifacts in this repo so reviewers can verify every criterion without guessing.

---

## Judging Rubric Mapping

### 1. Technical Execution — 25%

| What judges look for | Where it is | Evidence |
|----------------------|-------------|----------|
| Codebase quality, architecture | `docs/ARCHITECTURE.md` §2–3 | Textual diagram + 5-file walkthrough (`app/api/transform/route.ts`, `lib/clean.ts`, `lib/llm/*`, `components/modes/registry.ts`, `lib/history.ts`) |
| Stack & implementation | `docs/ARCHITECTURE.md` §4 | Next.js 15 App Router, React 19, TypeScript, Readability+jsdom, OpenRouter, Vercel; project layout table |
| Working product | Demo: [readeasy-founders.vercel.app](https://readeasy-founders.vercel.app) | Live pipeline: URL/rawText → clean → restructure → Modes; demo trio cached so demo never fails without network |
| Reproducibility | `README.md` Quick start, `package.json` scripts | `npm install && cp .env.example .env.local && npm run dev`; `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:trio` |
| Error handling & reliability | `docs/ARCHITECTURE.md` §5.3, `lib/llm/fallback.ts`, `lib/restructure.ts` | Fallback model chain (3 models), one retry on malformed JSON, structured `{error:{code,message,hint}}` |

**Video segment:** *The Build* — narrate `docs/ARCHITECTURE.md` §3 walkthrough + show the textual diagram. ~90 seconds.

### 2. Innovation & UX — 25%

| What judges look for | Where it is | Evidence |
|----------------------|-------------|----------|
| Novelty beyond reader mode | `README.md` Features, `BUSINESS_MODEL.md` §2 | Semantic restructuring (AI reshapes existing text, never invents facts) vs. CSS stripping; side-by-side with cleaned original for verification |
| Accessibility-first UX | `components/modes/registry.ts`, `lib/bionic.ts`, `lib/microcards.ts` | 5 Modes (Focus, Dyslexia, Action, Listen, ADHD) + Simpler/Standard reading levels + Ask this page (grounded) + readability grade + karaoke Listen highlighting |
| Inclusive / underserved | `BUSINESS_MODEL.md` §3 (Underserved Markets) | Neurodivergent 15%, first-gen applicants, immigrants (USCIS), benefits access (IRS EITC); demo trio chosen for these populations |
| Delight / craft | App UI (warm & calm tokens, Atkinson Hyperlegible, OpenDyslexic) + `fixtures/` screenshots | Before/after skeleton, print export, localStorage history — no account friction |

**Video segment:** *The Problem* (why existing solutions fail) + *The Demo* (screen share). See Communication below.

### 3. Business & Finance — 25%

| What judges look for | Where it is | Evidence |
|----------------------|-------------|----------|
| Problem with market cost | `BUSINESS_MODEL.md` §1 | Health/education outcomes + ADA/508/EAA compliance risk — auditable business pain, not just empathy |
| Solution as business | `BUSINESS_MODEL.md` §2, §4 | B2B2C: free student wedge + B2B SaaS `POST /api/transform` as compliance service |
| Market sizing | `BUSINESS_MODEL.md` §3 | TAM ~$2.5–4B, SAM ~$180–350M, SOM ~$2–6M ARR in 3 years; anchored to 4k+ US colleges + 90k gov sites |
| Revenue streams | `BUSINESS_MODEL.md` §4 | Freemium $0 / Pro $9 / Team $49 / Enterprise API $0.04–0.08 per transform (volume tiers: 1k = $40–80, 100k = $3k–5k) / White-label $499–2,499 |
| Business model & economics | `BUSINESS_MODEL.md` §5 | SaaS + usage-based API; low COGS (OpenRouter ~$0.002–0.01/transform, Vercel stateless); 75–88% gross margin |
| Go-to-market | `BUSINESS_MODEL.md` §6 | Phase 1 campus wedge → Phase 2 compliance API → Phase 3 extension/embed; SEO + disability-office + audit-partner channels |
| Sustainability | `BUSINESS_MODEL.md` §7 | Path to $168k ARR break-even (founder + infra) and $1.1M ARR at 100 API customers; no venture required to survive |

**Artifact:** `BUSINESS_MODEL.md` is the complete Business & Finance submission. Link it in Devpost's Business Model / Pitch Deck field.

### 4. Communication — 25%

| Requirement | Status | Location |
|-------------|--------|----------|
| **5-minute demo video** covering required sections | **To record** (script below) | Upload to YouTube/Loom, link in Devpost + README banner |
| The Problem | Script §1 (0:00–1:00) | Open on messy gov/university page; name health/education + compliance costs |
| The Build (codebase/architecture/stack) | Script §2 (1:00–2:30) | Walk `docs/ARCHITECTURE.md` diagram + 5 files |
| The Demo (screen share, working) | Script §3 (2:30–4:00) | Live transform of one demo trio URL + Mode switches + Ask this page |
| Scalability (more data/users) | Script §4 (4:00–5:00) | `docs/ARCHITECTURE.md` §5 — stateless, Vercel horizontal, fallback chain, cached trio |

---

## 5-Minute Video Script (Communication rubric)

Use this verbatim or as teleprompter; timings are strict.

**0:00–1:00 — The Problem**
> "One in five people is neurodivergent — dyslexia, ADHD, low vision. For them, a wall of government prose isn't an annoyance, it's a barrier to benefits and grades. And for every university and agency that publishes that prose, inaccessible pages are ADA and compliance risk — audits cost tens of thousands and go stale the day content changes. Reader modes only strip CSS; they don't make a page readable. ReadEasy does: it reshapes text already on the page into plain language and never invents facts — always side-by-side with the original so you can verify it."

**1:00–2:30 — The Build**
> "The stack is Next.js 15 App Router, React 19, TypeScript, Mozilla Readability plus jsdom, and OpenRouter — deployed stateless on Vercel, no database, no auth. [Show docs/ARCHITECTURE.md diagram] One route owns the pipeline: POST /api/transform takes a URL or pasted text and returns cleanedOriginal plus restructured JSON. Cleaning is Readability — no AI. Restructure is OpenRouter JSON with a fallback chain across three models and one automatic retry on bad JSON. Every Mode — Focus, Dyslexia, Action, Listen, ADHD — is a pure renderer of that same JSON. Adding a Mode is one line in components/modes/registry.ts plus one file. That's the whole seam."

**2:30–4:00 — The Demo (screen share)**
> [Paste a demo trio URL, e.g., IRS EITC, hit Transform] "Original on the left, accessible on the right. Focus: one card at a time. Dyslexia: OpenDyslexic and Bionic Reading. Action: deadlines as a checklist. ADHD: micro-cards, one idea per screen. Listen — browser speech with karaoke highlighting. Toggle Simpler versus Standard — two restructure variants of the same page. Ask this page — grounded in the cleaned text, pre-cached for the trio so this demo never depends on the network. History is localStorage, six items, no account. And if a site blocks fetching — like ssa.gov — paste the raw text, same pipeline."

**4:00–5:00 — Scalability**
> "Can it handle more users and more data? It's stateless — every transform is independent, so Vercel scales it horizontally: more users is more function instances, no migration. No per-user data on the server — history lives on the device. The hot path is cached — the demo trio serves without the LLM — and that cache is one fixture per page to extend. Resilience is a three-model fallback chain plus structured errors, so the demo survived model outages during our September build. Cost is a few tenths of a cent per transform; the API sells for four to eight cents — seventy-five percent margin that holds as volume grows. Ten times the users is config; a hundred times is a response cache — no rewrite."

**Close (last 10s):** show `BUSINESS_MODEL.md` B2B2C slide and links:
> "Free for students, Team for universities at $49, Enterprise API for compliance. Business model and architecture are in the repo. Links in the description."

---

## Pre-submission Checklist

- [x] `HACKATHON_DISCLOSURE.md` — pre-existing (Sep 1–6) disclosed, new window work listed
- [x] `BUSINESS_MODEL.md` — TAM/SAM, revenue streams, economics, GTM, sustainability
- [x] `docs/ARCHITECTURE.md` — diagram, walkthrough, stack, scalability
- [x] `docs/NEXT_FOUNDERS_SUBMISSION.md` — this file
- [x] `README.md` banner — Next Founders branch header with demo, repo, doc links
- [ ] **Video recorded, uploaded, linked** in README banner + Devpost (replace placeholder uploads)
- [ ] `npm run typecheck` green
- [ ] `npm test` green
- [ ] `npm run build` green
- [ ] `npm run verify:trio` green (if `OPENROUTER_API_KEY` present)
- [ ] Devpost submission: GitHub branch URL, demo URL, video URL, `BUSINESS_MODEL.md` as business model
- [ ] Commit pushed (currently: staged + committed locally, not pushed — push when ready)

---

## Links for judges

| Artifact | URL / Path |
|----------|------------|
| Demo (this branch) | [readeasy-founders.vercel.app](https://readeasy-founders.vercel.app) |
| GitHub branch | https://github.com/GhostInHex/readeasy/tree/hackathon/next-founders |
| Disclosure | `HACKATHON_DISCLOSURE.md` |
| Business model | `BUSINESS_MODEL.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Video | *(add YouTube/Loom URL after recording — must cover Problem/Build/Demo/Scalability)* |
