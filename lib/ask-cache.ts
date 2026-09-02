import irsEitc from "@/fixtures/irs-eitc/answers.json";
import uscisStudentsEmployment from "@/fixtures/uscis-students-employment/answers.json";
import utdallasFirstYearApply from "@/fixtures/utdallas-first-year-apply/answers.json";

/**
 * Cached answers for the Demo trio — the offline half of "Ask this page".
 *
 * The cached-demo rule is non-negotiable: with no network and no OpenRouter key, each trio page must
 * still answer its three suggested questions. Those question/answer pairs are bundled beside the
 * fixtures as `fixtures/<slug>/answers.json` and imported here, so they ship inside the build rather
 * than being read off disk at request time.
 *
 * A page that is not cached is not a failure: it gets the generic suggested questions and its answers
 * come from the live path. Nothing in this module ever calls a model.
 */

export interface CachedQa {
  question: string;
  answer: string;
}

export interface CachedAnswerPage {
  slug: string;
  label: string;
  url: string;
  /** When these answers were written, and by what — provenance a judge can check. */
  capturedAt: string;
  engine: string;
  answers: CachedQa[];
}

/** Three suggested questions: enough to show what asking is for, few enough to read at a glance. */
export const SUGGESTED_COUNT = 3;

export const CACHED_ANSWER_PAGES: CachedAnswerPage[] = [
  irsEitc,
  utdallasFirstYearApply,
  uscisStudentsEmployment
] as CachedAnswerPage[];

/**
 * What a live page offers instead. Person-first and page-agnostic: they are the three things a reader
 * who lost the thread actually needs, and any page can answer them from its own text.
 */
export const GENERIC_QUESTIONS: string[] = [
  "What is this page about?",
  "What do I have to do?",
  "Are there any deadlines?"
];

/** How a caller names the page being asked about. Raw-text transforms have neither, and that is fine. */
export interface AskPageRef {
  slug?: string | null;
  url?: string | null;
}

/**
 * Host + path, lowercased, without `www.`, a trailing slash, a query or a fragment — the same
 * forgiveness the screenshot matcher applies, kept here so the answer cache depends on nothing but
 * its own JSON. Never loose enough to match a different page: host and path still have to agree.
 */
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

const BY_SLUG = new Map<string, CachedAnswerPage>(CACHED_ANSWER_PAGES.map((page) => [page.slug, page]));

const BY_FINGERPRINT = new Map<string, CachedAnswerPage>(
  CACHED_ANSWER_PAGES.flatMap((page) => {
    const key = fingerprint(page.url);
    return key ? [[key, page] as [string, CachedAnswerPage]] : [];
  })
);

/** The cached answer set for this page, by slug or by URL, or `null` when the page is not cached. */
export function cachedAnswersFor(ref: AskPageRef): CachedAnswerPage | null {
  const slug = ref.slug?.trim();
  if (slug) {
    const bySlug = BY_SLUG.get(slug);
    if (bySlug) {
      return bySlug;
    }
  }

  const key = ref.url ? fingerprint(ref.url) : null;
  return (key && BY_FINGERPRINT.get(key)) || null;
}

/** The questions shown as buttons: a cached page's own three, otherwise the generic three. */
export function suggestedQuestionsFor(ref: AskPageRef): string[] {
  const cached = cachedAnswersFor(ref)?.answers.slice(0, SUGGESTED_COUNT).map((qa) => qa.question);
  return cached?.length ? cached : GENERIC_QUESTIONS;
}

/** Words only: case, punctuation and spacing differ between a typed question and a clicked one. */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Same words in any order — "do I need an SSN" and "need an SSN, do I?" are one question. */
function signature(question: string): string {
  return normalizeQuestion(question).split(" ").filter(Boolean).sort().join(" ");
}

/**
 * The cached answer to this question, or `null` to let the live path handle it.
 *
 * Matching is deliberately strict — same words, ignoring case, punctuation and order. Anything looser
 * would risk answering a question the reader did not ask, which is the one failure a grounded
 * assistant cannot afford.
 */
export function findCachedAnswer(ref: AskPageRef, question: string): CachedQa | null {
  const page = cachedAnswersFor(ref);
  const asked = normalizeQuestion(question);
  if (!page || !asked) {
    return null;
  }

  const exact = page.answers.find((qa) => normalizeQuestion(qa.question) === asked);
  if (exact) {
    return exact;
  }

  const asKeywords = signature(question);
  return page.answers.find((qa) => signature(qa.question) === asKeywords) ?? null;
}
