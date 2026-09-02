#!/usr/bin/env node
// Wave-based parallel overnight runner: runs independent tickets as concurrent
// codex sessions, each in its own git worktree on its own branch, then merges
// in numeric order after each wave. The sequential runner (overnight-runner.mjs)
// still works for one-at-a-time runs.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const ticketsDir = args[0] ?? ".scratch/readeasy/issues";
const stateFile = args[1] ?? ".scratch/overnight-state.json";
const worktreeRoot = path.resolve(".worktrees");
const TICKET_TIMEOUT_MS = 45 * 60 * 1000;
// Waves: within a wave tickets run in parallel (disjoint files guaranteed by
// each ticket's "Files you touch" section); waves run strictly in order.
const WAVES = [["14"], ["15", "17", "18", "19"], ["16"]];

function git(args_, opts = {}) {
  const r = spawnSync("git", args_, { encoding: "utf8", ...opts });
  if (r.status !== 0) throw new Error(`git ${args_.join(" ")} failed: ${r.stderr || r.stdout}`);
  return r.stdout.trim();
}

function assertCleanTree(what) {
  const dirty = git(["status", "--porcelain", "--untracked-files=no"]);
  if (dirty) throw new Error(`Uncommitted tracked changes before ${what}:\n${dirty}`);
}

const statePath = path.resolve(stateFile);
let state = {};
if (existsSync(statePath)) {
  try { state = JSON.parse(readFileSync(statePath, "utf8")); }
  catch { console.error(`State file ${statePath} is not valid JSON — fix or delete it.`); process.exit(1); }
}

const allTickets = readdirSync(ticketsDir).filter((f) => /^\d{2,}-/.test(f)).sort();
function ticketFile(num) {
  const f = allTickets.find((f) => f.startsWith(`${num}-`));
  if (!f) throw new Error(`No ticket file for ${num} in ${ticketsDir}`);
  return f;
}
function ticketKey(num) { return path.join(ticketsDir, ticketFile(num)); }
function isHuman(num) { return /\(HUMAN\)/i.test(readFileSync(path.join(ticketsDir, ticketFile(num)), "utf8").split("\n")[0]); }

function runCodexTicket(num, cwd) {
  return new Promise((resolve) => {
    const slug = ticketFile(num).replace(/^\d+-/, "").replace(/\.md$/, "");
    const logPath = path.resolve(`.scratch/logs/ticket-${num}.log`);
    mkdirSync(path.dirname(logPath), { recursive: true });
    const logFd = openSync(logPath, "w");
    const child = spawn("codex", [
      "exec", "--cd", cwd, "--sandbox", "workspace-write",
      `Implement the ticket in .scratch/readeasy/issues/${ticketFile(num)}. Read CONTEXT.md, .scratch/readeasy/SPEC-v2.md, the ticket file, and the relevant code first. You are on branch ticket/${num}-${slug} inside a git worktree; commit ALL changes to this branch and do not create other branches or merge. Only touch files listed in the ticket's "Files you touch" section. Ensure npm test and npm run typecheck pass before committing.`,
    ], { cwd, stdio: ["ignore", logFd, logFd], timeout: TICKET_TIMEOUT_MS });
    console.log(`[ticket ${num}] codex started (log: ${logPath})`);
    child.on("error", (err) => resolve({ num, ok: false, why: `spawn error: ${err.message}` }));
    child.on("close", (code, signal) => resolve({
      num, ok: code === 0,
      why: code === 0 ? null : (signal ? `killed (${signal}), likely timeout` : `exit ${code}`),
    }));
  });
}

function mergeTicket(num) {
  const slug = ticketFile(num).replace(/^\d+-/, "").replace(/\.md$/, "");
  const branch = `ticket/${num}-${slug}`;
  const merge = spawnSync("git", ["merge", "--no-ff", branch, "-m", `merge ticket ${num}: ${slug}`], { encoding: "utf8" });
  if (merge.status !== 0) {
    spawnSync("git", ["merge", "--abort"]);
    throw new Error(`Merge of ${branch} conflicted — resolve manually. ${merge.stdout} ${merge.stderr}`);
  }
  const test = spawnSync("cmd", ["/c", "npm test 2>&1 && npm run typecheck 2>&1"], { encoding: "utf8" });
  if (test.status !== 0) throw new Error(`Tests/typecheck failed after merging ${branch}:\n${test.stdout}`);
  state[ticketKey(num)] = "done";
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`[ticket ${num}] merged, tests green, state saved.`);
}

if (!existsSync(".git")) { console.error("Not a git repository."); process.exit(1); }

for (const wave of WAVES) {
  const pending = wave.filter((n) => state[ticketKey(n)] !== "done" && !isHuman(n));
  if (pending.length === 0) { console.log(`Wave [${wave.join(", ")}]: nothing pending.`); continue; }
  console.log(`=== Wave [${pending.join(", ")}] starting (${pending.length} parallel) ===`);
  try { assertCleanTree(`wave [${pending.join(", ")}]`); }
  catch (e) { console.error(e.message); process.exit(1); }

  // One worktree per ticket, branched from current master.
  const cwdByTicket = {};
  for (const num of pending) {
    const slug = ticketFile(num).replace(/^\d+-/, "").replace(/\.md$/, "");
    const branch = `ticket/${num}-${slug}`;
    const wt = path.join(worktreeRoot, String(num));
    rmSync(wt, { recursive: true, force: true });
    const branchExists = git(["branch", "--list", branch]).length > 0;
    git(branchExists
      ? ["worktree", "add", wt, branch]
      : ["worktree", "add", wt, "-b", branch, "master"]);
    cwdByTicket[num] = wt;
  }

  const results = await Promise.all(pending.map((n) => runCodexTicket(n, cwdByTicket[n])));
  const failed = results.filter((r) => !r.ok);
  for (const r of failed) console.error(`[ticket ${r.num}] FAILED: ${r.why}`);
  if (failed.length > 0) console.error("Wave had failures — merging successful tickets, then stopping. Re-run to resume.");

  for (const num of pending) {
    const result = results.find((r) => r.num === num);
    if (result?.ok) {
      try { mergeTicket(num); }
      catch (e) { console.error(e.message); process.exit(1); }
    }
    spawnSync("git", ["worktree", "remove", cwdByTicket[num], "--force"]);
  }
  if (failed.length > 0) process.exit(1);
  git(["worktree", "prune"]);
}

console.log("All waves complete.");

