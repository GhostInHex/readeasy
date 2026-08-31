# AGENTS.md — ReadEasy build repo

Read these first, in order, before doing anything:

1. `CONTEXT.md` — project vocabulary, decisions, and current state of the build.
2. `.scratch/readeasy/SPEC.md` — the product spec.
3. `.scratch/readeasy/issues/README.md` — ticket tracker rules (branching, merge order, ownership).
4. The specific ticket file you're working on, under `.scratch/readeasy/issues/`.

## Working rules

- One ticket per session. Never work beyond your ticket's scope.
- Follow the tracker rules in `.scratch/readeasy/issues/README.md` exactly: branch `ticket/<NN>-<slug>`, only touch files listed in the ticket's "Files you touch" section.
- Tech stack: Next.js (App Router) + React + TypeScript, LLM via OpenRouter (key in env), deployed on Vercel. No database, no auth.
- Leave the working tree clean: tests green, all changes committed with a concise conventional commit message.

## Tooling

- `node tools/overnight-runner.mjs` runs all ready tickets sequentially, one fresh session each, resuming from `.scratch/overnight-state.json`. Humans run it; agents don't invoke it.
- Ticket 13 is human work — do not pick it up.
