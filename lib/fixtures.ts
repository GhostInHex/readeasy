import index from "@/fixtures/index.json";
import type { ReadingLevel } from "@/lib/types";

/**
 * Cached page lookup.
 *
 * Ticket 02 captured a screenshot of every Demo trio page. This maps a request URL onto the
 * bundled screenshot so the "before" half of the split screen can show the real, cluttered page
 * instead of the cleaned text.
 *
 * The comparison is deliberately forgiving: protocol, a leading `www.`, a trailing slash, query
 * strings and fragments all differ between how a page is linked and how someone types it. It is
 * never loose enough to match a *different* page — host and path have to be the same.
 */
export interface CachedPage {
  slug: string;
  label: string;
  url: string;
  role: "trio" | "backup";
  /** Public path of the bundled screenshot, served straight out of `public/`. */
  screenshot: string;
}

export const CACHED_PAGES: CachedPage[] = (index as CachedPage[]).filter((page) => Boolean(page.screenshot));

/** Host + path, normalised. `null` for anything that is not a public web address. */
function fingerprint(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname.toLowerCase().replace(/\/+$/, "");
  return `${host}${path}`;
}

const BY_FINGERPRINT = new Map<string, CachedPage>(
  CACHED_PAGES.flatMap((page) => {
    const key = fingerprint(page.url);
    return key ? [[key, page] as [string, CachedPage]] : [];
  })
);

/** The cached page for this URL, or `null` — including for raw-text transforms, which have none. */
export function matchCachedPage(rawUrl: string | null | undefined): CachedPage | null {
  if (!rawUrl) {
    return null;
  }

  const key = fingerprint(rawUrl);
  return (key && BY_FINGERPRINT.get(key)) || null;
}

/**
 * Where a cached page's pre-generated Restructure for one reading level lives, relative to the repo
 * root: `fixtures/<slug>/<level>.json`.
 *
 * Convention, not configuration. `index.json` says nothing about these files, so a variant starts
 * being served the moment it is captured into place (`tools/capture-simpler.mjs`) and nothing has to
 * be registered. Only `simpler.json` is captured today; the standard level is restructured live.
 *
 * Reading the file is deliberately not this module's job — the left panel imports it into the
 * browser bundle, and `node:fs` has no business there. `lib/cached-transform.ts` does the reading on
 * the server.
 */
export function cachedVariantPath(slug: string, level: ReadingLevel): string {
  return `fixtures/${slug}/${level}.json`;
}

/** Where a cached page's cleaned original text lives, relative to the repo root. */
export function cachedCleanedTextPath(slug: string): string {
  return `fixtures/${slug}/cleaned.txt`;
}
