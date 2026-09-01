"use client";

import { useState } from "react";
import InputCard from "@/components/InputCard";
import SplitView from "@/components/SplitView";
import type { TransformRequest, TransformResponse, TransformSuccess } from "@/lib/types";
import { isTransformError } from "@/lib/types";

export default function Workspace() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TransformSuccess | null>(null);
  const [source, setSource] = useState<TransformRequest | null>(null);
  const [error, setError] = useState<{ message: string; hint: string } | null>(null);

  async function transform(request: TransformRequest) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });
      const payload = (await response.json()) as TransformResponse;
      if (isTransformError(payload)) {
        setError({ message: payload.error.message, hint: payload.error.hint });
        setResult(null);
        setSource(null);
      } else {
        setResult(payload);
        setSource(request);
      }
    } catch {
      setError({
        message: "ReadEasy could not reach the transform service.",
        hint: "Check your connection and try again, or paste the page text in the Raw text tab."
      });
      setResult(null);
      setSource(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <InputCard onTransform={transform} busy={busy} />

      {error && (
        <div className="notice notice-error" role="alert">
          <p className="notice-message">{error.message}</p>
          <p className="notice-hint">{error.hint}</p>
        </div>
      )}

      <SplitView result={result} busy={busy} source={source} />
    </>
  );
}
