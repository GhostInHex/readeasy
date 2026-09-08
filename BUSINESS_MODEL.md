# ReadEasy — Business Model (Next Founders Hackathon)

> Companion to `HACKATHON_DISCLOSURE.md` and `docs/ARCHITECTURE.md`. This document is the Business & Finance 25% artifact for the Next Founders rubric and the basis for the video's Problem and Scalability sections.

---

## 1. The Problem

### Inaccessible web has measurable costs

- **15–20% of the global population is neurodivergent** (dyslexia ~10%, ADHD ~5–9%, plus low vision, cognitive load). For these readers a wall of government or publisher prose is not an inconvenience — it is a barrier to benefits, deadlines, and grades.
- **Health & education outcomes:** IRS Earned Income Tax Credit, USCIS immigration instructions, and university application pages (our demo trio) are precisely the pages where missing a deadline or misreading eligibility costs money or legal status. Plain-language research (US Plain Writing Act, NIH clear-communication guidelines) links readability to completion rates.
- **ADA & compliance risk for publishers:** Under ADA Title II/Section 508 (US), EAA (EU, enforceable June 2025), and WCAG 2.2 AA expectations, universities, publishers, and government sites face legal, procurement, and reputational risk when content is not perceivably operable. Remediation vendors charge $10k–$100k+ per site audit; ongoing compliance is manual and stale the day content changes.

ReadEasy's wedge: **the AI reshapes text already on the page into plain language and never invents facts** — a verifiable transform (side-by-side with the cleaned original) rather than a summary that could hallucinate.

---

## 2. The Solution

**ReadEasy — the web, made readable for every reader.**

- Paste a URL (or raw text for fetch-blocked sites) → server-side **Fetch & Clean** (Mozilla Readability + jsdom, no AI) → **Restructure** via OpenRouter into strict JSON `{title, summary, readingTimeMinutes, actionItems[], sections[{heading, simplifiedText, keyTakeaway}]}` → client **Modes** render the same JSON.
- Modes: **Focus** (one card + progress), **Dyslexia** (OpenDyslexic, warm tint, Bionic Reading), **Action** (deadlines → checklist), **Listen** (browser speech + karaoke highlighting), **ADHD** (micro-cards, one idea per screen). Plus **Ask this page** (grounded Q&A), **Simpler/Standard** reading levels, readability grade, and export.

**Positioning: B2B2C.**

- **B2C surface:** free, no-account reader that students and individuals use on any URL — the distribution wedge.
- **B2B monetization:** the same `POST /api/transform` pipeline as a **compliance-as-a-service API** for sites that must publish accessible alternatives. A university can offer "View accessible version" on every admissions page without rewriting content.

---

## 3. Target Users & Market

### Primary segments

1. **Students & neurodivergent readers (B2C)** — dyslexia, ADHD, low vision, ESL, time-poor undergraduates. 193 Next Founders participants alone illustrate the student market on this Devpost.
2. **Universities & colleges (B2B)** — admissions, financial aid, registrar, disability services offices. 4,000+ US degree-granting institutions; every `.edu` is a publishing surface.
3. **Publishers & gov/public services (B2B)** — agencies and media that must meet WCAG/508/EAA. 90k+ US local governments publish benefits, forms, and legal guidance.
4. **Employers & workplace tools (B2B2C)** — HR/benefits portals (benefits enrollment pages are famously unreadable).

### TAM / SAM / SOM (top-down, anchored)

| Layer | Estimate | Basis |
|-------|----------|-------|
| **TAM — global assistive reading / web accessibility** | **~$2.5–4B** | Accessibility overlay/compliance tools + assistive tech (overlays ~$500M, document accessibility ~$1B, broader assistive reading). Conservative vs. broader $20B+ "digital accessibility" when services included. |
| **SAM — English-language education + gov/publisher compliance API** | **~$180–350M** | 5k English-language higher-ed publishers + 90k US gov sites + top 10k content publishers where ReadEasy's per-page API replaces manual remediation. |
| **SOM — 3-year obtainable (API + Team)** | **~$2–6M ARR** | 40–120 university Team plans + 15–40 Enterprise API customers. Requires no consumer subscription scale to reach. |

**Underserved markets focus (Next Founders criterion):** neurodivergent readers (15% of population, systematically underserved by reader modes that only strip CSS), first-generation college applicants parsing financial-aid prose, immigrants navigating USCIS-style guidance, low-literacy adults accessing benefits. The demo trio was chosen to reflect these populations, not a generic tech blog.

---

## 4. Revenue Streams

| Stream | Price | Who pays | What they get | Status |
|--------|-------|----------|---------------|--------|
| **Freemium — Student** | **$0** | Individual reader | Unlimited transforms (fair-use), all Modes, 6-item localStorage history, print export | Live |
| **Pro — Individual** | **$9/mo** (or $72/yr) | Power users, grad students, researchers | Unlimited history, search & tags, export to PDF/Markdown, reading-level presets, priority models | Roadmap — Stripe Checkout, no DB change (entitlement via signed cookie + localStorage sync) |
| **Team — Education** | **$49/mo** per team (up to 25 seats) | Disability services, writing center, department | Shared history, team domain allowlist, LMS embed (Canvas/Blackboard LTI), admin dashboard | Roadmap |
| **Enterprise API — Compliance** | **$0.04–0.08 per transform** (volume tiers: 1k = $40–80, 100k = $3k–5k) | Universities, publishers, gov contractors | `POST /api/transform` as SLA API, batch crawl endpoint, WCAG report hook, on-prem proxy option | `POST /api/transform` already the product boundary — packaging + metering is the work |
| **White-label / Embed** | **$499–2,499/mo** | Publishers, gov sites | Branded "Accessible version" button + hosted transform, no ReadEasy branding, custom prompt/style | Roadmap |

No ads. No sale of reading history (which never leaves the device today).

---

## 5. Business Model & Unit Economics

**Model:** SaaS (self-serve Pro/Team) + usage-based API (Enterprise). Stateless app, no database, no auth to operate until paid tiers require entitlements.

### Cost of goods sold (COGS)

- **LLM (OpenRouter):** restructure is one JSON completion per transform. Primary `minimax/minimax-m3:free` + fallbacks `z-ai/glm-5.2:free`, `openrouter/free` — free-tier models today; paid equivalents at scale are ~$0.002–0.01 per transform (input ~2–6k tokens, output ~1–2k). Dominant cost.
- **Hosting (Vercel):** stateless Next.js, no DB, no image pipeline. Hobby → Pro scales with function invocations; at 100k transforms/mo, Vercel + bandwidth < $100.
- **No per-user storage:** history is `localStorage` (Pro optional sync is ~KB per user).

### Gross margin

- **Freemium at free-model COGS:** ~90%+ margin (LLM free tier). Limited by rate limits — acceptable for the free wedge.
- **Paid API at paid-model COGS:** sell at $0.04–0.08, COGS $0.005–0.01 → **~75–88% gross margin** before support.
- Blended target at $3M ARR: **75–80% gross margin**, SaaS-typical.

### CAC & payback (early assumptions, to be validated)

- Free readers acquired via direct URL sharing, campus disability offices, and gov-page SEO ("IRS EITC simplified") — **near-zero CAC** for B2C.
- B2B CAC via university pilots (disability services → IT procurement) and gov contractor channels; **payback < 6 months** on Team $49 and **< 3 months** on Enterprise API at 10k+ transforms/mo.

---

## 6. Go-to-Market

**Phase 1 — Campus wedge (months 1–6):**
- 10 pilot universities via disability services + writing centers. Offer Team free for one semester in exchange for case study + procurement intro. Each pilot seeds ~200–500 student advocates.
- SEO: accessible alternatives for the demo trio and adjacent pages (FAFSA, IRS forms) — pages that already rank but are unreadable.

**Phase 2 — Compliance API (months 6–18):**
- Sell `POST /api/transform` to university IT / gov web teams as "generate an accessible version on demand" — cheaper and fresher than manual remediation. Integrates as one button (`fetch` → render) or batch crawl for audits.
- Partners: accessibility auditors (who today sell reports but not fixes), LMS vendors (Canvas/Blackboard embed), gov digital service contractors (18F/USDS-adjacent).

**Phase 3 — Distribution (months 12–24):**
- **Browser extension** (roadmap): one-click transform of the current tab — same pipeline, new entry point. The extension is the "in production" story; the web app is the demo and the API skin.
- Embed SDK / white-label for publishers who want an on-site accessible view without sending traffic to ReadEasy.

---

## 7. Path to Sustainability

| Milestone | Revenue signal | What it proves |
|-----------|---------------|----------------|
| 10 campus pilots, 2k MAU | $0 (but logo pipeline) | Distribution + accessibility value |
| 1k Pro subscribers @ $9 | **$9k MRR** | Consumer willingness to pay for history/export |
| 20 Team plans @ $49 | **$1k MRR** incremental | Departmental budget exists |
| 10 Enterprise API @ $400/mo avg | **$4k MRR** | Compliance budget + API fit |
| **Combined ~$14k MRR → $168k ARR** | Break-even on one founder + Vercel/OpenRouter at this scale | Sustainability without venture |
| 100 API customers @ $500/mo avg + 5k Pro | **~$95k MRR → ~$1.1M ARR** | Venture-scale SaaS with 75%+ margin |

The business does **not** require venture to survive: stateless infra and free-tier LLMs make the free product sustainable to operate, and the first 10–20 paying Teams cover paid-model COGS. Venture (if pursued) funds extension + audit partnerships, not survival.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OpenRouter / model pricing or availability | Fallback chain already ships (`lib/llm/fallback.ts`); multiple free models; prompt is model-agnostic JSON. Self-hosted open-weight fallback is a later option. |
| Hallucination / liability | AI only reshapes text on the page — side-by-side with cleaned original for verification; no open-ended generation. `Ask this page` is grounded in cleaned text + cached for demo pages. |
| Fetch blocking (e.g., ssa.gov 403) | Raw-text paste path already covers this; API customers can POST HTML directly. |
| Accessibility overlay backlash | ReadEasy does not overlay broken ARIA — it produces a genuinely restructured, plain-language alternative alongside the original, auditable page by page. |

---

## 9. Links

- Product: [readeasy-founders.vercel.app](https://readeasy-founders.vercel.app)
- Repo (this branch): https://github.com/GhostInHex/readeasy/tree/hackathon/next-founders
- Disclosure: `HACKATHON_DISCLOSURE.md`
- Architecture & scalability: `docs/ARCHITECTURE.md`
- Submission checklist: `docs/NEXT_FOUNDERS_SUBMISSION.md`
