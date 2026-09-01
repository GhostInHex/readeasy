# 11: ADHD mode (STRETCH)

**What to build:** A second Restructure variant targeting attention: one idea per micro-card, key words bolded, max two sentences per card, progress carried by the Focus-style step indicator. Implemented as a new restructure prompt variant selected by the ADHD mode; the mode framework contract doesn't change.

**Blocked by:** 05 (framework) — **but per the tracker rules, STRETCH tickets only start after every non-stretch ticket is complete.**

**Files you touch:** the ADHD renderer file + its registry line, the ADHD prompt variant + schema validation for it, seam tests for the new prompt path.

**Status:** done

- [x] ADHD mode returns its own restructured variant for the trio fixtures
- [x] Micro-cards: one idea, ≤2 sentences, bolded key words
- [x] Progress indicator works across micro-cards
- [x] No regression in other modes
- [x] All tests green

## Notes

- The flow: opening ADHD mode POSTs the same request back to `/api/transform` with
  `variant: "adhd"`. Same route, same JSON contract, same header — the Mode framework contract does
  not change, and no other Mode notices. `source` was already threaded into `ModeProps` by ticket 05
  for exactly this.
- `lib/llm/prompt.ts` gains the real micro-card variant: 6–14 cards in page order, one idea each, at
  most two short sentences, a 2–5 word heading, and the two or three words that matter wrapped in
  `**double asterisks**`. Markers, not HTML, so nothing the model returns is ever treated as markup.
- `lib/microcards.ts` is the pure part and the enforcement: `splitSentences`, `splitEmphasis` and
  `toMicroCards`. Validation applies `toMicroCards` for the `adhd` variant, so the two-sentence rule
  holds even when the model returns longer cards — an over-long card becomes *more* cards, never a
  truncated one. Nothing is dropped, reordered or invented, and `tests/adhd.test.ts` asserts that
  sentence-for-sentence.
- Sentence splitting had to survive real government prose: it splits on the space after a
  terminator, treats a terminator glued straight to a capital as a break (Cleaning produces
  "…completed their studies.For both F-1…"), and rejoins abbreviations, so `U.S. Department of
  State` and `9 FAM 402.5-5(E)(1)` stay in one piece.
- `components/modes/AdhdMode.tsx` renders one card at a time with Focus mode's own step indicator,
  progress bar and Back/Next — reused classes, no new CSS. Requests are shared in a module-level map
  keyed by the source, so switching Modes back and forth never re-runs the model. If the second
  transform fails, the Mode re-chunks the restructured version it already has in the browser and
  says so; it can never be a dead end.
- Verified in a real browser against `next start` with the stub engine, on the live USCIS trio URL:
  10 micro-cards, every one at most two sentences by `splitSentences`, 7 of 10 with bolded key words
  (`font-weight: 700`, real `<strong>`, no asterisks on screen), "Card n of 10" with the progress
  bar at 10% → 100%, Back disabled on the first card and Next on the last, stepping back working.
  Exactly two `/api/transform` calls for the whole session (one default, one adhd) across four Mode
  switches. Focus, Dyslexia, Action and Listen rendered exactly as before with no `**` anywhere. With
  the second transform forced to 502, the Mode fell back to 5 local cards plus the explanatory line,
  and no page errors were raised in either run. 50 tests green, typecheck and build clean.

## Deviations, noted per tracker rule 4

- `lib/microcards.ts` is a new file. The ticket's list assumed the shaping rules would live in the
  prompt and the schema, but they are pure functions used by three callers (validation, the renderer,
  the stub), and putting them in `lib/schema.ts` would have hidden them from Seam-2 tests.
- `lib/restructure.ts`: one argument, twice — `validateRestructured(..., request.variant)` on the
  first attempt and the retry. The variant has to reach validation somehow, and restructure is the
  only caller.
- `lib/llm/stub.ts` is now variant-aware, building small marked-up cards for `adhd`. Without it the
  offline demo (and every test without an API key) would show the ADHD Mode identical to Focus, so
  the first acceptance criterion could not be demonstrated at all. Its key-word marking is a
  regex over numbers, dates and obligation words — a stand-in for judgement, not judgement.
- `components/modes/registry.ts`: description only, now "Micro-cards: one idea per screen, key words
  bolded." No new registry entry was needed — ticket 05 had already reserved the line.
- Not verified: how a real model words the cards. That needs `OPENROUTER_API_KEY`, which is the same
  human-gated check ticket 04 left open. The shape is enforced regardless of what the model returns.

