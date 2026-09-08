# Screenshots Guide — GIBC V2 Track 03 (3 Required)

This guide describes exactly what 3 screenshots to capture for the Devpost submission gallery. All captures are against the **fixtures trio** (pre-cached, no live-network dependency) at **1280×720**.

## General Capture Instructions

- **Source pages:** Use the fixtures trio — IRS Earned Income Tax Credit, UT Dallas First-Year Apply, USCIS Students & Employment (any one is acceptable; IRS EITC photographs well for all three). These are bundled in `fixtures/` and available without a live fetch.
- **Resolution:** Set browser window to **1280×720** (use DevTools device emulation or a window-resizer extension; macOS: 1280×720, Windows: same). Capture at 1× (no retina 2×) for Devpost.
- **How to get a clean capture:**
  1. `npm install` then `npm run dev` (or use the live demo: [readeasy-gibc.vercel.app](https://readeasy-gibc.vercel.app)).
  2. Paste the fixture URL or use the demo trio quick-select if present; alternatively paste the fixture's raw cleaned text via the raw-text fallback.
  3. Wait for transform to complete (Focus view by default).
  4. Use browser screenshot (DevTools → Capture screenshot) or OS screenshot cropped to 1280×720; save as PNG.
- **Tips:** Hide bookmarks bar, use light theme (default), 100% zoom, no DevTools open in capture. Show real content — do not blur or mock.

---

## Screenshot 1: Split View (cleaned original left vs Focus card right)

**What it proves:** Verifiability — the AI reshapes text already on the page and never invents facts; original is always visible.

- **State to capture:** After transform, default layout: **left panel = cleaned original text** (pre-AI, plain style), **right panel = Focus mode** (one card at a time with progress indicator, e.g., "Card 1 of 4").
- **Must be visible:** Left/right divider, cleaned original wording on left, a Focus card with heading + simplified text + key takeaway and progress indicator on right.
- **Page:** Any fixture trio page (IRS EITC recommended — dense government text makes the contrast obvious).
- **Annotation (optional):** Caption for Devpost: "Split view — cleaned original (left) vs Focus card (right). Every transform is verifiable side-by-side."

## Screenshot 2: Dyslexia / Bionic Mode with OpenDyslexic

**What it proves:** Accessibility personalization — generative restructuring + rendering for dyslexic readers.

- **State to capture:** Same transformed page, toggle **Dyslexia** mode on.
- **Must be visible:** **OpenDyslexic font**, **warm background tint** (cream/off-white), **Bionic Reading** (bolded word starts), readable card text. If the UI exposes a Dyslexia toggle/pill, include it in an active state.
- **Page:** Same page as Screenshot 1 for continuity (or any trio page).
- **Steps:** Transform → enable Dyslexia/Bionic toggle → capture the right panel (or full split view with Dyslexia styling evident).
- **Caption:** "Dyslexia mode — OpenDyslexic, warm tint, and Bionic Reading (bolded word starts) for low-friction reading."

## Screenshot 3: Action Checklist + Readability Score

**What it proves:** Utility beyond readability — deadlines/steps extracted as an actionable checklist, with measurable simplification.

- **State to capture:** Same transformed page, **Action** mode (or checklist panel) visible **and** **readability score** visible.
- **Must be visible:**
  - **Action checklist:** Extracted items like "Step 2 of 4" with `task`, `urgency`, and `deadline` where present (e.g., deadlines from the IRS/UT Dallas/USCIS pages).
  - **Readability score:** Original vs transformed reading grade (e.g., "college level → grade 5" or equivalent badge/score shown in UI).
- **If UI shows these in separate places:** Capture the view that shows both; otherwise take one capture with checklist in focus and ensure the readability badge is in frame (may require scrolling to include it — capture at 1280×720 still).
- **Caption:** "Action checklist + readability score — deadlines as steps (Step 2 of 4) and grade-level drop (college → grade 5)."

---

## File Naming & Upload

- Save as:
  - `01-split-view-1280x720.png`
  - `02-dyslexia-bionic-1280x720.png`
  - `03-action-readability-1280x720.png`
- Upload all 3 to Devpost → Screenshots (required, at least 3). Order as above.
- Keep originals in repo under `fixtures/` or `docs/screenshots/` if desired (optional for judges).

## Verification Before Upload

- [ ] All 3 are 1280×720 PNG, no DevTools/bookmarks in frame.
- [ ] Screenshot 1 shows both panels and Focus progress.
- [ ] Screenshot 2 shows OpenDyslexic + warm tint + Bionic bolding.
- [ ] Screenshot 3 shows checklist steps and readability score.
- [ ] Captured from fixtures trio (reproducible without network).
