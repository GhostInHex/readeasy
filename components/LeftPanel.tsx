"use client";

import type { TransformSuccess } from "@/lib/types";

interface LeftPanelProps {
  result: TransformSuccess | null;
  busy: boolean;
}

/**
 * Left panel rule: the default view is the cleaned original text, rendered in a
 * deliberately plain style so a reader can verify nothing was invented or dropped.
 */
export default function LeftPanel({ result, busy }: LeftPanelProps) {
  return (
    <div className="panel panel-original">
      <h2>Original page</h2>
      {busy && <p className="placeholder">Cleaning the page…</p>}
      {!busy && !result && <p className="placeholder">The cleaned original text will appear here.</p>}
      {!busy && result && <pre className="original-text">{result.cleanedOriginal}</pre>}
    </div>
  );
}
