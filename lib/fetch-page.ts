import { TransformFailure, RAW_TEXT_HINT } from "@/lib/errors";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 ReadEasy/1.0 (+accessibility reader)";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 5_000_000;

const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]", "metadata.google.internal"]);

/**
 * Reject anything that is not a public http(s) page. The server fetches URLs supplied by
 * strangers, so private and link-local targets stay out of reach (SSRF guard).
 */
export function assertFetchableUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new TransformFailure({
      code: "invalid_url",
      message: "That does not look like a web address.",
      hint: "Use a full link such as https://www.irs.gov/… , or paste the page text instead.",
      status: 400
    });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TransformFailure({
      code: "unsupported_protocol",
      message: "ReadEasy can only open http and https pages.",
      hint: RAW_TEXT_HINT,
      status: 400
    });
  }

  const hostname = url.hostname.toLowerCase();
  const isPrivate =
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

  if (isPrivate) {
    throw new TransformFailure({
      code: "private_address",
      message: "ReadEasy only opens pages on the public web.",
      hint: RAW_TEXT_HINT,
      status: 400
    });
  }

  return url;
}

/** Fetch a page's HTML, translating every failure mode into the error contract. */
export async function fetchPageHtml(rawUrl: string): Promise<string> {
  const url = assertFetchableUrl(rawUrl);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new TransformFailure({
      code: timedOut ? "fetch_timeout" : "fetch_failed",
      message: timedOut
        ? "That page took too long to respond."
        : "ReadEasy could not reach that page.",
      hint: RAW_TEXT_HINT
    });
  }

  if (response.status === 403 || response.status === 401 || response.status === 429) {
    throw new TransformFailure({
      code: "blocked_by_site",
      message: `That site refused the request (HTTP ${response.status}). Many government sites block automated readers.`,
      hint: RAW_TEXT_HINT
    });
  }

  if (!response.ok) {
    throw new TransformFailure({
      code: "fetch_failed",
      message: `That page could not be loaded (HTTP ${response.status}).`,
      hint: RAW_TEXT_HINT
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
    throw new TransformFailure({
      code: "unsupported_content",
      message: `ReadEasy reads web pages, and that link is ${contentType.split(";")[0]}.`,
      hint: "PDFs and documents are out of scope. Paste the text you want to read into the Raw text tab."
    });
  }

  const html = await response.text();

  if (html.length > MAX_HTML_BYTES) {
    return html.slice(0, MAX_HTML_BYTES);
  }

  return html;
}
