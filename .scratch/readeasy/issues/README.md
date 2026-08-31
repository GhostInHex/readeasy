# ReadEasy — Build Day ticket tracker

**How to run a ticket (follow exactly — no manual coordination needed):**

1. **Pick a frontier ticket**: any ticket whose "Blocked by" list is fully complete. Never start a ticket with incomplete blockers.
2. **Fresh session per ticket.** Read only: this repo's `CONTEXT.md`, `.scratch/readeasy/SPEC.md`, and the ticket file. Everything you need is in those three files.
3. **Branch**: `ticket/<NN>-<slug>`. One ticket per branch. Never work on another ticket's branch.
4. **You own the files listed in the ticket's "Files you touch" section.** If you believe you need to touch a file outside that list, stop and note it in the ticket file instead.
5. **Merge in numeric ticket order** (01 before 02 before 03…). Before merging: all tests green + app runs locally.
6. **Stretch tickets** (marked STRETCH) may only start after every non-stretch ticket is complete.
7. Ticket 13 is human work (recording, submission form). Agents don't pick it up.

**Environment facts (all tickets):** Next.js + App Router, React, TypeScript. LLM via OpenRouter (key in env var). Deployed on Vercel. No database, no auth. Vocabulary (`Transform`, `Cleaning`, `Restructure`, `Mode`, `Demo trio`, `Cached page`) is defined in `CONTEXT.md`.
