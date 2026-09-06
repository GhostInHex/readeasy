// Screenshot each scene card at 1920x1080 CSS px with deviceScaleFactor 2 (=> 3840x2160 PNG).
import { chromium } from "playwright-core";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCENES = path.resolve(HERE, "..", "scenes");
const OUT = path.resolve(HERE, "..", "frames");

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await mkdir0(OUT);
for (const file of (await readdir(SCENES)).filter((f) => f.endsWith(".html")).sort()) {
  await page.goto("file:///" + path.join(SCENES, file).replace(/\\/g, "/"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1300); // let the entrance animation settle
  const png = path.join(OUT, path.basename(file, ".html") + ".png");
  await page.screenshot({ path: png });
  console.log("scene ->", png);
}
await browser.close();

async function mkdir0(dir) {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
}
