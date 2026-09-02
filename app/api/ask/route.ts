import { NextResponse } from "next/server";
import { resolveAskDeps, runAsk } from "@/lib/ask";
import type { AskRequest, AskResponse } from "@/lib/ask";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The Ask boundary: `{question}` plus a page — `slug`, `url`, or the page's cleaned `rawText` — in,
 * `{answer, source}` out, `{error:{code,message,hint}}` on any failure. A Cached page's suggested
 * questions are answered from the bundle, so this route needs neither a key nor a network for them.
 */
export async function POST(request: Request): Promise<NextResponse<AskResponse>> {
  let body: AskRequest;
  try {
    body = (await request.json()) as AskRequest;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "The request body was not valid JSON.",
          hint: 'Send {"question": "…"} with the page\'s "url", "slug", or "rawText".'
        }
      },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await runAsk(body, resolveAskDeps()));
  } catch (error) {
    const { status, body: errorBody } = toErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
