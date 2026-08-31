import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "@/app/api/transform/route";
import type { TransformResponse } from "@/lib/types";

async function postTransform(body: unknown): Promise<{ status: number; payload: TransformResponse }> {
  const response = await POST(
    new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
  );
  return { status: response.status, payload: (await response.json()) as TransformResponse };
}

test("transform route returns the {cleanedOriginal, restructured} contract for rawText", async () => {
  const { status, payload } = await postTransform({ rawText: "File your return by April 15." });

  assert.equal(status, 200);
  assert.ok(!("error" in payload));
  assert.equal(payload.cleanedOriginal, "File your return by April 15.");
  assert.equal(typeof payload.restructured.title, "string");
  assert.ok(Array.isArray(payload.restructured.sections));
  assert.ok(Array.isArray(payload.restructured.actionItems));
});

test("transform route rejects empty input with the structured error and a raw-text hint", async () => {
  const { status, payload } = await postTransform({});

  assert.equal(status, 400);
  assert.ok("error" in payload);
  assert.equal(payload.error.code, "empty_input");
  assert.match(payload.error.hint, /raw text/i);
});
