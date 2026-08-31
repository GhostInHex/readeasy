# ReadEasy fixtures — the cached Demo trio

Bundled offline copies of the demo pages, captured **2026-09-01**. They exist so the demo video and the
judge-facing walkthrough never depend on a live fetch succeeding.

Each page has its own directory:

```
fixtures/<slug>/page.html     raw HTML exactly as fetched
fixtures/<slug>/cleaned.txt   Cleaning output (Readability, no AI) — the left panel's text
fixtures/<slug>/meta.json     url, label, capture timestamp, word count, screenshot path
public/fixtures/<slug>.png    full-page screenshot of the messy original page
fixtures/index.json           url → fixture lookup table (used by the left-panel matcher, ticket 10)
```

Screenshots live under `public/` because Next.js serves that directory directly, so the left panel can show
`/fixtures/<slug>.png` with no route or loader involved.

## What is cached

| Slug | Role | Page | Cleaned words |
|---|---|---|---|
| `irs-eitc` | trio | IRS — Who Qualifies for the Earned Income Tax Credit (EITC) | 1,005 |
| `utdallas-first-year-apply` | trio | UT Dallas — Apply as a first-year student | 941 |
| `uscis-students-employment` | trio | USCIS — Students and Employment | 560 |
| `usagov-visas` | backup | USA.gov — Immigrant visas | 26 |
| `irs-pub596` | backup | IRS Publication 596, Earned Income Credit | 35,965 |

## Capture

```bash
node fixtures/capture.mjs                 # all pages
node fixtures/capture.mjs irs-eitc        # one page
node fixtures/capture.mjs --index-only    # rewrite index.json only
```

The script fetches with a desktop browser user-agent, cleans with the same Readability step the app uses, and
screenshots with the locally installed Chrome or Edge via `puppeteer-core` (override with `CHROME_PATH`).
It is human-run tooling; the app never calls it at runtime.

## Notes and deviations from the ticket

- **Word counts are lower than the ticket's ">2000 words" bar for the three trio pages.** These government
  pages simply do not contain that much prose — Readability extracts 560–1,005 words from each. The counts
  above are the honest ceiling for the pages named in `CONTEXT.md`. `irs-pub596` (35,965 words) is captured as
  the long-form backup so there is one genuinely dense legalese fixture for the "wall of text" demo shot.
- **Two trio URLs changed since the spec was written.** `irs.gov/.../earned-income-tax-credit-eitc` is a link
  hub that cleans to 296 words, so the fixture uses the substantive "Who Qualifies" page instead.
  `utdallas.edu/admissions/freshman/apply/` now 404s; the live first-year apply page is
  `enroll.utdallas.edu/freshman/apply/`.
- **`usa.gov/visas` cleans to 26 words** because that page is a client-rendered link hub. It is captured as
  specified, but it is not usable as a demo page — treat `irs-pub596` as the practical backup.
- **ssa.gov is the blocked/403 example and is deliberately NOT fixtured.** `https://www.ssa.gov/myaccount/`
  returns **HTTP 403** to requests without a normal browser user-agent (verified 2026-09-01), while
  `enroll.utdallas.edu` does the same. With a desktop user-agent ssa.gov currently answers 200 from a
  residential IP, so the reliable live demonstration of the raw-text fallback is a datacenter fetch (Vercel)
  or any site that rejects the request — the error contract in ticket 03 is what the video shows.
