#!/usr/bin/env node
/**
 * Capture the Demo trio fixtures.
 *
 * For each page: fetch the HTML, save it raw, run the Cleaning step (Readability) to
 * produce cleaned text, and take a full-page screenshot of the messy original.
 *
 *   node fixtures/capture.mjs            # capture every page
 *   node fixtures/capture.mjs irs-eitc   # capture one page by slug
 *
 * Screenshots are written to public/fixtures/<slug>.png so the app can serve them
 * (ticket 10 shows them in the left panel); everything else stays in fixtures/<slug>/.
 *
 * Run by a human before Build Day. The app never calls this at runtime.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import puppeteer from "puppeteer-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..");
const PUBLIC_SHOTS = join(REPO, "public", "fixtures");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
].filter(Boolean);

export const PAGES = [
  {
    slug: "irs-eitc",
    label: "IRS — Who Qualifies for the Earned Income Tax Credit (EITC)",
    url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/who-qualifies-for-the-earned-income-tax-credit-eitc",
    role: "trio"
  },
  {
    slug: "utdallas-first-year-apply",
    label: "UT Dallas — Apply as a first-year student",
    url: "https://enroll.utdallas.edu/freshman/apply/",
    role: "trio"
  },
  {
    slug: "uscis-students-employment",
    label: "USCIS — Students and Employment",
    url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment",
    role: "trio"
  },
  {
    slug: "usagov-visas",
    label: "USA.gov — Immigrant visas (backup)",
    url: "https://www.usa.gov/visas",
    role: "backup"
  },
  {
    slug: "irs-pub596",
    label: "IRS — Publication 596, Earned Income Credit (long-form backup)",
    url: "https://www.irs.gov/publications/p596",
    role: "backup",
    // 36k words: a full-page capture is ~18 MB, so this one keeps a viewport shot.
    fullPage: false
  }
];

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9"
    },
    redirect: "follow"
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/** Same Cleaning step the app uses: Readability over a DOM, text only. */
function clean(html, url) {
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article?.textContent) throw new Error("Readability produced no text");
  return {
    title: article.title ?? "",
    text: article.textContent
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n\n")
  };
}

async function screenshot(browser, url, target, fullPage = true) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90_000 });
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await page.screenshot({ path: target, fullPage });
  } finally {
    await page.close();
  }
}

async function launchBrowser() {
  let lastError;
  for (const executablePath of CHROME_CANDIDATES) {
    try {
      return await puppeteer.launch({ executablePath, headless: true, args: ["--hide-scrollbars"] });
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`No usable Chrome/Edge found. Set CHROME_PATH. Last error: ${lastError?.message}`);
}

async function writeIndex() {
  const index = PAGES.map((page) => ({
    slug: page.slug,
    label: page.label,
    url: page.url,
    role: page.role,
    screenshot: `/fixtures/${page.slug}.png`,
    cleanedText: `fixtures/${page.slug}/cleaned.txt`,
    rawHtml: `fixtures/${page.slug}/page.html`
  }));
  await writeFile(join(HERE, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  const indexOnly = args.includes("--index-only");
  const only = args.filter((arg) => !arg.startsWith("--"));

  await writeIndex();
  if (indexOnly) {
    console.log("wrote fixtures/index.json");
    return;
  }

  const targets = only.length ? PAGES.filter((page) => only.includes(page.slug)) : PAGES;
  if (!targets.length) {
    console.error(`No pages matched ${only.join(", ")}`);
    process.exit(1);
  }

  await mkdir(PUBLIC_SHOTS, { recursive: true });
  const browser = await launchBrowser();
  const summary = [];

  try {
    for (const page of targets) {
      const dir = join(HERE, page.slug);
      await mkdir(dir, { recursive: true });
      console.log(`\n== ${page.slug} — ${page.url}`);

      const html = await fetchHtml(page.url);
      await writeFile(join(dir, "page.html"), html, "utf8");
      console.log(`   raw html      ${(html.length / 1024).toFixed(0)} KB`);

      const cleaned = clean(html, page.url);
      await writeFile(join(dir, "cleaned.txt"), cleaned.text, "utf8");
      const words = countWords(cleaned.text);
      console.log(`   cleaned text  ${words} words${words < 2000 ? "  (under 2000)" : ""}`);

      const shotPath = join(PUBLIC_SHOTS, `${page.slug}.png`);
      await screenshot(browser, page.url, shotPath, page.fullPage !== false);
      console.log(`   screenshot    public/fixtures/${page.slug}.png`);

      const meta = {
        slug: page.slug,
        label: page.label,
        url: page.url,
        role: page.role,
        capturedAt: new Date().toISOString(),
        rawHtmlBytes: Buffer.byteLength(html, "utf8"),
        cleanedTitle: cleaned.title,
        cleanedWordCount: words,
        screenshot: `/fixtures/${page.slug}.png`
      };
      await writeFile(join(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`, "utf8");
      summary.push(meta);
    }
  } finally {
    await browser.close();
  }

  console.log("\n== summary");
  for (const meta of summary) {
    console.log(`   ${meta.slug.padEnd(28)} ${String(meta.cleanedWordCount).padStart(6)} words  ${meta.role}`);
  }
}

main().catch((error) => {
  console.error(`\ncapture failed: ${error.message}`);
  process.exit(1);
});
