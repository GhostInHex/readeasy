"use client";

import type { ActionItem, TransformSuccess } from "@/lib/types";

interface RightPanelProps {
  result: TransformSuccess | null;
  busy: boolean;
}

function paragraphsOf(text: string): string[] {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function UrgencyBadge({ urgency }: { urgency: ActionItem["urgency"] }) {
  return <span className={`badge badge-${urgency}`}>{urgency}</span>;
}

/**
 * The accessible view: the restructured JSON, rendered plainly. Ticket 05 puts the Mode bar
 * above this and moves the section rendering into the Focus/Dyslexia/Action/Listen renderers.
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

          {result.restructured.actionItems.length > 0 && (
            <section className="actions-preview" aria-label="What you need to do">
              <h4>What you need to do</h4>
              <ul>
                {result.restructured.actionItems.map((item, index) => (
                  <li key={`${item.task}-${index}`}>
                    <UrgencyBadge urgency={item.urgency} />
                    <span>{item.task}</span>
                    {item.deadline && <strong className="deadline"> {item.deadline}</strong>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.restructured.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`} className="section">
              <h4>{section.heading}</h4>
              {paragraphsOf(section.simplifiedText).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
              {section.keyTakeaway && (
                <p className="takeaway">
                  <strong>Key takeaway:</strong> {section.keyTakeaway}
                </p>
              )}
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
