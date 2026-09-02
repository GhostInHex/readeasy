"use client";

import { useEffect, useState } from "react";
import {
  describeVisit,
  entryKey,
  forgetEntry,
  hostLabel,
  readHistory,
  recordVisit,
  visitRequest,
  type HistoryEntry
} from "@/lib/history";
import type { TransformRequest } from "@/lib/types";
import styles from "./HistoryList.module.css";

interface HistoryListProps {
  /** Re-runs the Transform for the entry the reader picked. */
  onOpen: (request: TransformRequest) => void;
  busy: boolean;
  /** Bumped by the input card whenever it records a visit, so the list re-reads storage. */
  changeCount: number;
}

/**
 * Recent pages, for one click back to something already transformed.
 *
 * Nothing renders until after mount: the list lives in the reader's own browser, so the server has
 * nothing to say about it, and the first client render has to match the server's empty markup. With
 * an empty history the whole section stays away rather than showing an empty box — a reader who has
 * transformed nothing yet is being invited to use the box above, not told a list is missing.
 */
export default function HistoryList({ onOpen, busy, changeCount }: HistoryListProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(readHistory(window.localStorage));
  }, [changeCount]);

  function reopen(entry: HistoryEntry) {
    onOpen(visitRequest(entry));
    // Coming back to a page is a fresh visit, so it becomes the newest entry rather than sinking.
    setEntries(recordVisit(window.localStorage, { ...entry, timestamp: Date.now() }));
  }

  if (!entries.length) {
    return null;
  }

  return (
    <section className={styles.history} aria-labelledby="history-heading">
      <h2 id="history-heading" className={styles.heading}>
        Your recent pages
      </h2>
      <p className={styles.note}>Kept on this device only. Nothing about what you read leaves your browser.</p>

      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entryKey(entry)} className={styles.row}>
            <button type="button" className={styles.open} onClick={() => reopen(entry)} disabled={busy}>
              <span className={styles.title}>{entry.title}</span>
              <span className={styles.meta}>
                {hostLabel(entry.url)} · {describeVisit(entry.timestamp)}
              </span>
            </button>

            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${entry.title} from your recent pages`}
              onClick={() => setEntries(forgetEntry(window.localStorage, entryKey(entry)))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
