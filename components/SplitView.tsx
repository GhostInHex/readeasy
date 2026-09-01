"use client";

import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import type { TransformRequest, TransformSuccess } from "@/lib/types";

interface SplitViewProps {
  result: TransformSuccess | null;
  busy: boolean;
  source: TransformRequest | null;
}

export default function SplitView({ result, busy, source }: SplitViewProps) {
  return (
    <section className="split" aria-label="Original page and ReadEasy version">
      <LeftPanel result={result} busy={busy} />
      <RightPanel result={result} busy={busy} source={source} />
    </section>
  );
}
