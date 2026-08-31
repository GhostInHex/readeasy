"use client";

import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import type { TransformSuccess } from "@/lib/types";

interface SplitViewProps {
  result: TransformSuccess | null;
  busy: boolean;
}

export default function SplitView({ result, busy }: SplitViewProps) {
  return (
    <section className="split" aria-label="Original page and ReadEasy version">
      <LeftPanel result={result} busy={busy} />
      <RightPanel result={result} busy={busy} />
    </section>
  );
}
