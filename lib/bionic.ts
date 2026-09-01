/**
 * Bionic Reading: bold the leading half of each word so the eye can anchor on word shapes.
 *
 * Pure and structural on purpose. It returns segments rather than an HTML string so the
 * Dyslexia renderer can emit real <strong> elements without dangerouslySetInnerHTML, and so
 * this rule can be tested at Seam 2 without a browser.
 */

export interface BionicSegment {
  /** The part to render bold. Empty for whitespace, numbers, URLs, and other skipped tokens. */
  lead: string;
  /** The remainder, rendered at normal weight. */
  rest: string;
}

const HAS_LETTER = /\p{L}/u;

/** Things that are read as a unit, not as a word: links, emails, handles, file paths. */
const OPAQUE_TOKEN = /:\/\/|^www\.|@|^[/\\~]|\.(?:com|org|net|gov|edu|io)\b/i;

/** How much of a word to bold: short words get one letter, longer words get the first half. */
function boldLength(word: string): number {
  if (word.length <= 3) return 1;
  return Math.ceil(word.length / 2);
}

/**
 * Split a word into its bold lead and normal remainder, ignoring leading punctuation
 * ("(quarterly" bolds from the q, not the bracket).
 */
function splitWord(token: string): BionicSegment {
  const firstLetter = token.search(HAS_LETTER);
  if (firstLetter === -1) return { lead: "", rest: token };

  const core = token.slice(firstLetter).match(/^[\p{L}\p{M}'’-]+/u)?.[0] ?? "";
  if (!core) return { lead: "", rest: token };

  return {
    lead: token.slice(0, firstLetter + boldLength(core)),
    rest: token.slice(firstLetter + boldLength(core))
  };
}

/**
 * Turn text into bionic segments. Whitespace is preserved as its own segment so the caller can
 * join segments back into the original string exactly.
 */
export function toBionicSegments(text: string): BionicSegment[] {
  if (!text) return [];

  return text
    .split(/(\s+)/)
    .filter((token) => token.length > 0)
    .map((token) => {
      if (/^\s+$/.test(token)) return { lead: "", rest: token };
      if (!HAS_LETTER.test(token) || OPAQUE_TOKEN.test(token)) return { lead: "", rest: token };
      return splitWord(token);
    });
}
