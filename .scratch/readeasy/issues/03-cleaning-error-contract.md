# 03: Cleaning pipeline + error contract

**What to build:** The transform route works for real Cleaning. `POST /api/transform` accepts `{url}` or `{rawText}`. URL path: fetch server-side, clean with Readability (ads/nav/scripts stripped). The route's full response contract is `{cleanedOriginal, restructured}` — for this ticket `restructured` comes from a canned stub so the contract is stable; the right panel renders the stub minimally. Blocked URLs return the structured error with a raw-text-paste hint. LLM client sits behind an injectable interface.

**Blocked by:** 01 (app shell).

**Files you touch:** the transform route, the LLM client interface + stub, Cleaning module, route tests, minimal right-panel render.

**Status:** done

- [x] URL input yields `cleanedOriginal` (real Readability output) in the left panel
- [x] `rawText` input skips fetching, same contract
- [x] Blocked site → `{error:{code,message,hint}}`, never a 500 (403/401/429 → `blocked_by_site`, 422)
- [x] Malformed/failed stub paths follow the error contract (`invalid_restructure`)
- [x] Seam-1 tests pass: IRS fixture cleans correctly; rawText path; error paths; injectable LLM interface proven

**How it is put together**

- `lib/fetch-page.ts` — fetch with a desktop user-agent, 15s timeout, content-type check, and an SSRF guard
  that refuses non-http(s) URLs and private/loopback hosts.
- `lib/clean.ts` — Cleaning: Readability over jsdom, text only, no AI. Raw text takes the normalize-only path.
- `lib/llm/types.ts` — the `LlmClient` boundary (`complete(input) => raw model text`).
- `lib/llm/stub.ts` — the canned stub: reflows cleaned text into the schema, zero network.
- `lib/schema.ts` — strict validation of the restructure schema + tolerant JSON extraction.
- `lib/transform.ts` — the pipeline; `lib/deps.ts` resolves real deps and exposes the test seam.
- `lib/errors.ts` — `TransformFailure` → `{error:{code,message,hint}}`, always with the raw-text hint.

Live smoke (local `next start`): the USCIS trio URL fetched, cleaned to 3,754 characters, and returned a
schema-valid stub restructure; `f1040.pdf` returned `unsupported_content` instead of crashing.
