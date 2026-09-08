# CSC Back-to-School — Disclosure

> Branch: `hackathon/csc` · Base repo: https://github.com/GhostInHex/readeasy · CSC window: Sep 4–Oct 4, 2026 (deadline Oct 5 @12:00am PDT)

## Substantial Development Statement

ReadEasy was built for BUILDVERSE (Sep 1–6, 2026) as a general accessibility reader. For the **CSC Back-to-School Hackathon (Sep 4–Oct 4, 2026)** the project was **extended with school-specific framing** and prepared as a separate submission branch `hackathon/csc`:

- **School-life framing:** the UT Dallas First-Year Apply page (`enroll.utdallas.edu/freshman/apply/`) is the lead demo — a bureaucratic admissions page that buries deadlines in paragraphs — positioned explicitly as the school-life problem this branch solves.
- **Accessibility for students** (ages 13–18): dyslexia/ADHD/low-vision modes, plain-language rewriting, and deadline extraction are presented and documented as a student aid, not a general web tool. See `docs/CSC_IMPACT.md`.
- **Submission transparency for CSC:** this disclosure (`HACKATHON_DISCLOSURE.md`), `AI_DISCLOSURE.md`, `docs/CSC_IMPACT.md`, and `docs/CSC_SUBMISSION.md`, plus the README submission banner, were all authored inside the CSC window. The delta of this branch (those four docs + README edit) is the CSC-window work.

Pre-existing code is disclosed below and **not claimed as new**. All substantial new development claimed for CSC is the school-specific framing, docs, and submission preparation listed under "New Work During CSC Window."

This satisfies: *"Participants may brainstorm ideas, form teams, research problems, and learn tools before the hackathon begins. Substantial development of the submitted project must take place during the official hackathon period. Any pre-existing code, projects, datasets, designs, or other major assets must be clearly disclosed."*

## Pre-existing Assets (Built Before Sep 4, 2026 — Disclosed)

Built for BUILDVERSE Sep 1–6 and reused with significant new school-specific work layered on top. Not claimed as CSC-window work:

- **Fetch & Clean pipeline** — server-side `fetch()` + Mozilla Readability + jsdom stripping ads/nav/scripts. No AI. Implemented in `lib/clean.ts` / `lib/fetch.ts`, invoked by `POST /api/transform`.
- **Restructure pipeline** — `POST /api/transform` in `app/api/transform/` accepting `{url}` or `{rawText}` and returning `{cleanedOriginal, restructured}` or `{error:{code,message,hint}}`. Strict JSON contract `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}` via OpenRouter, one retry on malformed JSON, fallback model chain via `OPENROUTER_FALLBACK_MODELS`. Prompt, client, fallback, and stub in `lib/llm/` (`prompt.ts`, `openrouter.ts`, `fallback.ts`, `stub.ts`, `types.ts`); validation in `lib/restructure.ts`.
- **Modes registry & renderers** — `components/modes/registry.ts` + per-mode renderers in `components/modes/`: Focus (one card at a time), Dyslexia/Bionic (`lib/bionic.ts` pure function), Action checklist, Listen (browser `speechSynthesis` with karaoke word highlighting), ADHD micro-cards. Adding a mode = one registry line + one renderer.
- **Ask this page** — `POST /api/ask` grounded Q&A over the cleaned page text; answers for the demo trio are pre-cached so the demo never depends on the network.
- **Reading level toggle** — Simpler/Standard restructure variants (second prompt variant, same schema).
- **Cosmetic controls** — text size, line spacing, high-contrast/dark theme. Pure CSS, no AI.
- **Page history** — localStorage, no database, no auth.
- **Export** — print-friendly simplified page (print stylesheet).
- **Readability score** — original vs. transformed reading grade ("college level → grade 5") via `lib/readability.ts`.
- **Cached demo trio + fallback proof** — `fixtures/` (cleaned text + screenshots for IRS EITC, UT Dallas First-Year Apply, USCIS Students & Employment; backup `usa.gov/visas`) and raw-text paste path proven by `ssa.gov` 403 fallback (`fixtures/README.md`). Left-panel rule: default = cleaned original text; cached demo pages = pre-captured screenshot (`CONTEXT.md:105`).
- **Design tokens & deploy** — palette/type/spacing via CSS variables; Next.js 15 App Router + React 19 + TypeScript, deployed on Vercel (stateless, no DB, no auth).

## New Work During CSC Window (Sep 4 — Oct 4, 2026)

Work created specifically for CSC Back-to-School inside the official window — the delta of this branch:

- **School-specific framing** — repositioned ReadEasy as a back-to-school accessibility tool around the UT Dallas Apply admissions page; documented in `docs/CSC_IMPACT.md` (who is affected, why Action/Focus/Listen matter for students with ADHD/dyslexia, demo trio + `ssa.gov` 403 fallback as proof).
- **Submission docs for CSC review** — `HACKATHON_DISCLOSURE.md` (this file), `AI_DISCLOSURE.md` (detailed AI use, weighted for Learning), `docs/CSC_IMPACT.md`, `docs/CSC_SUBMISSION.md` checklist.
- **Public submission surface** — README banner after the title linking disclosure, impact, AI disclosure, live demo, and public branch link.
- **Verification** — `npm run typecheck` / `npm test` / `npm run build` kept green on this branch before submission.

No model weights, private datasets, or undisclosed third-party code are included beyond what is listed above.

## Confirmation — Opt-in Statements for CSC Innovation Award

By submitting this branch to CSC Back-to-School, the team opts in and confirms:

1. The project must be open source or publicly viewable after submission.
2. The team must provide a public project link, such as a GitHub repository, website, demo, design file, or public project page.
3. The team gives CSC permission to feature and promote the project on CSC's Instagram, website, club materials, or other CSC-related channels.
4. CSC may contact winning teams after the event to discuss opportunities to help share, promote, or expand the project's reach within schools, student groups, or other relevant communities. Any additional collaboration or promotion beyond CSC's own channels will be discussed with the team first.
5. Teams must disclose how they used AI tools, if applicable.
6. Teams must be able to explain what they built, how it works, and what role outside tools or AI played in the final project.

Additional confirmations: CSC may spotlight winning projects using the project name, team name, screenshots, demo links, and short descriptions. Personal photos, individual student names, or other identifying information will only be shared when appropriate permission is given. Opting in does not transfer ownership of the project to CSC — creators keep ownership of their work.

## Links

- Base repo: https://github.com/GhostInHex/readeasy
- This submission branch: https://github.com/GhostInHex/readeasy/tree/hackathon/csc
- Live demo (submission branch): https://readeasy-git-hackathon-csc-ghostinhex.vercel.app
- CSC Back-to-School Hackathon: https://csc-back-to-school.devpost.com — Deadline Oct 5, 2026 @12:00am PDT — Eligibility: ages 13–18 — Theme: school-life problem; apps/websites/tools.
