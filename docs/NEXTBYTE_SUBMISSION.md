# Next Byte Hacks V4 — Submission Checklist

> Devpost: https://next-byte-hacks-v4.devpost.com/ — Deadline Sep 30, 2026 @11:45pm EDT
> GitHub: https://github.com/GhostInHex/readeasy/tree/hackathon/next-byte
> Demo: [readeasy-nextbyte.vercel.app](https://readeasy-nextbyte.vercel.app)

## Eligibility (verify before submitting)
- [ ] Ages 13–18 only — confirm you qualify
- [ ] US only — confirm US residency
- [ ] Students only

## What to submit (Devpost project page)
- [ ] Description: what ReadEasy does (URL/rawText → clean → plain-language restructure → Focus/Dyslexia/Action/Listen/ADHD modes)
- [ ] Tech used: Next.js 15, React 19, TypeScript, Mozilla Readability + jsdom, OpenRouter, Vercel
- [ ] Public code repo link (branch URL above)
- [ ] Demo video (short, strongly encouraged) or screenshots
- [ ] Note: rules ask for projects "started from scratch during the event" — disclosure in `HACKATHON_DISCLOSURE.md` states the Buildverse base + in-window extension; judges decide

## Rubric mapping
- Creativity: semantic restructuring (not reader-mode stripping) + Bionic/ADHD micro-cards
- Technical Execution: `POST /api/transform` pipeline, strict JSON schema, one retry, fallback models, `npm run verify:trio`
- Design & UX: warm & calm tokens, Atkinson Hyperlegible, OpenDyslexic, side-by-side verification
- Impact: students with dyslexia/ADHD/low vision + UT Dallas Apply admissions demo

## Setup (for judges)
```bash
npm install
cp .env.example .env.local   # add OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```
