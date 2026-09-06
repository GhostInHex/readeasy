/**
 * ReadEasy demo capture — drives the real app in Edge and records live clips.
 *
 * Records via the CDP screencast (PNG frames with real timestamps), so the output keeps native
 * device-pixel resolution (deviceScaleFactor 2 => 3840x2160 frames) and real interaction timing.
 *
 * Usage:  node capture.mjs            (expects the dev server on http://localhost:3001)
 * Output: ../clips/<name>/frame_NNNN.png + ffmpeg-concat.txt (one directory per clip)
 */
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, "..", "clips");
const APP_URL = process.env.APP_URL ?? "http://localhost:3001";
const IRS_URL =
  "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/who-qualifies-for-the-earned-income-tax-credit-eitc";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A visible, artificial cursor so clicks read as human in the footage. */
const CURSOR_SCRIPT = `
(() => {
  if (document.getElementById("demo-cursor")) return;
  const dot = document.createElement("div");
  dot.id = "demo-cursor";
  dot.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;width:22px;height:22px;border-radius:50%;background:rgba(34,64,106,0.28);border:2px solid rgba(34,64,106,0.55);box-shadow:0 2px 10px rgba(34,64,106,0.35);transform:translate(-50%,-50%);transition:width .12s,height .12s;left:-100px;top:-100px;";
  document.documentElement.appendChild(dot);
  const ripple = document.createElement("div");
  ripple.id = "demo-cursor-ripple";
  ripple.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;width:16px;height:16px;border-radius:50%;border:3px solid rgba(34,64,106,0.6);transform:translate(-50%,-50%) scale(0);opacity:0;left:-100px;top:-100px;";
  document.documentElement.appendChild(ripple);
  window.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
  }, true);
  window.addEventListener("mousedown", (e) => {
    dot.style.width = "16px"; dot.style.height = "16px";
    ripple.style.left = e.clientX + "px"; ripple.style.top = e.clientY + "px";
    ripple.style.transition = "none";
    ripple.style.opacity = "0.9";
    ripple.style.transform = "translate(-50%,-50%) scale(0.4)";
    requestAnimationFrame(() => {
      ripple.style.transition = "transform .45s cubic-bezier(0.16,1,0.3,1), opacity .45s";
      ripple.style.transform = "translate(-50%,-50%) scale(2.6)";
      ripple.style.opacity = "0";
    });
  }, true);
  window.addEventListener("mouseup", () => {
    dot.style.width = "22px"; dot.style.height = "22px";
  }, true);
})();
`;

class ClipRecorder {
  constructor(page) {
    this.page = page;
    this.frames = [];
    this.cdp = null;
    this.handler = null;
  }

  async start() {
    this.frames = [];
    this.startWall = Date.now();
    const t0 = performance.now();
    this.cdp = await this.page.context().newCDPSession(this.page);
    this.handler = async (ev) => {
      const ts = ev.metadata?.timestamp ?? (performance.now() - t0) / 1000;
      this.frames.push({ data: ev.data, ts });
      try {
        await this.cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId });
      } catch {
        /* session gone */
      }
    };
    this.cdp.on("Page.screencastFrame", this.handler);
    await this.cdp.send("Page.startScreencast", {
      format: "png",
      everyNthFrame: 1,
      maxWidth: 3840,
      maxHeight: 2160,
    });
  }

  async stop(name) {
    const stopWall = Date.now();
    await this.cdp.send("Page.stopScreencast").catch(() => {});
    this.cdp.off("Page.screencastFrame", this.handler);
    await this.cdp.detach().catch(() => {});
    if (!this.frames.length) throw new Error(`clip ${name}: no frames captured`);

    const dir = path.join(OUT, name);
    await mkdir(dir, { recursive: true });

    const origin = this.frames[0].ts;
    const totalWall = (stopWall - this.startWall) / 1000;
    const timed = this.frames.map((f) => ({ ...f, t: Math.max(0, f.ts - origin) }));
    let concat = "";
    for (let i = 0; i < timed.length; i += 1) {
      const file = `frame_${String(i + 1).padStart(5, "0")}.png`;
      await writeFile(path.join(dir, file), Buffer.from(timed[i].data, "base64"));
      const next = timed[i + 1]?.t;
      // A static screen repaints nothing, so hold the last frame across silent gaps up to the
      // clip's real wall-clock length; the final frame always carries the remainder.
      const raw = next ?? totalWall + 0.4;
      const duration = Math.min(Math.max(raw - timed[i].t, 1 / 30), 60);
      concat += `file '${file}'\nduration ${duration.toFixed(4)}\n`;
    }
    // ffmpeg's concat demuxer needs the last file listed once more after its duration.
    concat += `file 'frame_${String(timed.length).padStart(5, "0")}.png'\n`;
    await writeFile(path.join(dir, "ffmpeg-concat.txt"), concat);

    const seconds = Math.max(timed[timed.length - 1].t, totalWall);
    console.log(`clip ${name}: ${timed.length} frames, ${seconds.toFixed(1)}s`);
    return { name, frames: timed.length, seconds };
  }
}


async function main() {
  const browser = await chromium.launch({
    channel: "msedge",
    headless: false,
    args: ["--window-size=1936,1180"],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  await context.addInitScript(CURSOR_SCRIPT);
  const page = await context.newPage();
  const recorder = new ClipRecorder(page);

  const clips = [];
  async function clip(name, fn) {
    await recorder.start();
    try {
      await fn();
    } finally {
      clips.push(await recorder.stop(name));
    }
  }

  // Fresh device state: empty history so the landing shot is a first visit.
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".starters-list .chip");

  // ---- 01 · landing ----
  await clip("01-landing", async () => {
    await sleep(3200);
  });

  // ---- 02 · paste a link, transform ----
  await clip("02-transform", async () => {
    await page.locator("#url-input").click();
    await page.locator("#url-input").pressSequentially(IRS_URL, { delay: 12 });
    await sleep(400);
    await page.locator("button.primary", { hasText: "Transform this page" }).click();
    // Wait out the live model call (the long spinner gets cut in the edit).
    await page.waitForSelector(".mode-switch", { timeout: 90_000 });
    await sleep(2600);
    // Settle the view so both panels and the grade badge are on screen.
    await page.mouse.wheel(0, 320);
    await sleep(2200);
  });

  // ---- 03 · Simpler level ----
  await clip("03-simpler", async () => {
    await page.getByRole("button", { name: "Simpler" }).click();
    await page
      .waitForSelector('[aria-busy="true"]', { state: "detached", timeout: 30_000 })
      .catch(() => {});
    await sleep(4200);
  });

  // ---- 04 · five views: Focus, Dyslexia, Action, ADHD ----
  await clip("04-modes", async () => {
    await page.getByRole("button", { name: "Standard" }).click();
    await sleep(900);
    // Focus is the default mode: page forward once to show place-keeping.
    await page.getByRole("button", { name: "Next →" }).click();
    await sleep(2200);
    await page.getByRole("tab", { name: "Dyslexia" }).click();
    await sleep(3200);
    await page.getByRole("tab", { name: "Action" }).click();
    await sleep(3000);
    await page.getByRole("tab", { name: "ADHD" }).click();
    await sleep(3000);
  });

  // ---- 05 · karaoke Listen ----
  await clip("05-listen", async () => {
    await page.getByRole("tab", { name: "Listen" }).click();
    await sleep(1200);
    await page.getByRole("button", { name: "▶ Play" }).click();
    await sleep(12_000);
    await page.getByRole("button", { name: "■ Stop" }).click();
    await sleep(800);
  });

  // ---- 06 · Ask this page ----
  await clip("06-ask", async () => {
    const askHeading = page.getByRole("heading", { name: "Ask this page" });
    await askHeading.scrollIntoViewIfNeeded();
    await sleep(600);
    await page.locator('[class*="suggestions"] button').first().click();
    await page.waitForSelector('[class*="answer"]', { timeout: 60_000 }).catch(() => {});
    await sleep(3600);
  });

  // ---- 07 · reading comfort + night theme ----
  await clip("07-comfort", async () => {
    await page.getByRole("button", { name: "Large text" }).click();
    await sleep(1000);
    await page.getByRole("button", { name: "Wide" }).click();
    await sleep(1200);
    await page.getByRole("button", { name: "Night" }).click();
    await sleep(2600);
    await page.mouse.wheel(0, -1200);
    await sleep(1600);
  });

  await browser.close();
  console.log(JSON.stringify(clips, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
