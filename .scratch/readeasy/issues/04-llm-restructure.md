# 04: LLM Restructure — the product exists

**What to build:** Replace the stub with a real OpenRouter call. The prompt enforces the strict schema: `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}`. Validate the JSON; on malformed output retry exactly once, then the error contract. The right panel now renders the real restructured JSON: title, summary, reading time, simplified sections with key takeaways. Prompt constraints: reshapes only provided text, invents no facts, person-first neutral tone.

**Blocked by:** 03 (cleaning + contract).

**Files you touch:** the LLM client implementation + prompt + schema validation, restructure tests, right-panel renderer.

**Status:** ready-for-agent

- [ ] Live transform of all three Demo trio URLs returns schema-valid JSON
- [ ] Right panel renders title, summary, reading time, simplified sections, key takeaways
- [ ] Malformed-JSON → exactly one retry → error contract (tested with stubbed LLM)
- [ ] Output contains no facts absent from the source page (spot-check on trio)
- [ ] OpenRouter key read from env; deployed app transforms a live URL
