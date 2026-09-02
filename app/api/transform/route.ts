import { NextResponse } from "next/server";
import { loadCachedTransform } from "@/lib/cached-transform";
import { resolveTransformDeps } from "@/lib/deps";
import { toErrorResponse, TransformFailure } from "@/lib/errors";
import { withReadingLevel } from "@/lib/restructure";
import { runTransform } from "@/lib/transform";
import { DEFAULT_READING_LEVEL, isReadingLevel } from "@/lib/types";
import type { TransformRequest, TransformResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The single pipeline boundary: `{url}` or `{rawText}` in, `{cleanedOriginal, restructured}`
 * out, `{error:{code,message,hint}}` on any failure.
 *
 * `level` picks the reading level. A Demo trio page with a bundled variant for that level is served
 * straight from the bundle, so switching level in the recorded demo needs neither the network nor a
 * key; everything else is restructured live with the level folded into the prompt.
 */
export async function POST(request: Request): Promise<NextResponse<TransformResponse>> {
  let body: TransformRequest;
  try {
    body = (await request.json()) as TransformRequest;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "The request body was not valid JSON.",
          hint: 'Send {"url": "https://…"} or {"rawText": "…"}.'
        }
      },
      { status: 400 }
    );
  }

  try {
    const level = body.level ?? DEFAULT_READING_LEVEL;
    if (!isReadingLevel(level)) {
      throw new TransformFailure({
        code: "invalid_level",
        message: "ReadEasy does not have that reading level.",
        hint: 'Ask for the standard level or the simpler one: {"level": "standard"} or {"level": "simpler"}.',
        status: 400
      });
    }

    // Pasted text wins over a URL in the pipeline, so it has to win over the bundle too — otherwise
    // pasting your own text about a cached page would quietly hand back the cached page.
    const cached = body.rawText?.trim() ? null : loadCachedTransform(body.url, level);
    if (cached) {
      return NextResponse.json(cached);
    }

    const deps = resolveTransformDeps();
    const result = await runTransform(body, { ...deps, llm: withReadingLevel(deps.llm, level) });
    return NextResponse.json({ ...result, level });
  } catch (error) {
    const { status, body: errorBody } = toErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
