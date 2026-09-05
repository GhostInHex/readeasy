/**
 * Seam 2 — the fallback chain helper. Pure: attempt closures in, first success or the last
 * real failure out. No network, no key.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { TransformFailure } from "@/lib/errors";
import { attemptTimeoutMs, parseModelList, runWithFallbacks } from "@/lib/llm/fallback";

function failure(code: string): TransformFailure {
  return new TransformFailure({ code, message: `test:${code}` });
}

test("runWithFallbacks returns the first attempt that succeeds and runs no later attempts", async () => {
  const ran: string[] = [];

  const result = await runWithFallbacks([
    () => {
      ran.push("a");
      return Promise.resolve("first-ok");
    },
    () => {
      ran.push("b");
      return Promise.resolve("second-ok");
    }
  ]);

  assert.equal(result, "first-ok");
  assert.deepEqual(ran, ["a"]);
});

test("runWithFallbacks moves to the next attempt on a fallback-worthy failure", async () => {
  const ran: string[] = [];

  const result = await runWithFallbacks([
    () => {
      ran.push("primary");
      throw failure("restructure_rate_limited");
    },
    () => {
      ran.push("fallback");
      return Promise.resolve("recovered");
    }
  ]);

  assert.equal(result, "recovered");
  assert.deepEqual(ran, ["primary", "fallback"]);
});

test("runWithFallbacks keeps going through several fallback-worthy failures", async () => {
  const result = await runWithFallbacks([
    () => Promise.reject(failure("restructure_unreachable")),
    () => Promise.reject(failure("restructure_timeout")),
    () => Promise.resolve("third-works")
  ]);

  assert.equal(result, "third-works");
});

test("runWithFallbacks stops immediately on an unauthorized failure — no model can fix a bad key", async () => {
  const ran: string[] = [];

  await assert.rejects(
    runWithFallbacks([
      () => {
        ran.push("primary");
        throw failure("restructure_unauthorized");
      },
      () => {
        ran.push("fallback");
        return Promise.resolve("should-not-happen");
      }
    ]),
    (error: TransformFailure) => error.code === "restructure_unauthorized"
  );

  assert.deepEqual(ran, ["primary"]);
});

test("runWithFallbacks rethrows the last real failure after every attempt fails", async () => {
  const ran: string[] = [];

  await assert.rejects(
    runWithFallbacks([
      () => {
        ran.push("a");
        throw failure("restructure_rate_limited");
      },
      () => {
        ran.push("b");
        throw failure("restructure_empty");
      }
    ]),
    (error: TransformFailure) => error.code === "restructure_empty"
  );

  assert.deepEqual(ran, ["a", "b"]);
});

test("runWithFallbacks rethrows unexpected (non-contract) errors instead of hiding them", async () => {
  const boom = new Error("bug");

  await assert.rejects(
    runWithFallbacks([
      () => Promise.reject(boom),
      () => Promise.resolve("never")
    ]),
    (error: Error) => error === boom
  );
});

test("parseModelList trims entries and drops empties", () => {
  assert.deepEqual(parseModelList(" a , b,,  c "), ["a", "b", "c"]);
  assert.deepEqual(parseModelList(undefined), []);
  assert.deepEqual(parseModelList("  "), []);
});

test("attemptTimeoutMs keeps the total budget across attempts, with a usable floor", () => {
  assert.equal(attemptTimeoutMs(55_000, 1), 55_000);
  assert.equal(attemptTimeoutMs(55_000, 2), 27_500);
  assert.equal(attemptTimeoutMs(55_000, 3), 18_333);
  assert.equal(attemptTimeoutMs(30_000, 5), 10_000); // floor, not 6_000
});
