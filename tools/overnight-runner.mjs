#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const ticketsDir = args[0] ?? ".scratch/readeasy/issues";
const stateFile = args[1] ?? ".scratch/overnight-state.json";

if (!existsSync(".git")) {
  console.error("Not a git repository.");
  process.exit(1);
}

const statePath = path.resolve(stateFile);
let state = {};
if (existsSync(statePath)) {
  try {
    state = JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    console.error(`State file ${statePath} is not valid JSON — fix or delete it, then re-run.`);
    process.exit(1);
  }
}

// Only numbered ticket files count. README.md and anything else in the dir is
// tracker documentation, not work for Codex.
const ticketFiles = readdirSync(ticketsDir)
  .filter((file) => /^\d{2}-/.test(file))
  .sort();

function assertCleanTree(ticket) {
  const dirty = execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], {
    encoding: "utf8",
  }).trim();
  if (dirty) {
    console.error(
      `Working tree has uncommitted changes — refusing to start ${ticket}:\n${dirty}\n` +
        `Resolve or commit these first (a previous ticket likely failed mid-work).`,
    );
    process.exit(1);
  }
}

const pending = ticketFiles.filter((file) => {
  const key = path.join(ticketsDir, file);
  return state[key] !== "done";
});
console.log(`${ticketFiles.length} tickets, ${pending.length} pending, ${ticketFiles.length - pending.length} already done.`);

const TICKET_TIMEOUT_MS = 45 * 60 * 1000; // one hung session must not stall the night
for (const file of ticketFiles) {
  const relativePath = path.join(ticketsDir, file);
  if (state[relativePath] === "done") continue;

  const ticketText = readFileSync(relativePath, "utf8");
  const title = ticketText.split("\n")[0].replace(/^#\s*/, "");
  if (/\(HUMAN\)/i.test(title)) {
    console.log(`\n=== ${relativePath} — SKIPPED (human work: ${title}) ===`);
    continue;
  }
  assertCleanTree(relativePath);

  console.log(`\n=== ${relativePath} — ${title} ===`);

  const result = spawnSync(
    "codex",
    [
      "exec",
      "--cd",
      process.cwd(),
      "--sandbox",
      "workspace-write",
      `Implement the ticket in ${relativePath}. Read CONTEXT.md, the ticket file, and the relevant code first. Implement only this ticket. Do not modify unrelated files. Ensure all tests pass and leave the working tree clean. Commit all changes with a concise conventional commit message.`,
    ],
    { stdio: "inherit", timeout: TICKET_TIMEOUT_MS },
  );

  if (result.error) {
    console.error(`Codex could not be launched for ${relativePath}: ${result.error.code ?? ""} ${result.error.message}`);
    process.exit(1);
  }
  if (result.signal) {
    console.error(`Codex was killed (${result.signal}) for ${relativePath} — likely timed out after ${TICKET_TIMEOUT_MS / 60000} min.`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`Codex failed for ${relativePath} (exit ${result.status}). State not updated; re-run to retry this ticket.`);
    process.exit(result.status ?? 1);
  }

  state[relativePath] = "done";
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`Marked ${relativePath} done.`);
}

console.log("All ready tickets completed.");
