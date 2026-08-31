"use client";

import type { TransformSuccess } from "@/lib/types";

interface RightPanelProps {
  result: TransformSuccess | null;
  busy: boolean;
}

/**
 * Right panel: the accessible view. Ticket 04 renders the real restructured JSON and
 * ticket 05 adds the Mode bar; for now it is the placeholder half of the split screen.
 */
export default function RightPanel({ result, busy }: RightPanelProps) {
  return (
    <div className="panel panel-readeasy">
      <h2>ReadEasy version</h2>
      {busy && <p className="placeholder">Restructuring…</p>}
      {!busy && !result && <p className="placeholder">The accessible version will appear here.</p>}
      {!busy && result && (
        <article className="reading">
          <h3>{result.restructured.title}</h3>
          <p className="summary">{result.restructured.summary}</p>
          <p className="reading-time">{result.restructured.readingTimeMinutes} min read</p>
          {result.restructured.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`} className="section">
              <h4>{section.heading}</h4>
              <p>{section.simplifiedText}</p>
              <p className="takeaway">
                <strong>Key takeaway:</strong> {section.keyTakeaway}
              </p>
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
