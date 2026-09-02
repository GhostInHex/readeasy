/**
 * My pages history: the handful of pages a reader has transformed, kept on their own device.
 *
 * Modelled on lib/preferences.ts — the rules are pure and the storage is passed in, so "newest
 * first", the cap, and dedupe are all tested without a browser. There is deliberately no server
 * side: what somebody reads is nobody else's business, which rules out a database and rules in
 * localStorage.
 */
import { matchCachedPage } from "@/lib/fixtures";

/** Which Restructure the page was read at — the Simpler/Standard pair over the reading view. */
export type HistoryLevel = "standard" | "simpler";

const LEVELS: HistoryLevel[] = ["standard", "simpler"];
const DEFAULT_LEVEL: HistoryLevel = "standard";

export interface HistoryEntry {
  /** The address the reader transformed. Clicking the entry re-runs the Transform for it. */
  url: string;
  /** Set when the URL is a Cached page, so returning to one of the trio never needs the network. */
  slug?: string;
  title: string;
  /** Epoch milliseconds. The list is ordered by this, newest first. */
  timestamp: number;
  level: HistoryLevel;
}

export const HISTORY_STORAGE_KEY = "readeasy.page-history";

/**
 * Six. A history long enough to need scanning is no faster than retyping the address, and this list
 * sits between the transform box and the reading panels — it would push the reading off screen if it
 * grew. The seventh visit drops the oldest.
 */
export const HISTORY_LIMIT = 6;

/**
 * What a caller knows at the moment of a Transform. A Transform request satisfies this as it is, so
 * recording a visit is one call with the request already in hand.
 */
export interface HistoryVisit {
  url?: string;
  /** Accepted and ignored: a pasted page has no address to come back to, so it is not recordable. */
  rawText?: string;
  slug?: string;
  title?: string;
  timestamp?: number;
  /**
   * Loose on purpose. It may arrive straight off a Transform request carrying the reader's chosen
   * reading level; anything unrecognised falls back to standard rather than losing the visit.
   */
  level?: unknown;
}

/** Only a real public-web address is worth listing — the pipeline refuses anything else anyway. */
function isWebAddress(raw: string): boolean {
  try {
    const { protocol } = new URL(raw);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalise one visit into an entry, or `null` when there is nothing to return to — a pasted page, a
 * blank box, a typo that is not an address. A Cached page contributes its slug and its real label;
 * every other page gets a title read off the URL, because when Transform is pressed the page's own
 * title does not exist yet.
 */
function toEntry(visit: HistoryVisit): HistoryEntry | null {
  const url = typeof visit.url === "string" ? visit.url.trim() : "";
  if (!isWebAddress(url)) {
    return null;
  }

  const cached = matchCachedPage(url);
  const slug = typeof visit.slug === "string" && visit.slug.trim() ? visit.slug.trim() : cached?.slug;
  const given = typeof visit.title === "string" ? visit.title.trim() : "";
  const timestamp =
    typeof visit.timestamp === "number" && Number.isFinite(visit.timestamp) ? visit.timestamp : Date.now();

  return {
    url,
    // Omitted rather than set to undefined, so a stored entry holds only what it knows.
    ...(slug ? { slug } : {}),
    title: given || cached?.label || titleFromUrl(url),
    timestamp,
    level: LEVELS.includes(visit.level as HistoryLevel) ? (visit.level as HistoryLevel) : DEFAULT_LEVEL
  };
}

/**
 * Host and path, tidied. The same page linked two ways — a trailing slash, a `www.`, a shouty host,
 * an anchor onto a heading — is one page. A query string is not tidied away: `?id=204` often *is* the
 * page, and merging two of those would hand the reader back something they never read.
 */
function canonicalUrl(raw: string): string {
  const trimmed = raw.trim();

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return `${host}${url.pathname.replace(/\/+$/, "")}${url.search}`;
  } catch {
    return trimmed.toLowerCase();
  }
}

/** How two entries are recognised as the same page: a Cached page's slug, otherwise the tidied URL. */
export function entryKey(entry: HistoryEntry): string {
  return entry.slug ? `slug:${entry.slug}` : `url:${canonicalUrl(entry.url)}`;
}

/** The last path segment as words: `students-and-employment` reads as `students and employment`. */
function readableSegment(segment: string): string {
  let text = segment;

  try {
    text = decodeURIComponent(segment);
  } catch {
    // A half-escaped URL: the raw segment is still better than nothing.
  }

  return text
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .replace(/[-_+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A readable label for a page whose real title ReadEasy does not have. Recording happens the moment
 * the reader presses Transform, so the URL is all there is: its last segment, in words, sentence
 * case. Pages in the Demo trio never get this — they carry their own label.
 */
export function titleFromUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const words = readableSegment(url.pathname.split("/").filter(Boolean).pop() ?? "");
  if (!words) {
    return hostLabel(trimmed);
  }

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The site a page came from, for the line under the title. */
export function hostLabel(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  try {
    return new URL(trimmed).hostname.replace(/^www\./i, "");
  } catch {
    return trimmed;
  }
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}

/**
 * When the visit was, in plain words. Written out rather than left as a date because "3 days ago" is
 * the thing a reader actually recognises; a clock running behind the stored stamp reads as "just
 * now" rather than a negative number.
 */
export function describeVisit(timestamp: number, now: number = Date.now()): string {
  const elapsed = Math.max(0, now - timestamp);

  if (elapsed < MINUTE) {
    return "just now";
  }
  if (elapsed < HOUR) {
    return ago(Math.floor(elapsed / MINUTE), "minute");
  }
  if (elapsed < DAY) {
    return ago(Math.floor(elapsed / HOUR), "hour");
  }

  return ago(Math.floor(elapsed / DAY), "day");
}

/** Newest first, one entry per page, capped — the shape of the list however it was assembled. */
function prune(entries: HistoryEntry[]): HistoryEntry[] {
  const seen = new Set<string>();
  const kept: HistoryEntry[] = [];

  for (const entry of [...entries].sort((a, b) => b.timestamp - a.timestamp)) {
    const key = entryKey(entry);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    kept.push(entry);
    if (kept.length === HISTORY_LIMIT) {
      break;
    }
  }

  return kept;
}

/**
 * Read the list back out of storage. A value that is missing, half-written, or hand-edited into
 * nonsense yields an empty list, and one bad entry is dropped rather than taking the rest with it —
 * the reader loses a row, never the page.
 */
export function parseHistory(stored: string | null): HistoryEntry[] {
  if (!stored) {
    return [];
  }

  let raw: unknown;
  try {
    raw = JSON.parse(stored);
  } catch {
    return [];
  }

  if (!Array.isArray(raw)) {
    return [];
  }

  const entries: HistoryEntry[] = [];
  for (const value of raw) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }

    const entry = toEntry(value as HistoryVisit);
    if (entry) {
      entries.push(entry);
    }
  }

  return prune(entries);
}

export function serializeHistory(entries: HistoryEntry[]): string {
  return JSON.stringify(entries);
}

/**
 * Add a visit to a list. A page already in it moves to the top instead of appearing twice: coming
 * back to a page is the same page, not a second one.
 */
export function addVisit(entries: HistoryEntry[], visit: HistoryVisit): HistoryEntry[] {
  const entry = toEntry(visit);
  if (!entry) {
    return prune(entries);
  }

  const key = entryKey(entry);
  return prune([entry, ...entries.filter((existing) => entryKey(existing) !== key)]);
}

/** Drop one entry by its key. Unknown keys change nothing. */
export function removeEntry(entries: HistoryEntry[], key: string): HistoryEntry[] {
  return entries.filter((entry) => entryKey(entry) !== key);
}

/** Just the two methods this module needs from `Storage`, so a test can pass a plain object. */
export interface HistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * The reader's list, or an empty one. Storage can be blocked outright — private windows, a
 * locked-down browser — and losing the history there is acceptable; throwing on the landing page is
 * not.
 */
export function readHistory(storage: HistoryStorage | null | undefined): HistoryEntry[] {
  if (!storage) {
    return [];
  }

  try {
    return parseHistory(storage.getItem(HISTORY_STORAGE_KEY));
  } catch {
    return [];
  }
}

/** Best effort. A full quota or a blocked store costs the reader the list, never the transform. */
export function writeHistory(storage: HistoryStorage | null | undefined, entries: HistoryEntry[]): void {
  try {
    storage?.setItem(HISTORY_STORAGE_KEY, serializeHistory(entries));
  } catch {
    // The list just won't survive the reload; this visit still works.
  }
}

/** Record a visit and hand back the list as it now stands, ready to render. */
export function recordVisit(storage: HistoryStorage | null | undefined, visit: HistoryVisit): HistoryEntry[] {
  const next = addVisit(readHistory(storage), visit);
  writeHistory(storage, next);
  return next;
}

/** Forget one page, on the reader's say-so. */
export function forgetEntry(storage: HistoryStorage | null | undefined, key: string): HistoryEntry[] {
  const next = removeEntry(readHistory(storage), key);
  writeHistory(storage, next);
  return next;
}

/**
 * The Transform request that reopens an entry — shaped to satisfy the app's `TransformRequest`. The
 * level rides along so a page comes back at the level it was read at, and a Cached page is served
 * from the bundled fixtures, so returning to one of the trio needs no network and no key.
 */
export function visitRequest(entry: HistoryEntry): { url: string; level: HistoryLevel } {
  return { url: entry.url, level: entry.level };
}
