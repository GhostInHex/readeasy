"use client";

import AskPanel from "@/components/AskPanel";
import ReadabilityBadge from "@/components/ReadabilityBadge";
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
      {!busy && result && (
        <ReadabilityBadge cleanedOriginal={result.cleanedOriginal} restructured={result.restructured} />
      )}
      {busy && <p className="placeholder">Restructuring…</p>}
      {!busy && !result && <p className="placeholder">The accessible version will appear here.</p>}
      {!busy && result && <ReadingView restructured={result.restructured} source={source} />}
      {!busy && result && (
        <AskPanel
          cleanedOriginal={result.cleanedOriginal}
          sourceUrl={result.sourceUrl}
          title={result.restructured.title}
        />
      )}
    </div>
  );
}
