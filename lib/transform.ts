import { cleanHtml, cleanRawText } from "@/lib/clean";
import { TransformFailure, RAW_TEXT_HINT } from "@/lib/errors";
import type { LlmClient, RestructureVariant } from "@/lib/llm/types";
import { restructure } from "@/lib/restructure";
import type { TransformRequest, TransformSuccess } from "@/lib/types";

export interface TransformDeps {
  /** Fetches a page's HTML. Injectable so tests never touch the network. */
  fetchHtml: (url: string) => Promise<string>;
  /** The Restructure boundary. */
  llm: LlmClient;
}

/**
 * The whole Transform pipeline: fetch (URL path only) → Clean → Restructure.
 * Every failure inside it is a TransformFailure, so the route always answers with the
 * `{cleanedOriginal, restructured}` contract or `{error:{code,message,hint}}`.
 */
export async function runTransform(request: TransformRequest, deps: TransformDeps): Promise<TransformSuccess> {
  const url = request.url?.trim();
  const rawText = request.rawText?.trim();
  const variant: RestructureVariant = request.variant === "adhd" ? "adhd" : "default";

  if (!url && !rawText) {
    throw new TransformFailure({
      code: "empty_input",
      message: "Add a page URL, or paste the page text instead.",
      hint: RAW_TEXT_HINT,
      status: 400
    });
  }

  // Raw text wins when both are supplied: the user pasted it because fetching failed.
  const cleaned = rawText ? cleanRawText(rawText) : cleanHtml(await deps.fetchHtml(url as string), url);

  const restructured = await restructure(
    { text: cleaned.text, title: cleaned.title, variant },
    deps.llm
  );

  return {
    cleanedOriginal: cleaned.text,
    restructured,
    ...(rawText ? {} : { sourceUrl: url })
  };
}
