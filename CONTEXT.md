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

- **Tagline:** **"ReadEasy — the web, made readable for every reader."** (app landing screen). Submission-form description: *"ReadEasy restructures any web page into clear, accessible formats for readers with dyslexia, ADHD, or low vision — rewritten in plain language, with deadlines extracted into simple checklists."* Person-first language always; no labeling or pity framing.

## Project vocabulary

- **Transform** — the one-button action: fetch URL (or take pasted text) → clean → LLM restructure → render.
- **Cleaning** — server-side: `fetch()` HTML, strip ads/nav/scripts with Readability. No AI involved.
- **Restructure** — LLM call returning strict JSON (title, summary, action items, sections with simplified text + key takeaway). The AI only reshapes existing text; it never invents facts.
- **Mode** — a view/rendering of the restructured JSON. Cosmetic toggles are styling only; AI modes change the restructure prompt.
- **Raw-text fallback** — second input path: paste page text directly. Covers blocked sites (proven: ssa.gov returns 403 to our fetch).
- **Demo trio** — the 3 cached, verified demo pages: IRS Earned Income Tax Credit · UT Dallas First-Year Apply · USCIS Students & Employment. Backup: usa.gov/visas. All verified server-rendered 2026-09-01.
- **Cached page** — pre-fetched cleaned text + screenshot of a demo trio page, saved before Build Day so the video can never fail live.
