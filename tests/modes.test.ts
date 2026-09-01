/**
 * The Mode registry contract: a Mode is one renderer plus one registry line.
 * Structure only — Mode rendering itself is checked by the manual smoke pass.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_MODE_ID, MODES, findMode } from "@/components/modes/registry";

test("every advertised mode is registered exactly once, with a renderer", () => {
  const ids = MODES.map((mode) => mode.id);

  assert.deepEqual(ids, ["focus", "dyslexia", "action", "listen", "adhd"]);
  assert.equal(new Set(ids).size, ids.length, "mode ids must be unique");

  for (const mode of MODES) {
    assert.equal(typeof mode.Renderer, "function", `${mode.id} needs a renderer component`);
    assert.ok(mode.label.length > 0, `${mode.id} needs a label`);
    assert.ok(mode.description.length > 0, `${mode.id} needs a one-line description`);
  }
});

test("Focus is the default mode and unknown ids fall back to it", () => {
  assert.equal(DEFAULT_MODE_ID, "focus");
  assert.equal(findMode("focus").label, "Focus");
  assert.equal(findMode("nope").id, "focus");
});
