import type { RestructureInput, RestructureVariant } from "@/lib/llm/types";

/** The exact JSON contract the model must answer with. Mirrored by `validateRestructured`. */
export const RESTRUCTURE_SCHEMA_TEXT = `{
  "title": string,
  "summary": string,                       // two short sentences: what this page is, and who it is for
  "readingTimeMinutes": number,            // whole minutes, at least 1
  "actionItems": [
    { "task": string, "urgency": "high" | "medium" | "low", "deadline"?: string }
  ],
  "sections": [
    { "heading": string, "simplifiedText": string, "keyTakeaway": string }
  ]
}`;

const SHARED_RULES = `Rules you must follow:
- Use ONLY facts, numbers, names, and dates that appear in the provided text. Never add outside knowledge, never guess, never fill gaps. If the text does not say something, leave it out.
- Do not soften or exaggerate requirements. If the text says "must", keep it a must.
- Write in plain language at roughly a US grade 5 reading level: short sentences, everyday words, active voice. Expand jargon the first time it appears, using only the text's own explanation.
- Use person-first, neutral language. No pity, no labels, no praise, no encouragement, no marketing tone.
- Keep every section's simplifiedText faithful to that part of the page. Cover the page in order; do not merge unrelated topics.
- keyTakeaway is one plain sentence a reader could skim on its own.
- actionItems are things the reader has to do, taken from the text. urgency: "high" if the text makes it required or time-bound, "medium" if recommended, "low" if optional. Include "deadline" only when the text states a date or time limit, copied as written.
- If the page asks the reader to do nothing, return an empty actionItems array.
- Answer with JSON only. No prose before or after, no markdown fences.`;

const VARIANT_INSTRUCTIONS: Record<RestructureVariant, string> = {
  default: `Rewrite the page as 3 to 7 sections. Each simplifiedText is one to three short paragraphs.`,
  // Ticket 11 (ADHD mode) replaces this with the micro-card variant.
  adhd: `Rewrite the page as 3 to 7 sections. Each simplifiedText is one to three short paragraphs.`
};

export const SYSTEM_PROMPT = `You are the restructuring step of ReadEasy, an accessibility reader. You reshape text that has already been extracted from a web page so that readers with dyslexia, ADHD, or low vision can use it. You are a rewriter, not an author: every fact in your output must come from the text you are given.`;

export function buildUserPrompt(input: RestructureInput): string {
  return `${VARIANT_INSTRUCTIONS[input.variant]}

${SHARED_RULES}

Return JSON in exactly this shape:
${RESTRUCTURE_SCHEMA_TEXT}

${input.title ? `Page title: ${input.title}\n\n` : ""}Page text:
"""
${input.text}
"""`;
}

/** Appended on the single retry, when the first answer was not usable JSON. */
export const RETRY_NUDGE = `Your previous answer was not valid JSON matching the required shape. Answer again with JSON only — no explanation, no markdown fences — matching this shape exactly:
${RESTRUCTURE_SCHEMA_TEXT}`;
