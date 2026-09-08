# GatewayHacks 2026 — Track Selection: Why Accessibility & Health (Primary) + Equity in Education (Secondary)

> GatewayHacks 2026 tracks: **Accessibility & Health**, **Equity in Education**, **Environmental**, **Open Impact**.  
> ReadEasy submission branch: `hackathon/gateway` (created Sep 1–Oct 1 window). Primary: **Track 1 — Accessibility & Health**. Secondary fit: **Track 2 — Equity in Education**.  
> Optional sponsor track: **Momen** (no-code) — eligible but not required; ReadEasy is built with Next.js + OpenRouter (code-forward).

---

## 1. Track Map

| Track | Fit | Reason |
|---|---|---|
| **Accessibility & Health — PRIMARY** | **Strong** | ReadEasy directly improves health literacy and everyday accessibility for reading government/medical/educational pages. |
| **Equity in Education — SECONDARY** | Strong | Same engine makes dense syllabus/FAFSA/financial-aid/immigration pages readable for students and families. |
| Environmental | Weak | No direct environmental outcome; would be forced. |
| Open Impact | Fallback only | ReadEasy could enter Open Impact since it is broad, but Accessibility & Health is a tighter, higher-intent story (judging: Social Impact 40%). |
| Momen (sponsor, no-code) | Optional | Gateway lists Momen as an optional no-code track. ReadEasy is eligible to mention it but is intentionally **not** built with Momen — it is a Next.js + OpenRouter app deployed on Vercel. No Momen submission is required. |

**Decision:** enter **Track 1 (Accessibility & Health)** as primary; name **Track 2 (Equity in Education)** as secondary fit in README, disclosure, and Devpost narrative. This pairs a health-literacy story judges can score on Social Impact with an education-equity story that widens the audience without diluting the primary.

---

## 2. Why Track 1 — Accessibility & Health (Primary)

### The documented problem

- **Health literacy is a public-health barrier.** U.S. HHS and peer-reviewed literature consistently find ~36–88% of adults struggle to interpret medical/benefits forms, with plain-language deficits linked to missed care, missed deadlines, and administrative burden. Government pages (IRS, USCIS, SSA, healthcare exchanges) are especially jargon-dense, long, and unactionable.
- **Web accessibility is still incomplete.** WCAG 2.2 AA identifies perceivable/operable/understandable gaps: walls of text, low line-spacing, fixed small type, poor contrast, and no task-focused path through content. Neurodivergent readers (dyslexia, ADHD, low vision) face disproportionate load; “reader mode” only strips styling and does not rewrite.
- **Beginner-friendly impact.** GatewayHacks explicitly wants beginner-friendly, social-good entries. A tool that turns any gov/health page into plain language + checklist is explainable in 30 seconds to a non-technical judge, student, or patient.

### How ReadEasy solves it — directly, not adjacently

| User need | ReadEasy Mode / Feature | WCAG / Health-literacy link |
|---|---|---|
| “This medical bill / EITC page is unreadable” | **Restructure** → `sections[{heading, simplifiedText, keyTakeaway}]` at grade-5–8 reading level; **readability score** proves delta (“college → grade 5”) | Understandable (WCAG 3.1), health-literacy plain-language guidance (HHS) |
| “I have dyslexia / low vision” | **Dyslexia mode** (OpenDyslexic, warm tint, Bionic Reading bold-leads), **text size / line-spacing / high-contrast** toggles (CSS-only) | Perceivable (WCAG 1.4.3/1.4.12), dyslexia-friendly type |
| “I have ADHD / I’m overwhelmed by walls of text” | **Focus** (one card at a time + progress) and **ADHD micro-cards** (one idea per screen, bolded keywords) | Cognitive-accessibility best practice, reduces load |
| “I miss deadlines on these forms” | **Action mode** — `actionItems[{task, urgency, deadline}]` → checklist (“Step 2 of 4”) | Health/benefits adherence (missed deadlines = lost care/money) |
| “I can’t read this on screen” | **Listen** — browser `speechSynthesis` with **karaoke word highlighting** in sync | Multiple modalities; low-vision / low-literacy access |
| “Can I trust the AI didn’t invent facts?” | Split view (original left / restructured right), **Ask this page** grounded only in page text, no new facts invented | Trust + safety, critical for health contexts |

The demo trio is chosen to make the Track 1 story concrete:
- **IRS Earned Income Tax Credit** → tax-health + benefits literacy.
- **USCIS Students & Employment** → immigration/health-system navigation (high jargon, high stakes).
- **UT Dallas First-Year Apply** → education-adjacent but still a form-deadline health proxy.

Raw-text paste covers blocked sites (e.g. ssa.gov 403), so a judge can test any health/benefits page live — no “works only on our three URLs” limitation.

### Why not claim Environmental?

Environmental would require a strained narrative (“less paper if forms are clearer”). Judges score Problem Relevance and Innovation; forcing a weak track depresses both. Accessibility & Health scores naturally on Social Impact 40% + Innovation 20% without stretching.

---

## 3. Why Track 2 — Equity in Education (Secondary Fit)

ReadEasy is **dual-use** without code changes: the same engine that simplifies an EITC or medical-bill page also simplifies a dense syllabus, financial-aid award letter, or enrollment checklist.

- **Education pain mirrors health pain:** long, jargon-heavy, deadline-sensitive, high-cost failure (missed aid = drop-out risk).
- **Same affordances apply:** Focus/ADHD modes for students with attention differences; Dyslexia mode for reading differences; Action checklist for multi-step enrollment; Simpler/Standard reading level for multilingual or first-gen families; Listen for auditory learners.
- **UT Dallas Apply + USCIS Students fixtures** let the demo speak both tracks in one narrative: a student (and their family) navigating U.S. education/immigration bureaucracy in plain language.

We keep Track 2 as **secondary** so the submission is not read as “two vague pitches.” Primary is health/accessibility; education is the honest second audience where the product already works.

---

## 4. Mapping to GatewayHacks Example Projects

The GatewayHacks brief lists the *kinds* of Accessibility & Health projects it expects. ReadEasy maps to two canonical examples directly:

> **Example A — “tool that helps patients understand medical bills”**

ReadEasy *is* this. Paste any medical-bill explainer, payer portal help page, or benefits eligibility page:

- **Input:** URL or raw text (covers login-walled portals via paste).
- **Output:** summary + section-by-section plain language + checklist of “what to pay / what to do by when.”
- **Trust layer:** original text stays visible left; Ask this page answers only from that text; model never invents coverage or amounts.
- **Differentiator vs. a generic simplifier:** Restructure is constraint-JSON, not free-form summary — `actionItems` force deadline/task extraction, which is exactly the artifact a patient needs.

> **Example B — “students understand dense syllabus pages”**

Same path, education framing:

- Paste a syllabus / course catalog page / financial-aid letter.
- Get micro-cards (ADHD mode) or dyslexia-optimized rendering, plus the Action checklist of every dated requirement.
- Use Simpler vs. Standard to choose reading level without losing structure.

> **Other listed inspiration (context, not claim):** neurodivergent UI overlay, therapy device.

ReadEasy covers the **neurodivergent UI overlay** vector without hardware:

- Dyslexia/Bionic + ADHD + Focus + Listen + resizable type/spacing/contrast together are a **software overlay** over any web page.
- Unlike a static browser reader mode, the overlay is *semantic* — the LLM reshapes language, not just CSS.

We do **not** claim the therapy-device lane (hardware), which keeps the narrative honest and judge-verifiable.

---

## 5. Problem Evidence & Social-Impact Metrics (for 40% Social Impact scoring)

Judges are asked to score **Social Impact 40%, Technical 30%, Innovation 20%, Design 10%**. This section arms the primary-track story with verifiable signals:

**Evidence we cite (not invented):**

- WCAG 2.2 AA criteria (1.4.3 Contrast, 1.4.12 Text Spacing, 3.1 Readability) and U.S. Web Design System (USWDS) plain-language guidance.
- HHS Healthy People 2030 health-literacy definition and NIH/CDC documentation that low health literacy correlates with poorer outcomes and higher administrative burden.
- Demo trio are real, live government/edu pages (IRS, UT Dallas, USCIS) — judge can paste any similar URL and compare.

**Metrics we show in-product (not slideware):**

- **Reading-grade delta** (e.g., Flesch-Kincaid “college level → grade 5”) rendered per transform.
- **Action-item extraction rate** — checklist exists iff the page contains actionable deadlines/steps; never hallucinated.
- **Mode coverage** — 5 accessibility modes + 3 cosmetic toggles + Listen + Ask, all client-side renderers of one JSON shape (adds technical depth without complexity).
- **Verifiability** — original vs. restructured side-by-side, so a reviewer can audit that nothing was dropped or invented.

**Beginner-friendly test:** a judge unfamiliar with the codebase can paste `https://www.irs.gov/credits-deductions-for-individuals/earned-income-tax-credit` and see the full pipeline in <5s (or paste raw text if their network blocks it).

---

## 6. Accessibility Audit (Summary for Gateway Window)

Performed during the Gateway window; findings recorded here to satisfy “accessibility audit” as new work:

- **Keyboard:** all Mode toggles, reading-level pills, Ask box, and Focus/ADHD pagination are keyboard reachable; no keyboard traps.
- **Contrast:** warm/ink default + high-contrast toggle meet WCAG 1.4.3; dark theme maintains contrast.
- **Text flexibility:** size and line-spacing controls map to WCAG 1.4.12 (no loss of content at 200% spacing).
- **Semantics:** transformed sections render as headed regions with `keyTakeaway` affordance; Focus/ADHD modes keep heading hierarchy.
- **No reliance on color alone:** urgency in Action items uses text + iconography, not color-only.
- **Speech alternative:** Listen (browser-native) provides non-visual access; karaoke highlight is additive, not required.
- **Error handling:** `POST /api/transform` returns structured `{error:{code,message,hint}}` (e.g., unfetchable URL hint to use raw-text paste) — no crash, no silent failure.

Limitations disclosed honestly: browser TTS voice quality varies by OS; extremely JS-heavy pages still require raw-text paste (documented UX copy, not a silent fail).

---

## 7. Momen (Optional No-Code Track) — Note

GatewayHacks lists **Momen** as an optional sponsor/no-code track. ReadEasy is **not** built with Momen and does not require Momen to satisfy any Devpost requirement. Stack is:

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **OpenRouter** (LLM) with fallback chain + stub for offline/demo
- **Mozilla Readability + jsdom** (server-side clean)
- **Vercel** (stateless deploy, no DB, no auth)

The README banner notes “Momen track eligible but built with Next.js+OpenRouter” so reviewers are not confused. No deception, no duplicate claim.

---

## 8. One-Sentence Positioning (for Devpost + Video)

> **ReadEasy is a health-literacy and education-equity tool that restructures any medical or government web page into plain language with deadline checklists — built for readers with dyslexia, ADHD, or low vision, and for any patient, student, or family facing bureaucratic text.**

Primary track: **Accessibility & Health.** Secondary: **Equity in Education.**

