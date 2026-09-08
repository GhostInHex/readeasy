# Code PDF Guide — ReadEasy / UnivaBio Submission

This guide produces the **Code PDF** required by UnivaBio (GitHub Repository / Code PDF). Export the pipeline and renderer source so reviewers can verify the health-literacy flow without browsing GitHub.

## What to include (required files)

Include these four load-bearing files — they prove the full transform pipeline and that every mode is a pure renderer of the same JSON:

1. **`app/api/transform/route.ts`** — the pipeline route: `POST /api/transform` accepts `{url}` or `{rawText}` → `fetch` → `clean` → `restructure` (LLM via OpenRouter) → `{cleanedOriginal, restructured}` or `{error:{code,message,hint}}`. Owns retry, fallback-model chain, and structured errors.
2. **`lib/clean.ts`** — Fetch & Clean (no AI): `cleanHtml()` uses Mozilla Readability + jsdom (strip ads/nav/scripts) and `cleanRawText()` for the blocked-page fallback. Throws `TransformFailure` on too-short/no-content.
3. **`lib/llm/prompt.ts`** — Restructure prompt: `SYSTEM_PROMPT`, `RESTRUCTURE_SCHEMA_TEXT` (`{title, summary, readingTimeMinutes, actionItems, sections}`), `SHARED_RULES` (grounded, grade-5 plain language, no invented facts), `VARIANT_INSTRUCTIONS` (default / adhd micro-cards), `READING_LEVEL_RULES` (standard / simpler), `buildUserPrompt()` + `RETRY_NUDGE`.
4. **`components/modes/registry.ts`** — Mode registry: one line per reading mode mapping `ModeId → renderer`. Proves every Mode is a client-side view of the same restructured JSON; adding a Mode is one registry entry + one file.

**Recommended extras (if space):** `lib/llm/openrouter.ts`, `lib/llm/fallback.ts`, `lib/llm/stub.ts`, `lib/llm/types.ts`, `components/modes/*.tsx` (one per mode), `app/api/ask/route.ts` (grounded Q&A), `fixtures/univabio-health/cleaned.json`.

## File tree (for PDF header)

```
readeasy/
├── app/api/transform/route.ts   # pipeline: fetch → clean → restructure → render
├── app/api/ask/route.ts         # grounded Ask this page (cached trio answers)
├── lib/clean.ts                 # Readability cleaning, no AI
├── lib/llm/
│   ├── prompt.ts                # schema, shared rules, level/variant prompts
│   ├── openrouter.ts            # LLM client
│   ├── fallback.ts              # fallback model chain
│   ├── stub.ts                  # canned stub (tests / no-key fallback)
│   └── types.ts                 # RestructureInput / variant types
├── components/modes/
│   ├── registry.ts              # mode → renderer map
│   ├── FocusMode.tsx
│   ├── DyslexiaMode.tsx
│   ├── ActionMode.tsx
│   ├── AdhdMode.tsx
│   └── ListenMode.tsx
├── fixtures/
│   ├── irs-eitc/                # trio fixture (cleaned.txt + meta.json)
│   ├── utdallas-first-year-apply/
│   ├── uscis-students-employment/
│   └── univabio-health/         # NEW health fixture: cleaned.json + screenshot-placeholder.md
├── docs/
│   ├── UNIVABIO_ONE_PAGER.md
│   └── UNIVABIO_SUBMISSION.md
└── HACKATHON_DISCLOSURE.md
```

## How to export

### Option A — Git archive (clean, reproducible)

```powershell
# from the worktree root
git -C "C:\Users\vinay\Documents\AI\hackathon\readeasy-worktrees\hackathon-univabio" archive --format=zip --output readeasy-code.zip hackathon/univabio
# unzip, then print the four required files to PDF via VS Code (see Option B)
```

Or export just the required files:

```powershell
mkdir code-pdf; Set-Location code-pdf
git -C "C:\Users\vinay\Documents\AI\hackathon\readeasy-worktrees\hackathon-univabio" show hackathon/univabio:app/api/transform/route.ts > route.ts
git -C "C:\Users\vinay\Documents\AI\hackathon\readeasy-worktrees\hackathon-univabio" show hackathon/univabio:lib/clean.ts > clean.ts
git -C "C:\Users\vinay\Documents\AI\hackathon\readeasy-worktrees\hackathon-univabio" show hackathon/univabio:lib/llm/prompt.ts > prompt.ts
git -C "C:\Users\vinay\Documents\AI\hackathon\readeasy-worktrees\hackathon-univabio" show hackathon/univabio:components/modes/registry.ts > registry.ts
```

### Option B — VS Code print to PDF (fastest for submission)

1. Open each file in VS Code.
2. `Ctrl+P` → "Print" or `File → Print` (or `Ctrl+Shift+P` → "Export to PDF" if the PDF extension is installed).
3. In the print dialog: enable **Background graphics**, set **Margins: Minimum**, **Scale: 90**, **Header/Footer: on** (shows file path and date).
4. Save as one merged PDF: print each file to PDF, then merge with any PDF tool (e.g., `pdftk route.pdf clean.pdf prompt.pdf registry.pdf cat output ReadEasy-Code.pdf`), or copy all four into one `.md` / `.txt` and print once.
5. First page: add a cover line: `ReadEasy — Code PDF — UnivaBio / hackathon/univabio — 2026-10-01 — https://github.com/GhostInHex/readeasy/tree/hackathon/univabio`

### Option C — Single PDF from markdown

Create `CODE_REVIEW.md` concatenating the four files in fenced blocks, then export via VS Code Markdown PDF or `pandoc`:

```powershell
pandoc CODE_REVIEW.md -o ReadEasy-Code.pdf --pdf-engine=wkhtmltopdf -V margin-top=12mm -V margin-bottom=12mm
```

## PDF checklist

- [ ] Cover: repo + branch + date + `HACKATHON_DISCLOSURE.md` reference
- [ ] Includes all four required files, untruncated, with paths as headers
- [ ] File tree (above) on page 1 or 2
- [ ] No secrets (no `.env`, no API keys) — the app runs with `READEASY_LLM_MODE=stub` when no key is set
- [ ] Page numbers and branch link in footer: `https://github.com/GhostInHex/readeasy/tree/hackathon/univabio`

## Notes

- The app is stateless (no DB, no auth); reviewers can run locally with `npm install; npm run dev` and `READEASY_LLM_MODE=stub` for a deterministic demo without an OpenRouter key.
- Health demo fixture `fixtures/univabio-health/cleaned.json` is mock cleaned text (MedlinePlus-inspired) — see `fixtures/univabio-health/screenshot-placeholder.md` for live screenshot capture before video/PDF.
