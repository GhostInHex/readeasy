/**
 * Restructure validation and prompt constraints.
 * `validateRestructured` is the gate every Mode renderer depends on, so it is tested directly.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { RESTRUCTURE_SCHEMA_TEXT, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/llm/prompt";
import { MAX_RESTRUCTURE_CHARS, truncateForModel } from "@/lib/restructure";
import { parseRestructureJson, validateRestructured } from "@/lib/schema";

const VALID = {
  title: "Who qualifies for the EITC",
  summary: "This page explains who can claim the credit. It lists the rules you must meet.",
  readingTimeMinutes: 4,
  actionItems: [{ task: "File a tax return", urgency: "high", deadline: "April 15, 2026" }],
  sections: [{ heading: "Basic rules", simplifiedText: "You need earned income.", keyTakeaway: "You must have earned income." }]
};

test("a schema-valid payload passes through unchanged", () => {
  const result = validateRestructured(VALID);

  assert.equal(result.title, VALID.title);
  assert.equal(result.readingTimeMinutes, 4);
  assert.equal(result.actionItems[0].deadline, "April 15, 2026");
  assert.equal(result.sections[0].keyTakeaway, "You must have earned income.");
});

test("missing required fields are rejected", () => {
  for (const broken of [
    { ...VALID, title: "" },
    { ...VALID, summary: undefined },
    { ...VALID, sections: [] },
    { ...VALID, sections: "nope" },
    { ...VALID, sections: [{ heading: "No text" }] },
    { ...VALID, actionItems: "nope" },
    "a string",
    null
  ]) {
    assert.throws(() => validateRestructured(broken), /unexpected shape/i, `should reject ${JSON.stringify(broken)}`);
  }
});

test("unknown urgency values fall back to medium, and blank deadlines are dropped", () => {
  const result = validateRestructured({
    ...VALID,
    actionItems: [
      { task: "Read the instructions", urgency: "URGENT!!", deadline: "" },
      { task: "", urgency: "high" }
    ]
  });

  assert.equal(result.actionItems.length, 1, "empty tasks are dropped");
  assert.equal(result.actionItems[0].urgency, "medium");
  assert.equal(result.actionItems[0].deadline, undefined);
});

test("a nonsense readingTimeMinutes becomes a usable number", () => {
  assert.equal(validateRestructured({ ...VALID, readingTimeMinutes: "lots" }).readingTimeMinutes, 1);
  assert.equal(validateRestructured({ ...VALID, readingTimeMinutes: -3 }).readingTimeMinutes, 1);
  assert.equal(validateRestructured({ ...VALID, readingTimeMinutes: 7.6 }).readingTimeMinutes, 8);
});

test("JSON wrapped in markdown fences or prose is still parsed", () => {
  const body = JSON.stringify(VALID);

  assert.deepEqual(parseRestructureJson("```json\n" + body + "\n```"), VALID);
  assert.deepEqual(parseRestructureJson(`Here you go:\n${body}\nHope that helps!`), VALID);
  assert.throws(() => parseRestructureJson("no json here"), /unexpected shape/i);
});

test("the prompt states the schema and the no-invented-facts constraint", () => {
  const prompt = buildUserPrompt({ text: "Bring your ID to the appointment.", title: "Appointments", variant: "default" });

  assert.match(prompt, /"actionItems"/);
  assert.match(prompt, /"keyTakeaway"/);
  assert.ok(prompt.includes(RESTRUCTURE_SCHEMA_TEXT));
  assert.match(prompt, /ONLY facts/);
  assert.match(prompt, /never add outside knowledge/i);
  assert.match(prompt, /person-first/i);
  assert.match(prompt, /grade 5/i);
  assert.match(prompt, /Bring your ID to the appointment\./);
  assert.match(SYSTEM_PROMPT, /rewriter, not an author/i);
});

test("over-long pages are truncated before they reach the model", () => {
  const long = "word ".repeat(20_000);

  assert.ok(long.length > MAX_RESTRUCTURE_CHARS);
  assert.equal(truncateForModel(long).length, MAX_RESTRUCTURE_CHARS + 1);
  assert.equal(truncateForModel("short page"), "short page");
});
