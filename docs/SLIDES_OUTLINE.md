# ReadEasy — Practice to Create Slide Deck Outline (Ideathon)

> **Purpose:** Ideathon allows Figma/Canva/slides — no code required. This 6-slide outline is optimized for the 25/25/25/25 rubric (Originality, Presentation, Visuals, Plausibility). Pair with `docs/PRACTICE_PITCH.md` video script (3–5 min, timed to 4:10).
> **Demo:** https://readeasy-git-hackathon-practice-ghostinhex.vercel.app | **Repo:** https://github.com/GhostInHex/readeasy | **Disclosure:** `HACKATHON_DISCLOSURE.md`

## Design Direction (Apply to All Slides)

- **Palette:** Warm & calm — cream `#FFFBF0` background, soft indigo `#6366F1` primary, charcoal `#1E1B4B` text, amber `#F59E0B` accent for deadlines. High-contrast variant for accessibility.
- **Type:** Atkinson Hyperlegible (body/UI), OpenDyslexic (Dyslexia mode specimen), generous line-height 1.7, 18px minimum.
- **Layout:** Large type, one idea per slide, generous whitespace. No wall of text — dogfood the product.
- **Accessibility:** 4.5:1 contrast minimum, alt text on every image, export PDF tagged.

---

### Slide 1 — Title

**Title:** ReadEasy — the web, made readable for every reader.
**Subtitle:** Practice to Create · Ideathon Submission · Reuse explicitly allowed per rules
**Visual:** Warm gradient hero, mock of split view (original | accessible) faded behind title. QR codes: Demo + GitHub.
**Footer:** `hackathon/practice` branch · disclosure in `HACKATHON_DISCLOSURE.md` · 3–5 min video
**Speaker note (10s):** "The web wasn't built for every reader. ReadEasy fixes that."

### Slide 2 — Problem

**Title:** The web blocks the readers who need it most
**Bullets (max 3, large type):**
- 80%+ of pages fail accessibility checks — government pages worst
- `ssa.gov` → 403 on fetch; paste still yields jargon walls
- Dyslexia 5–15%, ADHD 5–9% globally — reader mode only strips CSS, does not restructure

**Visual:** Left: cluttered page screenshot. Center: `curl -I ssa.gov → 403` terminal shot. Right: reading-burden illustration (wall of text → overwhelmed reader). Caption stats with source placeholders.
**Anticipated judge Q:** "Why not just reader mode?" → Answer on next slide.
**Speaker note (40s):** See `PRACTICE_PITCH.md` Problem beat.

### Slide 3 — Solution

**Title:** One-button Transform — semantic restructuring, not stripping
**Visual:** Pipeline diagram (3 steps, horizontal):

```
[ URL / Raw Text ] → [1 Fetch & Clean — Readability] → [2 Restructure — OpenRouter JSON] → [3 Render — Mode Registry]
                                              ↓
                         {title, summary, readingTime, actionItems[], sections[]}
```

**Callouts:**
- Checklist extraction: "Step 2 of 4: Submit FAFSA by Dec 1"
- Grounded: reshapes text already on page, never invents facts
- Modes are renderers of one JSON — adding a Mode = 1 registry line

**Speaker note (60s):** Solution beat. Emphasize "never invents facts" + split-view verification.

### Slide 4 — Demo

**Title:** Live in 30 seconds — the demo trio
**Visual:** Screen capture of https://readeasy-git-hackathon-practice-ghostinhex.vercel.app — trio buttons (IRS / UT Dallas / USCIS) highlighted. Inset: split view with sync scroll + readability badge "college → grade 5". Second inset: "Ask this page" Q&A, grounded answer.

**Flow (annotated screenshots, not live during pitch if time-tight):**
1. Click Transform on IRS EITC → split view appears
2. Toggle Simpler/Standard — grade drops
3. Ask "When is the deadline?" → grounded answer (pre-cached)
4. Paste ssa.gov raw text → same pipeline, no fetch

**Fallback:** Cached fixtures guarantee demo works offline; note raw-text path for blocked sites.
**Speaker note (60s):** How It Works beat. Pre-load one trio page before recording.

### Slide 5 — Design & Impact

**Title:** Design is accessibility
**Visual:** 3-column grid:

| Tokens | Type | Modes |
|--------|------|-------|
| Cream / indigo / charcoal swatches | Atkinson Hyperlegible specimen + OpenDyslexic specimen | 5 mode cards: Focus (progress), Dyslexia (warm+Bionic), Action (checklist), Listen (karaoke highlight), ADHD (micro-cards) |

**Details:**
- Bionic Reading (bolded word starts) + line spacing / text size controls (pure CSS)
- Listen: speech synthesis + word-level highlight
- Export: print-friendly; History: localStorage, no DB

**Impact line:** "If you can verify the original is right there, you can trust the simplification."
**Speaker note (40s):** Visuals beat — tie every visual choice to a reading need.

### Slide 6 — Future (Plausibility)

**Title:** Plausible today, extensible tomorrow
**Visual:** Architecture: `Vercel (Next.js, stateless)` ↔ `OpenRouter (cheap, fallback chain)` — no DB/auth. Cost callout: "cents per page". Roadmap arrow: → Browser Extension.

**Bullets:**
- **Now:** Live on Vercel, 1 env var (`OPENROUTER_API_KEY`), stub fallback without key
- **Cost:** OpenRouter + fallback models, retry on malformed JSON, structured errors
- **Next:** Browser extension (Transform any page in place) + localStorage history (no account, no breach risk)
- **Why it wins:** No infra to maintain, every Mode is one file, judges can try it in 10s

**Close:** QR to demo + GitHub. Tagline return: "The web, made readable for every reader."
**Speaker note (30s + 10s close):** Plausibility + Close beats.

---

## Appendix (Not Presented — For Devpost / Q&A)

- **Sources:** See `docs/PRACTICE_PITCH.md` Sources List placeholder (WebAIM, ssa.gov 403, IDA, CDC, Readability, Atkinson, OpenDyslexic, OpenRouter).
- **Reuse disclosure:** `HACKATHON_DISCLOSURE.md` — Buildverse Sep 1–6 reused as allowed; new work is framing/slides/video.
- **AI disclosure:** OpenRouter for Restructure; disclosed, not hidden.
- **Deck export:** PDF + Figma/Canva link for judges; ensure 16:9, tagged PDF, captions on video.

## Build Checklist

- [ ] Apply palette/tokens to master slide
- [ ] Replace placeholder screenshots with actual demo captures (trio + split view + ssa.gov 403)
- [ ] Add QR codes (demo + repo) and verify they scan
- [ ] Fill source URLs in Slide 2 captions + appendix
- [ ] Rehearse with `PRACTICE_PITCH.md` — total ≤ 5:00 (target 4:10)
- [ ] Export tagged PDF + record 3–5 min video with captions
