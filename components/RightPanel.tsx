"use client";

import ReadingView from "@/components/ReadingView";
import type { TransformRequest, TransformSuccess } from "@/lib/types";

interface RightPanelProps {
  result: TransformSuccess | null;
  busy: boolean;
  source: TransformRequest | null;
}

/** The accessible half of the split screen. The reading view owns the Mode framework. */
export default function RightPanel({ result, busy, source }: RightPanelProps) {
  return (
    <div className="panel panel-readeasy">
      <h2>ReadEasy version</h2>
      {busy && <p className="placeholder">Restructuring…</p>}
      {!busy && !result && <p className="placeholder">The accessible version will appear here.</p>}
      {!busy && result && <ReadingView restructured={result.restructured} source={source} />}
    </div>
  );
}
