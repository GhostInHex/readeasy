import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";
import { TransformFailure } from "@/lib/errors";
import { normalizeText } from "@/lib/text";

export interface CleanedPage {
  title: string;
  text: string;
}

/**
 * Cleaning — strip ads, nav, scripts, and styling from fetched HTML and keep the article
 * text. No AI is involved: this is Readability over a DOM, nothing else.
 */
export function cleanHtml(html: string, url?: string): CleanedPage {
  // jsdom logs noisy CSS parse errors for real-world pages; they are irrelevant here.
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", () => {});

  let document: Document;
  try {
    const dom = new JSDOM(html, url ? { url, virtualConsole } : { virtualConsole });
    document = dom.window.document as unknown as Document;
  } catch {
    throw new TransformFailure({
      code: "clean_failed",
      message: "ReadEasy could not read the structure of that page."
    });
  }

  const article = new Readability(document as never).parse();
  const text = normalizeText(article?.textContent ?? "");

  if (text.length < 200) {
    throw new TransformFailure({
      code: "no_readable_content",
      message: "That page did not contain enough readable text to transform.",
      hint: "Pages built mostly from links or scripts often clean to nothing. Paste the text you care about into the Raw text tab."
    });
  }

  return {
    title: (article?.title ?? "").trim(),
    text
  };
}

/** The raw-text path: no fetching, no Readability — just normalization. */
export function cleanRawText(rawText: string): CleanedPage {
  const text = normalizeText(rawText);

  if (text.length < 40) {
    throw new TransformFailure({
      code: "raw_text_too_short",
      message: "That is too little text to transform.",
      hint: "Paste at least a paragraph of the page you want to read.",
      status: 400
    });
  }

  return { title: "", text };
}
