# 03: Cleaning pipeline + error contract

**What to build:** The transform route works for real Cleaning. `POST /api/transform` accepts `{url}` or `{rawText}`. URL path: fetch server-side, clean with Readability (ads/nav/scripts stripped). The route's full response contract is `{cleanedOriginal, restructured}` — for this ticket `restructured` comes from a canned stub so the contract is stable; the right panel renders the stub minimally. Blocked URLs return the structured error with a raw-text-paste hint. LLM client sits behind an injectable interface.

**Blocked by:** 01 (app shell).

**Files you touch:** the transform route, the LLM client interface + stub, Cleaning module, route tests, minimal right-panel render.

**Status:** ready-for-agent

- [ ] URL input yields `cleanedOriginal` (real Readability output) in the left panel
- [ ] `rawText` input skips fetching, same contract
- [ ] Blocked site → `{error:{code,message,hint}}`, never a 500
- [ ] Malformed/failed stub paths follow the error contract
- [ ] Seam-1 tests pass: IRS fixture cleans correctly; rawText path; error paths; injectable LLM interface proven
