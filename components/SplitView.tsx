"use client";

import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import type { TransformRequest, TransformSuccess } from "@/lib/types";

interface SplitViewProps {
  result: TransformSuccess | null;
  busy: boolean;
  source: TransformRequest | null;
  modeId: string;
}

/**
 * The before/after split: original on the left, ReadEasy on the right. This skeleton is the product's
 * whole claim, so it survives every redesign — on a phone the two sides stack rather than reflow into
 * something else, with the original folded down to a strip a reader opens when they want to check.
 */
export default function SplitView({ result, busy, source, modeId }: SplitViewProps) {
  return (
    <section className="split" aria-label="Original page and ReadEasy version">
      <LeftPanel result={result} busy={busy} />
      <RightPanel result={result} busy={busy} source={source} modeId={modeId} />
    </section>
  );
}
