import { TransformFailure } from "@/lib/errors";
import type { ActionItem, Restructured, Section, Urgency } from "@/lib/types";

const URGENCIES: Urgency[] = ["high", "medium", "low"];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function invalid(detail: string): never {
  throw new TransformFailure({
    code: "invalid_restructure",
    message: "The restructured version came back in an unexpected shape.",
    hint: `Try Transform again. (${detail})`
  });
}

function validateSection(value: unknown, index: number): Section {
  if (typeof value !== "object" || value === null) invalid(`section ${index} is not an object`);
  const record = value as Record<string, unknown>;
  const heading = asString(record.heading);
  const simplifiedText = asString(record.simplifiedText);
  if (!simplifiedText) invalid(`section ${index} has no simplifiedText`);
  return {
    heading: heading || `Part ${index + 1}`,
    simplifiedText,
    keyTakeaway: asString(record.keyTakeaway)
  };
}

function validateActionItem(value: unknown, index: number): ActionItem | null {
  if (typeof value !== "object" || value === null) invalid(`actionItem ${index} is not an object`);
  const record = value as Record<string, unknown>;
  const task = asString(record.task);
  if (!task) return null;
  const rawUrgency = asString(record.urgency).toLowerCase() as Urgency;
  const deadline = asString(record.deadline);
  return {
    task,
    urgency: URGENCIES.includes(rawUrgency) ? rawUrgency : "medium",
    ...(deadline ? { deadline } : {})
  };
}

/**
 * Validate the Restructure output against the strict schema:
 * `{title, summary, readingTimeMinutes, actionItems[{task, urgency, deadline?}],
 *   sections[{heading, simplifiedText, keyTakeaway}]}`
 *
 * Every Mode renders from this object, so anything missing fails here rather than in the UI.
 */
export function validateRestructured(value: unknown): Restructured {
  if (typeof value !== "object" || value === null) invalid("response was not an object");
  const record = value as Record<string, unknown>;

  const title = asString(record.title);
  const summary = asString(record.summary);
  if (!title) invalid("missing title");
  if (!summary) invalid("missing summary");

  if (!Array.isArray(record.sections)) invalid("sections is not an array");
  const sections = record.sections.map(validateSection);
  if (!sections.length) invalid("sections is empty");

  if (record.actionItems !== undefined && !Array.isArray(record.actionItems)) {
    invalid("actionItems is not an array");
  }
  const actionItems = (Array.isArray(record.actionItems) ? record.actionItems : [])
    .map(validateActionItem)
    .filter((item): item is ActionItem => item !== null);

  const rawMinutes = Number(record.readingTimeMinutes);
  const readingTimeMinutes = Number.isFinite(rawMinutes) && rawMinutes > 0 ? Math.round(rawMinutes) : 1;

  return { title, summary, readingTimeMinutes, actionItems, sections };
}

/** Extract the JSON object from a model response that may be fenced or prefixed with prose. */
export function parseRestructureJson(raw: string): unknown {
  const withoutFences = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch {
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(withoutFences.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    invalid("response was not valid JSON");
  }
}
