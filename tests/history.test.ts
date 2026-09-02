/**
 * Seam: the history rules are pure and the storage is injected, so "newest first", the cap, dedupe,
 * and the corrupt-storage fallbacks are tested here rather than by clicking around a browser.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { CACHED_PAGES } from "@/lib/fixtures";
import { PREFERENCES_STORAGE_KEY } from "@/lib/preferences";
import {
  HISTORY_LIMIT,
  HISTORY_STORAGE_KEY,
  addVisit,
  describeVisit,
  entryKey,
  forgetEntry,
  hostLabel,
  parseHistory,
  readHistory,
  recordVisit,
  removeEntry,
  serializeHistory,
  titleFromUrl,
  visitRequest,
  type HistoryEntry,
  type HistoryStorage
} from "@/lib/history";

/** A stand-in for localStorage, plus a peek at what actually landed in it. */
function fakeStorage(seed?: string) {
  const store = new Map<string, string>(seed ? [[HISTORY_STORAGE_KEY, seed]] : []);

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    stored: () => store.get(HISTORY_STORAGE_KEY) ?? null
  };
}

const trio = CACHED_PAGES[0];

test("an empty store is an empty list, not a crash", () => {
  assert.deepEqual(readHistory(fakeStorage()), []);
  assert.deepEqual(parseHistory(null), []);
  assert.deepEqual(parseHistory(""), []);
  assert.deepEqual(readHistory(null), []);
});

test("a visit is recorded, read back, and written through to storage", () => {
  const storage = fakeStorage();

  const returned = recordVisit(storage, { url: "https://example.org/help/apply-for-a-permit", timestamp: 1000 });

  assert.deepEqual(returned, [
    {
      url: "https://example.org/help/apply-for-a-permit",
      title: "Apply for a permit",
      timestamp: 1000,
      level: "standard"
    }
  ]);
  assert.deepEqual(readHistory(storage), returned);
  assert.equal(storage.stored(), serializeHistory(returned));
});

test("a Cached page carries its slug and its real label, so returning to the trio needs no network", () => {
  const storage = fakeStorage();

  const [entry] = recordVisit(storage, { url: `${trio.url}?utm_source=readeasy`, timestamp: 1000 });

  assert.equal(entry.slug, trio.slug);
  assert.equal(entry.title, trio.label);
});

test("a pasted page is not recordable — there is no address to come back to", () => {
  const storage = fakeStorage();

  assert.deepEqual(recordVisit(storage, { rawText: "Pasted page text" }), []);
  assert.deepEqual(recordVisit(storage, { url: "   " }), []);
  assert.deepEqual(readHistory(storage), []);
});

test("a typo that is not a web address never reaches the list", () => {
  const storage = fakeStorage();

  for (const url of ["irs.gov/eitc", "who qualifies", "file:///etc/passwd", "javascript:alert(1)"]) {
    assert.deepEqual(recordVisit(storage, { url }), [], url);
  }
});

test("the newest visit is first", () => {
  const storage = fakeStorage();

  recordVisit(storage, { url: "https://example.org/first", timestamp: 1000 });
  recordVisit(storage, { url: "https://example.org/second", timestamp: 2000 });
  recordVisit(storage, { url: "https://example.org/third", timestamp: 3000 });

  assert.deepEqual(
    readHistory(storage).map((entry) => entry.url),
    ["https://example.org/third", "https://example.org/second", "https://example.org/first"]
  );
});

test("a stored list in the wrong order is re-sorted on the way out", () => {
  const stored = serializeHistory([
    { url: "https://example.org/older", title: "Older", timestamp: 1000, level: "standard" },
    { url: "https://example.org/newer", title: "Newer", timestamp: 9000, level: "standard" }
  ]);

  assert.deepEqual(
    parseHistory(stored).map((entry) => entry.title),
    ["Newer", "Older"]
  );
});

test("the list is capped, and it is the oldest visit that falls off", () => {
  const storage = fakeStorage();

  for (let index = 0; index < HISTORY_LIMIT + 3; index += 1) {
    recordVisit(storage, { url: `https://example.org/page-${index}`, timestamp: 1000 + index });
  }

  const entries = readHistory(storage);
  assert.equal(entries.length, HISTORY_LIMIT);
  assert.equal(entries[0].url, `https://example.org/page-${HISTORY_LIMIT + 2}`);
  assert.deepEqual(
    entries.filter((entry) => entry.url === "https://example.org/page-0"),
    []
  );
});

test("the same page linked two ways is one entry, moved to the top", () => {
  const storage = fakeStorage();

  recordVisit(storage, { url: "https://www.Example.org/Guides/visas/", timestamp: 1000 });
  recordVisit(storage, { url: "https://example.org/other", timestamp: 2000 });
  recordVisit(storage, { url: "http://example.org/Guides/visas#eligibility", timestamp: 3000 });

  const entries = readHistory(storage);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].url, "http://example.org/Guides/visas#eligibility");
  assert.equal(entries[0].timestamp, 3000);
});

test("two spellings of a Cached page dedupe on the slug", () => {
  const storage = fakeStorage();

  recordVisit(storage, { url: trio.url, timestamp: 1000 });
  recordVisit(storage, { url: `${trio.url}?utm_source=readeasy#main`, timestamp: 2000 });

  assert.equal(readHistory(storage).length, 1);
});

test("a query string is not a page a reader never read", () => {
  const storage = fakeStorage();

  recordVisit(storage, { url: "https://example.org/forms?id=204", timestamp: 1000 });
  recordVisit(storage, { url: "https://example.org/forms?id=307", timestamp: 2000 });

  assert.equal(readHistory(storage).length, 2);
});

test("a reader can remove one entry, and the rest stay", () => {
  const storage = fakeStorage();
  recordVisit(storage, { url: "https://example.org/keep-me", timestamp: 1000 });
  recordVisit(storage, { url: "https://example.org/drop-me", timestamp: 2000 });
  recordVisit(storage, { url: trio.url, timestamp: 3000 });

  const dropped = readHistory(storage).filter((entry) => entry.url === "https://example.org/drop-me");
  assert.equal(dropped.length, 1);
  const left = forgetEntry(storage, entryKey(dropped[0]));

  assert.deepEqual(
    left.map((entry) => entry.url),
    [trio.url, "https://example.org/keep-me"]
  );
  assert.deepEqual(readHistory(storage), left);
});

test("removing an entry that is not there changes nothing", () => {
  const entries = addVisit([], { url: "https://example.org/only", timestamp: 1000 });

  assert.deepEqual(removeEntry(entries, "url:example.org/never-visited"), entries);
});

test("corrupt or hostile storage values never throw", () => {
  for (const stored of ['{"url":"https://example.org"}', "not json", "null", '"[]"', "42", "[1,2,3]", '[[]]', "[{}]"]) {
    assert.deepEqual(parseHistory(stored), [], stored);
  }
});

test("one unusable entry is dropped, and the rest of the list survives", () => {
  const stored = JSON.stringify([
    { url: "https://example.org/good", title: "Good", timestamp: 2000, level: "simpler" },
    { title: "No address at all", timestamp: 3000 },
    { url: "https://example.org/odd", title: "", timestamp: "yesterday", level: "sideways" }
  ]);

  const entries = parseHistory(stored);

  assert.deepEqual(
    entries.map((entry) => entry.url),
    ["https://example.org/odd", "https://example.org/good"]
  );
  assert.equal(entries[0].title, "Odd");
  assert.equal(entries[0].level, "standard", "an unknown level falls back rather than losing the visit");
  assert.equal(entries[1].level, "simpler");
});

test("storage a browser has locked down costs the list, never the page", () => {
  const blocked: HistoryStorage = {
    getItem() {
      throw new Error("access denied");
    },
    setItem() {
      throw new Error("access denied");
    }
  };

  assert.deepEqual(readHistory(blocked), []);
  assert.equal(recordVisit(blocked, { url: "https://example.org/page", timestamp: 1000 }).length, 1);
  assert.deepEqual(forgetEntry(blocked, "url:example.org/page"), []);
});

test("reopening an entry asks for the same page at the same reading level", () => {
  const entry: HistoryEntry = {
    url: trio.url,
    slug: trio.slug,
    title: trio.label,
    timestamp: 1000,
    level: "simpler"
  };

  assert.deepEqual(visitRequest(entry), { url: trio.url, level: "simpler" });
});

test("a title read off a URL is words, not a slug", () => {
  assert.equal(titleFromUrl("https://www.uscis.gov/working/students-and-employment"), "Students and employment");
  assert.equal(titleFromUrl("https://www.irs.gov/publications/p596"), "P596");
  assert.equal(titleFromUrl("https://example.org/forms/apply_now.html"), "Apply now");
  assert.equal(titleFromUrl("https://example.org/a%20long%20name"), "A long name");
  assert.equal(titleFromUrl("https://www.example.org/"), "example.org", "a bare host still names itself");
  assert.equal(titleFromUrl("not a url"), "not a url", "nonsense in, the same nonsense out");
});

test("the host under the title drops the noise", () => {
  assert.equal(hostLabel("https://www.irs.gov/credits-deductions"), "irs.gov");
  assert.equal(hostLabel("http://enroll.utdallas.edu/freshman/apply/"), "enroll.utdallas.edu");
  assert.equal(hostLabel("still not a url"), "still not a url");
});

test("when a visit happened, in words a reader recognises", () => {
  const now = Date.UTC(2026, 8, 3, 12, 0, 0);
  const cases: [number, string][] = [
    [0, "just now"],
    [30_000, "just now"],
    [60_000, "1 minute ago"],
    [2 * 60_000, "2 minutes ago"],
    [61 * 60_000, "1 hour ago"],
    [26 * 60 * 60_000, "1 day ago"],
    [5 * 24 * 60 * 60_000, "5 days ago"]
  ];

  for (const [elapsed, expected] of cases) {
    assert.equal(describeVisit(now - elapsed, now), expected);
  }

  assert.equal(describeVisit(now + 60_000, now), "just now", "a clock behind the stamp is not a negative age");
});

/**
 * The two storage keys have to stay distinct: sharing one would have a page visit overwrite the text
 * size and theme a reader with low vision set, and nothing would throw to say so.
 */
test("history has its own storage key", () => {
  assert.equal(HISTORY_STORAGE_KEY, "readeasy.page-history");
  assert.notEqual(HISTORY_STORAGE_KEY, PREFERENCES_STORAGE_KEY);
});
