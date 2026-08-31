import type { TransformError } from "@/lib/types";

export const RAW_TEXT_HINT =
  "Some sites block automated fetching. Open the page, copy its text, and paste it into the Raw text tab.";

/**
 * Every failure inside the Transform pipeline is a TransformFailure, so the route can
 * always answer with `{error:{code,message,hint}}` instead of a crash.
 */
export class TransformFailure extends Error {
  readonly code: string;
  readonly hint: string;
  readonly status: number;

  constructor(options: { code: string; message: string; hint?: string; status?: number }) {
    super(options.message);
    this.name = "TransformFailure";
    this.code = options.code;
    this.hint = options.hint ?? RAW_TEXT_HINT;
    this.status = options.status ?? 422;
  }
}

export function toErrorResponse(error: unknown): { status: number; body: TransformError } {
  if (error instanceof TransformFailure) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message, hint: error.hint } }
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "unexpected_error",
        message: "ReadEasy hit an unexpected problem while transforming this page.",
        hint: RAW_TEXT_HINT
      }
    }
  };
}
