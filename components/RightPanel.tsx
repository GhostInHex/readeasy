"use client";

import AskPanel from "@/components/AskPanel";
import ReadingToolbar from "@/components/ReadingToolbar";
import ReadingView from "@/components/ReadingView";
import type { TransformRequest, TransformSuccess } from "@/lib/types";

interface RightPanelProps {
  result: TransformSuccess | null;
  busy: boolean;
  source: TransformRequest | null;
  modeId: string;
}

/** The accessible half of the split screen. The reading view owns the Mode framework. */
export default function RightPanel({ result, busy, source, modeId }: RightPanelProps) {
  return (
    <div className="panel panel-readeasy">
      <div className="panel-head">
        <h2>ReadEasy version</h2>
        {!busy && result && <ReadingToolbar />}
      </div>

      {busy && <p className="placeholder">Restructuring…</p>}
      {!busy && !result && <p className="placeholder">The accessible version will appear here.</p>}

      {!busy && result && (
        <>
          <ReadingView
            restructured={result.restructured}
            source={source}
            cleanedOriginal={result.cleanedOriginal}
            modeId={modeId}
          />
          <AskPanel
            cleanedOriginal={result.cleanedOriginal}
            sourceUrl={result.sourceUrl}
            title={result.restructured.title}
          />
        </>
      )}
    </div>
  );
}
