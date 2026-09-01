import index from "@/fixtures/index.json";

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
