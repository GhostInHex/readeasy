"use client";

import { useEffect, useState } from "react";
import type { ModeProps } from "@/components/modes/types";
import type { Urgency } from "@/lib/types";

const URGENCY_ORDER: Record<Urgency, number> = { high: 0, medium: 1, low: 2 };

const URGENCY_LABEL: Record<Urgency, string> = {
  high: "Do this",
  medium: "Should do",
  low: "Optional"
};

/**
 * Action mode: the page reduced to what the reader has to do. Every action item becomes one
 * checkbox with an urgency badge, deadlines called out, sorted most urgent first. Ticking an item
 * is page state only — nothing is stored or sent anywhere.
 */
export default function ActionMode({ restructured }: ModeProps) {
  const items = [...restructured.actionItems].sort(
    (left, right) => URGENCY_ORDER[left.urgency] - URGENCY_ORDER[right.urgency]
  );
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));

  // A new transform brings new actions, so the ticks start clean.
  useEffect(() => {
    setDone(restructured.actionItems.map(() => false));
  }, [restructured]);

  if (!items.length) {
    return (
      <p className="placeholder">
        This page asks nothing of you — there are no deadlines or steps to act on. Try Focus mode to
        read it.
      </p>
    );
  }

  const doneCount = done.filter(Boolean).length;

  return (
    <div className="mode-action">
      <p className="action-count" aria-live="polite">
        {doneCount} of {items.length} done
      </p>

      <ul className="action-list">
        {items.map((item, index) => {
          const checked = done[index] ?? false;
          const id = `action-${index}`;

          return (
            <li key={index} className={checked ? "action-item action-done" : "action-item"}>
              <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(event) =>
                  setDone((previous) =>
                    previous.map((value, position) => (position === index ? event.target.checked : value))
                  )
                }
              />
              <div className="action-text">
                <label htmlFor={id}>{item.task}</label>
                <p className="action-meta">
                  <span className={`badge badge-${item.urgency}`}>{URGENCY_LABEL[item.urgency]}</span>
                  {item.deadline && <span className="deadline-chip">By {item.deadline}</span>}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
