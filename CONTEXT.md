# CONTEXT.md

## Current situation

We are preparing an entry for the **BUILDVERSE Hackathon** (by **ACM DALLAS**, hosted on HackCulture).
Working directory `C:\Users\vinay\Documents\AI\hackathon` is otherwise empty.

Source of truth: https://hackculture.io/hackathons/buildverse-hackathon
(API snapshot saved at `.scratch/buildverse_pretty.json`, fetched 2026-09-01.)

## Key facts

- **Format (user clarification, 2026-09-01): user participates ONLINE / remotely.**
  (Platform metadata lists `mode: hybrid` and Build Day with an in-person flag in
  Dallas — "Build from anywhere. Bring it to Dallas" — but for this team the
  participation is remote. Demo must therefore work as a recorded/uploaded
  artifact, not a live stage walkthrough.)
- **Tagline:** "Build from anywhere. Bring it to Dallas" — Dallas showcase applies only if attending in person.
- **Dates:** Aug 24, 2026 → **Sep 6, 2026, 17:30 UTC** (ends in ~5 days as of Sep 1).
- **Free** to enter. Team size **2–4 members**. Open to students, developers, innovators, tech enthusiasts.
- **AI tools are explicitly encouraged**; APIs, SDKs, open-source allowed with rights/licensing respected and disclosure where requested.

## Timeline (phases)

| Phase | UTC | CST (USA) |
|---|---|---|
| Registration | Aug 21 – Sep 2, 18:29 | Opens Aug 20, 10:30 PM – closes Sep 2, 12:29 PM |
| Team Formation | Aug 21 12:30 – Sep 2, 18:29 | Opens Aug 21, 6:30 AM – closes Sep 2, 12:29 PM |
| Build Day (submission, in-person flag) | Sep 4, 23:00 – Sep 6, 17:00 | Opens Sep 4, 5:00 PM; **submit by Sep 6, 11:00 AM**; presentations Sep 6, 1:00–5:00 PM |

## Tracks / Themes

FAQ lists 7: **Artificial Intelligence, Smart Campus, HealthTech, FinTech, Sustainability, Social Impact, Open Innovation.**

The API's detailed theme is **Responsible AI & Inclusive Innovation**, with 6 problem statements:
1. **AI for Communities & Social Good** — public services, education, accessibility, nonprofits, underserved populations.
2. **AI Safety & Reliability** — hallucinations, failures, security, harmful outputs, human oversight.
3. **Responsible & Ethical AI** — fairness, privacy, transparency, explainability, accountability.
4. **Child Safety & Digital Well-being with AI** — age-appropriate AI, harmful-content protection, privacy.
5. **AI for Accessibility & Inclusion** — remove barriers for people with disabilities.
6. **AI Evals & Judging AI** — evaluators, LLM-as-a-judge, agent evals, hallucination detection, bias testing, safety benchmarks.

## Prizes

Not yet published (prize list empty in API). Stated: **prizes, swag, certificates** + showcase on stage.

## Judges

- Narasimha Reddy Annapareddy — Manager, NetSuite Software Engineering, ChargePoint
- Gaurav Prabhakar — AVP / Senior SWE, U.S. Bank (software + AI)
- Prasad Velpula — Senior SWE, AT&T (Java, cloud, distributed systems)
- Nithesh Gudipuri — Associate Director, Technology, Raymond James (AI, data, architecture)
- Venkata Pruthvi Teja Pandugayala — Independent Researcher / Senior Data Engineer

## Judging criteria (from rules)

- **Innovation** (originality/creativity)
- **Problem Relevance** (how well it addresses the chosen problem)
- (plus further criteria in rules — functional prototype, tech stack, demo expected)

## Submission requirements

Problem statement, solution description, key features, tech stack, demo/prototype, repo/links, demo video if required. Submit **before Sep 6, 11:00 AM CST**. Original work; existing projects only as a foundation with meaningful hackathon-time contributions.

## Registration questions asked by platform

University/College name (required), LinkedIn URL (required), ACM/IEEE membership number (optional), "Why should we select you?" social post link (optional — tag partners).

## Contact

Dallas Team — info@dallas.acm.org

## Project: ReadEasy — decisions (grill session, 2026-09-01)

- **Builder:** solo (user), already registered on HackCulture.
- **Stack:** Next.js + React; LLM via **OpenRouter** (user has many keys); deploy on **Vercel**; demo video recorded separately.
- **Not a browser extension.** The extension stays as the "in production…" talk track only. Raw-text paste covers pages that block scraping.
- **MVP modes:** Focus cards · Dyslexia/Bionic · Action Extractor · simple **Listen** (browser speech, no highlight sync).
- **Cosmetic toggles (CSS-only, no LLM):** text size, line spacing, high-contrast/dark.
- **Stretch AI mode (build only after MVP works):** **ADHD mode** — micro-cards, one idea per card, bolded key words, progress indicator, max 2 sentences on screen. First stretch goal ("if time allows"). Literal-language mode (cognitive accessibility) is second stretch / Q&A talking point. Never a generic "summarize" mode.
- **Readability score:** stretch, last ("Original: college level → ReadEasy: grade 5").
- **Left panel rule:** default = **cleaned original text** (pre-AI, original wording, plain style). For the cached demo pages only = **pre-captured screenshot** of the messy page.

## Post-MVP round (grill session 2, 2026-09-01)

- **Baseline first:** current app deploys to Vercel BEFORE feature work starts — a complete entry must exist at all times. Feature work deploys on top.
- **Features approved (loose order, no fixed dates):**
  1. **Karaoke Listen** — browser TTS with word highlighting in sync (no LLM).
  2. **Ask this page** — grounded Q&A over the cleaned page text; 3 suggested prompts; answers **pre-cached for the demo trio** (live LLM only as enhancement). Cached-demo rule is non-negotiable.
  3. **Reading level** — Simpler/Standard pill pair; Standard is today's output, Simpler is a second restructure variant (same pattern as ADHD mode).
  4. **My pages history** — localStorage, revisit past transforms (no DB).
  5. **Export simplified page** — print stylesheet.
- **Rejected:** multi-language output (quality risk, off-problem-statement).
- **Design:** direction = **warm & calm** (cream/off-white, deep ink text, one accent, generous spacing, large type). Body font **Atkinson Hyperlegible**; warm humanist heading font; **OpenDyslexic retained** for dyslexia mode. **Default light theme, manual dark toggle** (no auto `prefers-color-scheme`). The before/after left-panel/right-panel skeleton is load-bearing — kept.
- **Design process:** design **tokens** (palette/type/spacing one-pager) agreed FIRST; features build against them as CSS variables; the full **visual overhaul happens LAST**, done interactively together (not overnight). User explicitly chose design-last for the visual pass.
- **Execution split:** features run via the **overnight runner** as tickets; design overhaul is interactive human+agent work.
- **Target:** all work done by end of Sep 3; video + submission after. Hard rule: master stays shippable; nothing merges without green tests.

## Project vocabulary (round 2)

- **Karaoke highlighting** — Listen mode highlighting each word on screen in sync with the browser's speech.
- **Ask this page** — question box over a transformed page; answers grounded only in that page's cleaned text; three suggested prompts per page.
- **Reading level** — the Simpler/Standard toggle between two Restructure variants of the same page.
- **Design tokens** — the agreed palette, type, and spacing values defined before feature work; applied via CSS variables.
- **Left panel rule:** default = **cleaned original text** (pre-AI, original wording, plain style). For the cached demo pages only = **pre-captured screenshot** of the messy page.

- **Tagline:** **"ReadEasy — the web, made readable for every reader."** (app landing screen). Submission-form description: *"ReadEasy restructures any web page into clear, accessible formats for readers with dyslexia, ADHD, or low vision — rewritten in plain language, with deadlines extracted into simple checklists."* Person-first language always; no labeling or pity framing.

## Project vocabulary

- **Transform** — the one-button action: fetch URL (or take pasted text) → clean → LLM restructure → render.
- **Cleaning** — server-side: `fetch()` HTML, strip ads/nav/scripts with Readability. No AI involved.
- **Restructure** — LLM call returning strict JSON (title, summary, action items, sections with simplified text + key takeaway). The AI only reshapes existing text; it never invents facts.
- **Mode** — a view/rendering of the restructured JSON. Cosmetic toggles are styling only; AI modes change the restructure prompt.
- **Raw-text fallback** — second input path: paste page text directly. Covers blocked sites (proven: ssa.gov returns 403 to our fetch).
- **Demo trio** — the 3 cached, verified demo pages: IRS Earned Income Tax Credit · UT Dallas First-Year Apply · USCIS Students & Employment. Backup: usa.gov/visas. All verified server-rendered 2026-09-01.
- **Cached page** — pre-fetched cleaned text + screenshot of a demo trio page, saved before Build Day so the video can never fail live.
