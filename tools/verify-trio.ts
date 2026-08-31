/**
 * Live verification for ticket 04: transform the Demo trio through the real OpenRouter
 * client and check every answer against the schema.
 *
 *   OPENROUTER_API_KEY=... npm run verify:trio
 *   npm run verify:trio -- irs-eitc          # one fixture by slug
 *
 * Also runs a cheap hallucination check: every number and date in the restructured output
 * must also appear in the cleaned original, since the model is only allowed to reshape.
 */
import { readFileSync } from "node:fs";
import { resolveTransformDeps } from "@/lib/deps";
import { defaultLlmClient } from "@/lib/deps";
import { runTransform } from "@/lib/transform";
import type { Restructured } from "@/lib/types";

interface FixtureEntry {
  slug: string;
  label: string;
  url: string;
  role: string;
}

const NUMBER_PATTERN = /\b\d[\d,.$%/-]*\b/g;

function flatten(restructured: Restructured): string {
  return [
    restructured.title,
    restructured.summary,
    ...restructured.actionItems.flatMap((item) => [item.task, item.deadline ?? ""]),
    ...restructured.sections.flatMap((section) => [section.heading, section.simplifiedText, section.keyTakeaway])
  ].join("\n");
}

/** Numbers in the output that are absent from the source: candidate invented facts. */
function unsupportedNumbers(restructured: Restructured, source: string): string[] {
  const sourceNumbers = new Set((source.match(NUMBER_PATTERN) ?? []).map((value) => value.replace(/[,$%]/g, "")));
  const outputNumbers = new Set((flatten(restructured).match(NUMBER_PATTERN) ?? []).map((value) => value.replace(/[,$%]/g, "")));
  return [...outputNumbers].filter((value) => !sourceNumbers.has(value) && value.length > 1);
}

function assertSchema(restructured: Restructured): void {
  if (!restructured.title) throw new Error("missing title");
  if (!restructured.summary) throw new Error("missing summary");
  if (!(restructured.readingTimeMinutes >= 1)) throw new Error("missing readingTimeMinutes");
  if (!restructured.sections.length) throw new Error("no sections");
  for (const section of restructured.sections) {
    if (!section.simplifiedText) throw new Error(`section "${section.heading}" has no simplifiedText`);
  }
}

async function main(): Promise<void> {
  const client = defaultLlmClient();
  console.log(`restructure engine: ${client.name}`);
  if (client.name === "stub") {
    console.log("\nNo OPENROUTER_API_KEY found, so this run only exercises the stub.");
    console.log("Set OPENROUTER_API_KEY (or .env.local) and re-run to verify the live path.\n");
  }

  const only = process.argv.slice(2);
  const fixtures = (JSON.parse(readFileSync("fixtures/index.json", "utf8")) as FixtureEntry[]).filter(
    (entry) => (only.length ? only.includes(entry.slug) : entry.role === "trio")
  );

  let failures = 0;

  for (const fixture of fixtures) {
    console.log(`\n== ${fixture.slug} — ${fixture.url}`);
    try {
      const started = Date.now();
      const result = await runTransform({ url: fixture.url }, resolveTransformDeps());
      assertSchema(result.restructured);

      const invented = unsupportedNumbers(result.restructured, result.cleanedOriginal);
      console.log(`   ok in ${((Date.now() - started) / 1000).toFixed(1)}s`);
      console.log(`   title       ${result.restructured.title}`);
      console.log(`   summary     ${result.restructured.summary}`);
      console.log(`   reading     ${result.restructured.readingTimeMinutes} min · ${result.restructured.sections.length} sections`);
      for (const item of result.restructured.actionItems) {
        console.log(`   action      [${item.urgency}] ${item.task}${item.deadline ? ` — ${item.deadline}` : ""}`);
      }
      if (invented.length) {
        console.log(`   ⚠ numbers not present in the source: ${invented.join(", ")}`);
      } else {
        console.log("   numbers all traceable to the source text");
      }
    } catch (error) {
      failures += 1;
      console.log(`   FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`\n${fixtures.length - failures}/${fixtures.length} pages verified`);
  if (failures) process.exitCode = 1;
}

void main();
