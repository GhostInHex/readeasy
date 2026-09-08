# Hackathon Disclosure — Next Founders

## What this branch is

This branch `hackathon/next-founders` is the submission branch for the **Next Founders Hackathon** ([next-founders.devpost.com](https://next-founders.devpost.com)) — deadline **October 15, 2026 @ 5:00 PM EDT**.

## Pre-existing work (disclosed)

**ReadEasy was built September 1–6, 2026** as an entry for the BUILDVERSE Hackathon (ACM Dallas / HackCulture). That build is the base of this repository:

- Core product: URL → fetch → Mozilla Readability + jsdom clean → OpenRouter LLM restructure into strict JSON → multi-Mode rendering (Focus, Dyslexia, Action, Listen, ADHD).
- Routes: `POST /api/transform` (main pipeline), `POST /api/ask` (grounded Q&A), cached fixtures for the demo trio (IRS EITC, UT Dallas Apply, USCIS Students & Employment), `lib/history.ts` (localStorage), print export, readability scores.
- Stack: Next.js 15 App Router, React 19, TypeScript, Vercel stateless deploy, no database, no auth.
- Prior repo: https://github.com/GhostInHex/readeasy (`main` reflects the Sep 1–6 build).

All of the above existed **before** the Next Founders submission window and is disclosed as pre-existing.

## New work in this submission window (this commit)

Work on this branch during the Next Founders submission window focused on **startup viability** — what the judges call Business & Finance, Scalability, and Communication — not on claiming the Sep 1–6 product as new:

| File | Purpose | New in this window |
|------|---------|---------------------|
| `BUSINESS_MODEL.md` | Full B2B2C business model, TAM/SAM, revenue streams, unit economics, go-to-market, sustainability path | **Yes** |
| `docs/ARCHITECTURE.md` | Codebase walkthrough + textual architecture diagram + stack + scalability analysis for the Technical Execution video segment | **Yes** |
| `docs/NEXT_FOUNDERS_SUBMISSION.md` | Rubric checklist mapping Technical / Innovation & UX / Business & Finance / Communication to artifacts and video script | **Yes** |
| `README.md` (banner) | Submission-branch header linking disclosure, business model, architecture, demo and repo URLs | **Yes** |
| `HACKATHON_DISCLOSURE.md` (this file) | This disclosure | **Yes** |

No pre-existing code was misrepresented as new. Product code changes (if any) on this branch are minor copy/docs adjustments to frame the existing product as a SaaS business; the product itself remains the Sep 1–6 ReadEasy build.

## Compliance

- Next Founders permits building on pre-existing projects when disclosed — this file is that disclosure.
- All new documents in this commit were authored during the Next Founders submission window (Sep–Oct 2026) specifically to address the rubric: Technical Execution 25%, Innovation & UX 25%, Business & Finance 25%, Communication 25%, and the required 5-minute video sections (The Problem / The Build / The Demo / Scalability).
- Demo and repo for this submission: https://readeasy-git-hackathon-next-founders-ghostinhex.vercel.app · https://github.com/GhostInHex/readeasy/tree/hackathon/next-founders

## Verification

```bash
git log --oneline --all --graph
git diff main...hackathon/next-founders --stat
# New files in this commit should be exactly:
# HACKATHON_DISCLOSURE.md, BUSINESS_MODEL.md, docs/ARCHITECTURE.md, docs/NEXT_FOUNDERS_SUBMISSION.md + README.md banner
```
