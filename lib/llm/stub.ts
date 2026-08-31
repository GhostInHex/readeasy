import type { LlmClient, RestructureInput } from "@/lib/llm/types";
import type { ActionItem, Restructured, Section, Urgency } from "@/lib/types";
import { estimateReadingTimeMinutes, firstSentences } from "@/lib/text";

const DEADLINE_PATTERN =
  /\b(?:by|before|no later than|due|on or before)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4}|the\s+\w+\s+deadline)/i;

const ACTION_PATTERN = /\b(must|need to|should|apply|submit|file|complete|bring|register|report)\b/i;

function urgencyFor(sentence: string): Urgency {
  if (/\bmust\b|\brequired\b|\bdeadline\b|\bno later than\b/i.test(sentence)) return "high";
  if (/\bshould\b|\brecommend/i.test(sentence)) return "medium";
  return "low";
}

function toSentences(text: string): string[] {
  return (text.replace(/\n+/g, " ").match(/[^.!?]+[.!?]+/g) ?? []).map((sentence) => sentence.trim());
}

function buildActionItems(text: string): ActionItem[] {
  const items: ActionItem[] = [];
  for (const sentence of toSentences(text)) {
    if (items.length >= 4) break;
    if (sentence.length > 220 || !ACTION_PATTERN.test(sentence)) continue;
    const deadline = sentence.match(DEADLINE_PATTERN)?.[1];
    items.push({
      task: sentence,
      urgency: urgencyFor(sentence),
      ...(deadline ? { deadline } : {})
    });
  }
  return items;
}

function buildSections(text: string): Section[] {
  const paragraphs = text.split("\n\n").filter((paragraph) => paragraph.length > 80);
  const chunkSize = Math.max(1, Math.ceil(paragraphs.length / 4));
  const sections: Section[] = [];

  for (let index = 0; index < paragraphs.length && sections.length < 4; index += chunkSize) {
    const chunk = paragraphs.slice(index, index + chunkSize).join("\n\n");
    sections.push({
      heading: `Part ${sections.length + 1}`,
      simplifiedText: chunk.slice(0, 900),
      keyTakeaway: firstSentences(chunk, 1)
    });
  }

  if (!sections.length) {
    sections.push({
      heading: "The page",
      simplifiedText: text.slice(0, 900),
      keyTakeaway: firstSentences(text, 1)
    });
  }

  return sections;
}

/**
 * The canned Restructure stub. It performs no AI work: it reflows the cleaned text so the
 * response contract and every Mode renderer can be exercised without a network call. Used
 * by tests, and as the fallback when no OpenRouter key is configured.
 */
export function createStubLlmClient(): LlmClient {
  return {
    name: "stub",
    async complete(input: RestructureInput): Promise<string> {
      const stub: Restructured = {
        title: input.title || firstSentences(input.text, 1).slice(0, 80) || "Untitled page",
        summary: firstSentences(input.text, 2),
        readingTimeMinutes: estimateReadingTimeMinutes(input.text),
        actionItems: buildActionItems(input.text),
        sections: buildSections(input.text)
      };
      return JSON.stringify(stub);
    }
  };
}
