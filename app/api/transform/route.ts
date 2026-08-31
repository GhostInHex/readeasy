import { NextResponse } from "next/server";
import { resolveTransformDeps } from "@/lib/deps";
import { toErrorResponse } from "@/lib/errors";
import { runTransform } from "@/lib/transform";
import type { TransformRequest, TransformResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The single pipeline boundary: `{url}` or `{rawText}` in, `{cleanedOriginal, restructured}`
 * out, `{error:{code,message,hint}}` on any failure.
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
    return NextResponse.json(await runTransform(body, resolveTransformDeps()));
  } catch (error) {
    const { status, body: errorBody } = toErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
