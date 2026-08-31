# 04: LLM Restructure — the product exists

**What to build:** Replace the stub with a real OpenRouter call. The prompt enforces the strict schema: `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}], sections[{heading, simplifiedText, keyTakeaway}]}`. Validate the JSON; on malformed output retry exactly once, then the error contract. The right panel now renders the real restructured JSON: title, summary, reading time, simplified sections with key takeaways. Prompt constraints: reshapes only provided text, invents no facts, person-first neutral tone.

**Blocked by:** 03 (cleaning + contract).

**Files you touch:** the LLM client implementation + prompt + schema validation, restructure tests, right-panel renderer.

**Status:** done in code; the two live checks need the builder's OpenRouter key

- [ ] Live transform of all three Demo trio URLs returns schema-valid JSON — **blocked on a credential.**
      `npm run verify:trio` does exactly this check (fetch → clean → restructure → schema assert → flag any
      number in the output that is absent from the source). With no `OPENROUTER_API_KEY` present it runs the
      stub engine: 3/3 trio URLs verified that way. Set the key and re-run for the live confirmation.
- [x] Right panel renders title, summary, reading time, simplified sections, key takeaways (plus a
      "What you need to do" list with urgency badges; ticket 07 makes it interactive)
- [x] Malformed-JSON → exactly one retry → error contract (tested with stubbed LLM, asserting the call count
      is exactly 2, and that credential/service failures are not retried at all)
- [ ] Output contains no facts absent from the source page (spot-check on trio) — **needs the live run.** The
      prompt forbids outside knowledge and `verify:trio` reports any number or date in the output that is not
      in the cleaned original; on the stub run, all numbers were traceable.
- [x] OpenRouter key read from env (`OPENROUTER_API_KEY`, model via `OPENROUTER_MODEL`, default
      `openai/gpt-4o-mini`); falls back to the stub when unset so the app never hard-fails
- [ ] Deployed app transforms a live URL — depends on the ticket-01 Vercel deploy, also human-gated

**How it is put together**

- `lib/llm/prompt.ts` — system + user prompts, the schema text, and the retry nudge. Constraints: only facts
  from the provided text, grade-5 plain language, person-first neutral tone, JSON only.
- `lib/llm/openrouter.ts` — the OpenRouter chat-completions client with `response_format: json_object`, a 55s
  timeout, and typed failures for 401/403, 429, other HTTP errors, and empty answers.
- `lib/restructure.ts` — call → parse → validate; on `invalid_restructure` it retries **once**, passing the
  bad answer back to the model, then gives up to the error contract.
- `lib/deps.ts` — OpenRouter when a key exists, stub otherwise (or when `READEASY_LLM_MODE=stub`).

**Deviation, noted per tracker rule 4:** added `tools/verify-trio.ts` + the `verify:trio` npm script, since the
first checkbox is a live check that needs a runner. No app behavior lives in it.
