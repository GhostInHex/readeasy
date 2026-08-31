import { NextResponse } from "next/server";
import type { TransformRequest, TransformResponse } from "@/lib/types";

/**
 * Ticket 01 scaffold: the route exists, owns the pipeline boundary, and returns a
 * stub response shaped exactly like the final contract. Ticket 03 replaces the body
 * with real Cleaning; ticket 04 replaces the stub Restructure with OpenRouter.
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
          hint: "Send {\"url\": \"...\"} or {\"rawText\": \"...\"}."
        }
      },
      { status: 400 }
    );
  }

  const url = body.url?.trim();
  const rawText = body.rawText?.trim();

  if (!url && !rawText) {
    return NextResponse.json(
      {
        error: {
          code: "empty_input",
          message: "Add a page URL, or paste the page text instead.",
          hint: "Some sites block automated fetching. Use the Raw text tab and paste the page content."
        }
      },
      { status: 400 }
    );
  }

  const cleanedOriginal = rawText ?? `Cleaned text for ${url} will appear here.`;

  return NextResponse.json({
    cleanedOriginal,
    sourceUrl: url,
    restructured: {
      title: "Stub transform",
      summary: "The pipeline is wired end to end. Real cleaning and restructuring arrive in tickets 03 and 04.",
      readingTimeMinutes: 1,
      actionItems: [],
      sections: [
        {
          heading: "Placeholder section",
          simplifiedText: cleanedOriginal.slice(0, 400),
          keyTakeaway: "This is a stub response from the transform route."
        }
      ]
    }
  });
}
