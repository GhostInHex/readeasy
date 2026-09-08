# ReadEasy — Practice to Create Pitch (3–5 min Video Script)

> **Total runtime:** ~4:10 (250s timed beats) — comfortably under the 5:00 limit. Leave 10s buffer at start/end.
> **Branch:** `hackathon/practice` | **Demo:** [Live Demo](https://readeasy-practice.vercel.app) | **Repo:** https://github.com/GhostInHex/readeasy

## Timing At-a-Glance

| Beat | Duration | Cumulative |
|------|----------|------------|
| 0. Cold Open / Title | 10s | 0:10 |
| 1. Problem | 40s | 0:50 |
| 2. Solution | 60s | 1:50 |
| 3. How It Works / Implementation | 60s | 2:50 |
| 4. Visuals | 40s | 3:30 |
| 5. Plausibility | 30s | 4:00 |
| 6. Close + CTA | 10s | 4:10 |

*Hard cap: must not exceed 5:00. Rehearse at 4:10 to leave margin for pauses.*

---

## 0. Cold Open (10s)

**[VISUAL: Title card — "ReadEasy — the web, made readable for every reader." Warm gradient, Atkinson Hyperlegible.]**

> "The web wasn't built for every reader. ReadEasy fixes that — one button, any page, made readable."

---

## 1. Problem (40s) — Originality context

**Goal:** Establish why browser reader mode is insufficient; ground in real example.

**[VISUAL: Slide 2 — Problem. Left: cluttered government page. Right: 403 error from ssa.gov. Caption: dyslexia 5–15%, ADHD 5–9% globally.]**

Script:

> "80% of the web fails basic accessibility checks. Government pages — the ones people need most — are the worst. Try to fetch ssa.gov programmatically: 403 Forbidden. Paste the text manually and you still get a wall of jargon.
>
> For readers with dyslexia, ADHD, or low vision, that wall is not an annoyance — it is a barrier to benefits, deadlines, and jobs. Reader mode only strips CSS. It does not simplify language, extract deadlines, or adapt to how you read."

**Sources placeholder (to fill in Devpost description):**
- [ ] W3C / WebAIM Million report — % inaccessible pages
- [ ] ssa.gov 403 fetch example (screenshot + curl)
- [ ] Dyslexia / ADHD prevalence (e.g., International Dyslexia Association, CDC)
- [ ] Reader-mode vs semantic restructuring comparison

---

## 2. Solution (60s) — Originality + Plausibility

**[VISUAL: Slide 3 — Solution. One input → Transform → accessible output. Split view appears.]**

Script:

> "ReadEasy is a one-button Transform. Paste any URL — or raw text when a site blocks fetching — and get a split view: the cleaned original on the left, an accessible version on the right.
>
> The pipeline is three steps. One: Fetch & Clean — server-side HTML fetched and stripped of ads, nav, and scripts with Mozilla Readability. Two: Restructure — the cleaned text is reshaped by an LLM via OpenRouter into strict JSON: title, summary, reading time, action items with urgency and deadlines, and sections with simplified text and a key takeaway. One automatic retry on malformed JSON, then a structured error — never a crash. Three: Render — every reading Mode is a client-side renderer of that same JSON, so no Mode needs defensive parsing.
>
> Checklists fall out automatically — 'Step 2 of 4: Submit FAFSA by Dec 1' — so deadlines are never buried."

**Key line for judges:** Semantic restructuring, not cosmetic stripping. AI never invents facts — it reshapes text already on the page.

---

## 3. How It Works / Implementation (60s) — Demo Trio + Verification

**[VISUAL: Slide 4 — Demo. Live screen capture on [Live Demo](https://readeasy-practice.vercel.app) — trio buttons visible. Split view sync scroll.]**

Script:

> "Let me show you on the demo trio — cached so the demo never depends on the network. IRS Earned Income Tax Credit. UT Dallas First-Year Apply. USCIS Students & Employment.
>
> Click Transform — left is the cleaned original, right is the simplified version. Toggle Simpler vs Standard to compare reading levels. See the grade drop: 'college level → grade 5' with readability scores.
>
> Ask this page — 'When is the deadline?' — answers are grounded only in that page's text. Demo pages are pre-cached so answers are instant.
>
> Every page renders side by side so you can verify nothing was dropped or invented. Paste raw text for blocked sites like ssa.gov — same pipeline, no fetch needed. And Listen mode highlights words karaoke-style as it reads aloud."

**Demo tip:** Pre-load one trio page before recording; show one Transform live, then cut to pre-recorded for speed.

---

## 4. Visuals (40s) — Visuals 25%

**[VISUAL: Slide 5 — Design & Impact. Token swatches, type specimens, mode grid.]**

Script:

> "Design is not decoration — it is accessibility.
>
> Tokens are warm and calm — cream backgrounds, soft indigo accents — not clinical white. Type is Atkinson Hyperlegible for low vision and OpenDyslexic for dyslexia, both toggleable. Bionic Reading bolds word starts to anchor the eye.
>
> Five Modes, one JSON: Focus — one card at a time with progress so there is never a wall; Dyslexia — OpenDyslexic + warm tint + Bionic; Action — deadlines as a checklist; Listen — speech synthesis with word highlighting; ADHD — micro-cards, one idea per screen, key words bolded.
>
> Plus cosmetic controls — text size, line spacing, high-contrast and dark theme — pure CSS, no AI needed — and a print-friendly export."

---

## 5. Plausibility (30s) — Plausibility 25%

**[VISUAL: Slide 6 — Future. Architecture diagram: Vercel → OpenRouter → stateless. Roadmap: extension.]**

Script:

> "This is already live on Vercel — stateless, no database, no auth. Deploys with one env var: OpenRouter API key. Without it, the app falls back to a canned stub so the UI stays usable.
>
> Cost is cents per page via OpenRouter, with fallback models on rate limits. Every Mode is one registry line plus one renderer — adding a Mode is trivial.
>
> Next is the obvious extension: a browser extension that adds the same Transform to any page you are on, plus history in localStorage — no account, no data to breach."

---

## 6. Close (10s)

**[VISUAL: Title card return — QR to demo + GitHub link.]**

> "ReadEasy — the web, made readable for every reader. Try the demo, read the disclosure, and reuse is welcome — it is explicitly allowed. Link in description."

---

## Sources List (Placeholder — Fill Before Submission)

1. WebAIM Million / W3C accessibility stats — [URL]
2. ssa.gov 403 reproduction — screenshot + `curl -I https://ssa.gov` — [URL / image]
3. Dyslexia prevalence — International Dyslexia Association — [URL]
4. ADHD prevalence — CDC / peer review — [URL]
5. Mozilla Readability — https://github.com/mozilla/readability
6. Atkinson Hyperlegible — https://brailleinstitute.org/freefont
7. OpenDyslexic — https://opendyslexic.org
8. Bionic Reading — https://bionic-reading.com
9. OpenRouter — https://openrouter.ai

## Links

- **GitHub:** https://github.com/GhostInHex/readeasy
- **Practice branch demo:** [Live Demo](https://readeasy-practice.vercel.app)
- **Disclosure:** `HACKATHON_DISCLOSURE.md`
- **Slides outline:** `docs/SLIDES_OUTLINE.md`

## Production Notes (For Editor)

- **Format:** Figma/Canva/slides allowed per rules; 3–5 min video, target 4:10.
- **Captions:** Burn in or upload SRT — accessibility is the point.
- **Music:** Keep under voiceover or omit; judges score presentation clarity.
- **Rehearsal:** Time with phone stopwatch; if over 4:30, trim Visuals beat first.
