/**
 * Seam 2: the Bionic Reading rule is a pure function, so it is tested directly.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { toBionicSegments } from "@/lib/bionic";

/** Render segments the way the Dyslexia renderer does, with the bold half marked. */
function render(text: string): string {
  return toBionicSegments(text)
    .map((segment) => (segment.lead ? `[${segment.lead}]${segment.rest}` : segment.rest))
    .join("");
}

test("the leading half of each word is bolded", () => {
  assert.equal(render("reading is easier"), "[read]ing [i]s [eas]ier");
});

test("short words get a single bold letter", () => {
  assert.equal(render("a to the form"), "[a] [t]o [t]he [fo]rm");
});

test("segments always rebuild the original text exactly", () => {
  const text = "You must file by June 30. Bring two forms of ID — no cash!\n\nQuestions? Call us.";
  const rebuilt = toBionicSegments(text)
    .map((segment) => segment.lead + segment.rest)
    .join("");

  assert.equal(rebuilt, text);
});

test("punctuation is not counted as part of the word", () => {
  assert.equal(render("(quarterly) payments,"), "[(quart]erly) [paym]ents,");
  assert.equal(render('"stop."'), '["st]op."');
});

test("a single word, an empty string, and whitespace-only input are all safe", () => {
  assert.equal(render("credit"), "[cre]dit");
  assert.deepEqual(toBionicSegments(""), []);
  assert.deepEqual(toBionicSegments("   "), [{ lead: "", rest: "   " }]);
});

test("URLs, emails, and file paths are left whole", () => {
  assert.equal(render("see https://www.irs.gov/eitc today"), "[s]ee https://www.irs.gov/eitc [tod]ay");
  assert.equal(render("mail help@example.com now"), "[ma]il help@example.com [n]ow");
  assert.equal(render("open /etc/hosts"), "[op]en /etc/hosts");
  assert.equal(render("visit www.usa.gov"), "[vis]it www.usa.gov");
});

test("numbers and symbols are never bolded", () => {
  assert.equal(render("pay $60 by 06/30/2026"), "[p]ay $60 [b]y 06/30/2026");
});

test("hyphenated and apostrophised words stay one word", () => {
  assert.equal(render("self-employed"), "[self-em]ployed");
  assert.equal(render("don't"), "[don]'t");
});
