import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { CACHED_PAGES, matchCachedPage } from "@/lib/fixtures";

const repoRoot = path.resolve(import.meta.dirname, "..");

test("every cached page matches its own URL and points at a bundled screenshot", () => {
  assert.ok(CACHED_PAGES.length >= 3, "the demo trio must be cached");

  for (const page of CACHED_PAGES) {
    const matched = matchCachedPage(page.url);
    assert.equal(matched?.slug, page.slug, `${page.url} should match ${page.slug}`);
    assert.match(page.screenshot, /^\/fixtures\/.+\.png$/);
    assert.ok(
      existsSync(path.join(repoRoot, "public", page.screenshot)),
      `${page.screenshot} is advertised but missing from public/`
    );
  }
});

test("matching ignores protocol, www, trailing slashes, query and fragment", () => {
  const page = CACHED_PAGES[0];
  const url = new URL(page.url);
  const bareHost = url.hostname.replace(/^www\./, "");

  const variants = [
    page.url.replace("https://", "http://"),
    `https://${bareHost}${url.pathname}`,
    `https://www.${bareHost}${url.pathname}`,
    `${page.url.replace(/\/$/, "")}/`,
    page.url.replace(/\/$/, ""),
    `${page.url}?utm_source=readeasy`,
    `${page.url}#main-content`,
    `  ${page.url}  `,
    page.url.toUpperCase().replace("HTTPS", "https")
  ];

  for (const variant of variants) {
    assert.equal(matchCachedPage(variant)?.slug, page.slug, `${variant} should still match`);
  }
});

test("a different page on a cached host is not a match", () => {
  const page = CACHED_PAGES[0];
  const host = new URL(page.url).origin;

  assert.equal(matchCachedPage(`${host}/forms-pubs`), null);
  assert.equal(matchCachedPage(`${page.url}/extra-segment`), null);
  assert.equal(matchCachedPage(page.url.replace(/[^/]+$/, "something-else")), null);
});

test("uncached, empty and hostile URLs return null instead of throwing", () => {
  for (const value of [
    undefined,
    null,
    "",
    "   ",
    "not a url",
    "https://example.com/whatever",
    "file:///etc/passwd",
    "javascript:alert(1)",
    "//www.irs.gov/credits-deductions"
  ]) {
    assert.equal(matchCachedPage(value), null, `${String(value)} must not match a fixture`);
  }
});

test("slugs are unique, so a URL can only ever resolve to one screenshot", () => {
  const slugs = CACHED_PAGES.map((page) => page.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});
