# ReadEasy — AI for Human Health

**Tagline:** The web, made readable for every reader. Paste any health page → get plain language you can act on.

## Problem

36% of U.S. adults have basic or below-basic health literacy (HHS). Medical pages — MedlinePlus, CDC, after-visit summaries — are written at college level, dense with jargon. Patients with low literacy, dyslexia, ADHD, low vision, or limited English leave appointments unsure what matters, when to call, or how to take meds. Misunderstanding drives missed follow-ups and worse outcomes.

## Solution

**ReadEasy** restructures any health page into plain language + action checklist — without inventing facts. Paste a URL or raw text → verified side-by-side: cleaned original left, accessible version right.

The AI only reshapes text already on the page into strict JSON `{title, summary, readingTimeMinutes, actionItems, sections[{heading, simplifiedText, keyTakeaway}]}`. One retry on bad JSON, then error — never hallucinated.

**New for UnivaBio:** health fixture `fixtures/univabio-health/cleaned.json` (MedlinePlus "Understanding Diabetes") — what it is → symptoms → management → when to see a doctor.

## Key Features

- **Plain-language restructure:** Rewritten to ~grade 5 (Simpler → ~grade 3), short sentences, active voice, jargon expanded from the page itself.
- **Key takeaway per section:** One skimmable sentence per section.
- **Action items for care:** Checklist with urgency — "Check blood sugar as advised — medium", "See doctor if sores do not heal — high", "Bring medication list — medium". Deadlines copied verbatim.
- **Accessible modes:** Focus, Dyslexia (OpenDyslexic + Bionic), ADHD (one idea per card), Listen (TTS + karaoke), Action (Step 2 of 4). Ask this page is grounded in page text; cosmetic controls are CSS only. Original stays visible for verification.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · OpenRouter (LLM, fallback chain) · Mozilla Readability + jsdom (Fetch & Clean, no AI) · Stateless, no DB, no auth · Vercel.

Pipeline: `POST /api/transform` → Fetch → Clean (strip ads/nav/scripts) → Restructure (LLM → validated JSON) → Render via `components/modes/registry.ts`. One registry line per mode.

## Health Impact

**Who benefits:** Adults with low health literacy, older adults, readers with dyslexia/ADHD/low vision, caregivers, community health workers. Clinicians can paste an after-visit summary and hand patients a checklist.

**Would it help?** Yes — same guidance, lower barrier. "What it is → What to watch → What to do → When to call" with takeaways and checklist improves recall and follow-through. Grounded (no outside facts) and verified side-by-side.

## Demo

**Live:** [readeasy-univabio.vercel.app](https://readeasy-univabio.vercel.app) · **Code:** https://github.com/GhostInHex/readeasy/tree/hackathon/univabio · **Fixture:** `fixtures/univabio-health/` (MedlinePlus Diabetes) + trio (IRS, UT Dallas, USCIS).

*One page · Built on ReadEasy Sep 1–6, extended Aug 7–Oct 6 for UnivaBio: AI for Human Health. Pre-existing disclosed; new health framing + fixture in this branch. See HACKATHON_DISCLOSURE.md.*
