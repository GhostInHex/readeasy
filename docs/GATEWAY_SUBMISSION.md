# GatewayHacks 2026 — Devpost Submission Checklist

> **Event:** GatewayHacks 2026 — gatewayhacks-2026.devpost.com  
> **Deadline:** Oct 2, 2026 @ 12:00am EDT (Sep 1–Oct 1 build window)  
> **Branch:** `hackathon/gateway` → https://github.com/GhostInHex/readeasy/tree/hackathon/gateway  
> **Demo:** https://readeasy-git-hackathon-gateway-ghostinhex.vercel.app  
> **Primary Track:** Accessibility & Health (Track 1) — secondary: Equity in Education (Track 2)  
> **Disclosure:** `HACKATHON_DISCLOSURE.md` • **Track rationale:** `docs/GATEWAY_TRACK.md`

Use this checklist to populate the Devpost page. Every required field is marked.

---

## 1. Title (Required)

**ReadEasy — the web, made readable for every reader (GatewayHacks 2026 — Accessibility & Health)**

- Short title for thumbnail: **ReadEasy**
- Tagline (Devpost subtitle): *Simplifying medical and educational gov pages for every reader — plain language + checklists for patients, students, and families.*

---

## 2. Problem — Health & Education Accessibility (Required)

### One-paragraph problem statement (paste to Devpost)

Government and medical pages — IRS benefits, USCIS immigration, university enrollment, payer portals — are jargon-dense, deadline-scattered, and formatted as walls of text. For readers with dyslexia, ADHD, low vision, or limited health literacy, this is not an inconvenience; it is a barrier to care, aid, and enrollment. Low health literacy is linked to missed deadlines, missed benefits, and poorer outcomes (HHS Healthy People 2030). WCAG-relevant gaps (fixed small type, poor contrast, low line-spacing, no task-focused view) compound the burden. Browser “reader mode” only strips styling — it does not rewrite language or extract actionable steps.

### Who is affected

- Patients / caregivers trying to understand medical bills, coverage letters, or benefits pages.
- Students and families (especially first-gen, ESL, neurodivergent) navigating syllabus, FAFSA, and enrollment pages.
- Readers with dyslexia, ADHD, or low vision — and anyone facing bureaucratic text on a deadline.

### Evidence (not invented)

- HHS/CDC/NIH health-literacy guidance; WCAG 2.2 AA (Perceivable/Understandable); USWDS plain-language principles.
- Live examples: IRS EITC, USCIS Students & Employment, UT Dallas Apply (fixtures + live URLs).

---

## 3. Solution — ReadEasy (Required)

### One-paragraph solution statement

**ReadEasy** restructures any web page into clear, accessible formats: paste a URL (or raw page text for sites that block fetching) and get a split view — cleaned original on the left, accessible version on the right — with toggleable reading Modes. It is not a summarizer; it is a **semantic restructure** where the AI reshapes text already on the page into strict JSON and never invents facts. Every Mode is a client-side renderer of that same JSON.

### Key features (for Devpost “Built with” / feature list)

- **Restructure pipeline** — `POST /api/transform` ({url} or {rawText}) → `{cleanedOriginal, restructured:{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}}`. One retry on malformed JSON, fallback model chain, structured errors — never a crash.
- **Focus mode** — one card at a time + progress, never a wall of text.
- **Dyslexia mode** — OpenDyslexic font, warm background tint, Bionic Reading (bolded word starts).
- **ADHD mode** — micro-cards: one idea per screen, key words bolded.
- **Action mode** — deadlines/required steps as checklist (“Step 2 of 4”).
- **Listen mode** — browser speech synthesis with karaoke word highlighting in sync.
- **Reading level** — Simpler/Standard toggle (second restructure variant).
- **Ask this page** — grounded Q&A over page text only; demo-trio answers pre-cached so the demo never depends on the network.
- **Readability score** — original vs. transformed grade (“college → grade 5”).
- **Cosmetic controls** — text size, line spacing, high-contrast/dark theme (pure CSS, no AI).
- **Page history + Export** — localStorage history (no DB) + print-friendly export.

### Beginner-friendly in 30 seconds

Paste `https://www.irs.gov/credits-deductions-for-individuals/earned-income-tax-credit` → see plain language + checklist. If a site blocks fetching (e.g. ssa.gov 403), paste raw text.

---

## 4. Visual — At Least One Required (Required)

Devpost requires **at least one visual** (image/screenshot/video). Provide these:

- [ ] **Screenshot placeholder — Dyslexia mode (primary visual)** — `fixtures/` cached screenshot or capture of ReadEasy Dyslexia rendering of IRS EITC (OpenDyslexic + warm tint + Bionic bold-leads + increased line spacing). Caption: “Dyslexia mode: same page, readable type, warm tint, Bionic Reading.”
  - Suggested path for upload: `public/screenshots/dyslexia-mode.png` or reuse `fixtures/screenshots/*` (commit the image before submission).
  - Alt text: “Split view: original IRS page on left, ReadEasy Dyslexia mode on right with OpenDyslexic font and warm background.”
- [ ] **Second visual (recommended):** Focus vs. ADHD micro-card comparison (one idea per screen) + Action checklist screenshot.
- [ ] **Third visual (optional):** Readability score delta (“college level → grade 5”) + Listen karaoke highlight frame.

> Do not submit with zero visuals — Devpost will mark the submission incomplete.

---

## 5. Video — Max 5 Minutes (Required: video or visual; Strongly Recommended)

Max length: **5 minutes**. Keep to 2:00–3:30. Outline below respects Gateway judging weights (Social Impact 40%, Technical 30%, Innovation 20%, Design 10%).

**Video outline (with time budget):**

| Timestamp | Beat | Script cue |
|---|---|---|
| 0:00–0:20 | Hook — the problem | “A medical bill or gov page shouldn’t require a college reading level. For patients and students, that’s a health and education barrier.” Show dense IRS/USCIS page. |
| 0:20–0:45 | Who it harms | Health-literacy + WCAG gap in one line; name dyslexia/ADHD/low-vision + students/families. |
| 0:45–1:30 | Live demo — Transform | Paste IRS EITC URL → transform. Show split view (original left, restructured right). Point out readability delta + summary. |
| 1:30–2:15 | Modes | Toggle Dyslexia (Bionic + OpenDyslexic), then Focus/ADHD (one idea per screen), then Action checklist (deadlines). Raw-text paste fallback note (10s). |
| 2:15–2:40 | Trust layer | Ask this page (grounded Q&A) + “AI never invents facts — everything is reshaped from the page on the left.” |
| 2:40–3:00 | Tech (brief) | “One endpoint owns the pipeline: fetch→Readability→OpenRouter JSON→client renderers via modes registry. Stateless: no DB, no auth.” |
| 3:00–3:20 | Accessibility & tracks | “Primary Track 1: Accessibility & Health — a tool that helps patients understand medical bills. Secondary: Equity in Education — students understand dense syllabus pages.” |
| 3:20–3:30 | Close + links | “Live at readeasy-git-hackathon-gateway...vercel.app — GitHub branch hackathon/gateway, built Sep 1–Oct 1. Thank you.” |

**Recording checklist:**

- [ ] Screen capture includes both panels + mode toggles clearly readable at 1080p.
- [ ] No secrets on screen (API keys blurred if shown).
- [ ] Captions/subtitles added (accessibility + judges watching muted).
- [ ] Upload to YouTube/Vimeo as public or unlisted; paste link to Devpost.
- [ ] Duration verified ≤5:00.

---

## 6. Links (Required: GitHub and/or Live Site — provide both)

- **GitHub branch (this submission):** https://github.com/GhostInHex/readeasy/tree/hackathon/gateway
- **Live demo (submission branch):** https://readeasy-git-hackathon-gateway-ghostinhex.vercel.app
- **Base repo:** https://github.com/GhostInHex/readeasy
- **Disclosure:** `HACKATHON_DISCLOSURE.md` (on this branch)
- **Track rationale:** `docs/GATEWAY_TRACK.md` (on this branch)
- **Demo video (once uploaded):** _(paste YouTube/Vimeo link here)_

---

## 7. Tech List (Devpost “Built With”)

`Next.js 15 (App Router)` · `React 19` · `TypeScript` · `OpenRouter` (LLM, fallback chain) · `Mozilla Readability` + `jsdom` · `Vercel` · `Browser speechSynthesis` (Listen/karaoke) · `localStorage` (history) · `Atkinson Hyperlegible` + `OpenDyslexic` + Bionic Reading formatting

Add to Devpost tags: `accessibility` `health-literacy` `nextjs` `openrouter` `wcag` `dyslexia` `adhd` `education-equity`

---

## 8. Submission Metadata & Rules Compliance

- [ ] **Built during window:** Sep 1–Oct 1, 2026 (disclosed in `HACKATHON_DISCLOSURE.md`; pre-existing Buildverse work Sep 1–6 listed separately; this commit is the Gateway delta).
- [ ] **Original work clause satisfied via substantial extension** — see disclosure “Compliance” section.
- [ ] **Tracks selected:** Primary Accessibility & Health, secondary Equity in Education; Momen track noted as optional/eligible but not used (built with Next.js+OpenRouter).
- [ ] **Social-good & beginner-friendly narrative** present in problem/solution/video (judging: Social Impact 40% is the top weight).
- [ ] **No DB / no auth / no private data** — stateless, localStorage-only, safe for judges to test any URL.
- [ ] **Tests & build green** before submit: `npm run typecheck` / `npm test` / `npm run build`.

---

## 9. Pre-Submit Final Checks

- [ ] Devpost page shows title, problem, solution, **≥1 visual**, video link (≤5 min), and GitHub branch link.
- [ ] README banner on `hackathon/gateway` branch points reviewers to `HACKATHON_DISCLOSURE.md` and `docs/GATEWAY_TRACK.md`.
- [ ] Live demo URL loads and transforms the demo trio + an arbitrary gov page via paste.
- [ ] All new work is committed to `hackathon/gateway` (this branch) — no uncommitted files.
- [ ] Video thumbnail and first visual are dyslexia/Focus modes (most photogenic, most on-track for Accessibility).

