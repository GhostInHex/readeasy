# 12: Readability score (STRETCH)

**What to build:** A pure-function readability calculator (standard formula, e.g., Flesch-Kincaid — no AI). Shows a badge on the transformed view: "Original: college level → ReadEasy: grade 5". Computed from `cleanedOriginal` vs the flattened simplified text.

**Blocked by:** 04 — **but per the tracker rules, STRETCH tickets only start after every non-stretch ticket is complete.**

**Files you touch:** the readability pure function + its Seam-2 test, badge UI on the right panel.

**Status:** done

- [x] Function unit-tested at Seam 2 (known texts → known grades)
- [x] Badge renders original vs transformed grade for the trio fixtures
- [x] Handles very short/empty text gracefully
- [x] All tests green

## Notes

`lib/readability.ts` is plain arithmetic — Flesch–Kincaid grade level,
`0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59` — with no model call and no
randomness, so the same text always scores the same. Sentences are counted with the same
`splitSentences` the ADHD variant uses (ticket 11), so the two features cannot disagree about where
a sentence ends. Syllables use the usual vowel-group heuristic; because that is approximate by
nature, the badge reports a band ("grade 5", "college level", "graduate level") rather than
decimals, and `gradeLabel` never claims below grade 1.

`flattenRestructured` scores the transformed side as a reader actually meets it: the summary, then
each section's prose and takeaway. The title and headings are excluded — they are fragments, and
counting them as sentences would flatter the score by shortening the average sentence. `**key
word**` markers are stripped so they are not counted as characters.

Short text returns `null`, not a number: below `MIN_SCORABLE_WORDS` (20) a grade says more about the
sample than about the writing. The badge renders nothing when either side is unscorable.

Measured in a real browser (system Chrome via `puppeteer-core`, `next start -p 3111`,
`READEASY_LLM_MODE=stub`), transforming the IRS EITC trio fixture:

- badge text `Original: college level → ReadEasy: grade 12`, `data-easier="yes"`, accent styling
  (`rgb(29,78,216)` on `rgb(238,242,255)`, fully rounded), sitting above the reading toolbar
- the screen-reader line reads as a sentence: "Reading level: the original page needs college level,
  the ReadEasy version needs grade 12."
- pasting `Apply now. Bring your passport.` renders no badge at all
- zero page errors

That "grade 12" is honest about the **stub** engine, which reuses the page's own sentences and so
barely simplifies. It is the measurement working, not a claim about the shipped model — a real
Restructure call should land far lower, and this is the number to re-check once
`OPENROUTER_API_KEY` is available (see ticket 11's note).

57 tests pass (`node --import tsx --test tests/*.test.ts`); typecheck and `npm run build` are clean.

## Deviations (rule 4)

- **`components/ReadabilityBadge.tsx` is a new file.** The ticket says "badge UI on the right
  panel"; the badge is its own small component that `components/RightPanel.tsx` renders, because
  `RightPanel` is the only place that holds both sides of the comparison — `ReadingView` receives
  only `restructured`.
- **`app/globals.css`** gained `.readability-badge`, its `[data-easier="yes"]` accent variant, and
  `.readability-arrow`. The badge deliberately sits outside `.reading`, so the cosmetic toggles from
  ticket 09 (text size, spacing, theme) do not restyle it — it is panel chrome, like the `<h2>`
  above it.
- **`lib/readability.ts` imports `splitSentences` from `lib/microcards.ts`** rather than carrying a
  second sentence splitter.
- **Two test expectations were mine to correct, not the code's:** the plain sample is 32 words, not
  the 33 I hand-counted, and the legalese sample — one 60-word sentence — scores past college, so
  its label is "graduate level". Both are the formula being right.
