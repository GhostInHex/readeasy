"use client";

import ModeBar from "@/components/ModeBar";
import { hostLabel } from "@/lib/history";

interface ReadingBarProps {
  /** The transformed page's own title, so a reader always knows which page they are in. */
  title: string;
  /** Present for URL transforms; absent when the reader pasted their own text. */
  sourceUrl?: string;
  modeId: string;
  onSelectMode: (id: string) => void;
  /** Whether the transform box is currently open below. */
  inputOpen: boolean;
  onToggleInput: () => void;
  busy: boolean;
}

/**
 * The reading bar: which page is open, how it is being read, and the way back to the box that
 * started it.
 *
 * The Mode switcher lives here rather than inside the reading panel for one reason a reader would
 * recognise: choosing a Mode is choosing how to read the whole page, and on a long page the panel's
 * own controls scroll away exactly when a reader decides the current Mode is not working. In the
 * sticky bar it is always one reach away. Lifting it out also gives the panel back its first line —
 * the page's title now sits where the reader looks first, rather than under three rows of chrome.
 */
export default function ReadingBar({
  title,
  sourceUrl,
  modeId,
  onSelectMode,
  inputOpen,
  onToggleInput,
  busy
}: ReadingBarProps) {
  return (
    <div className="readingbar">
      <p className="readingbar-page">
        <span className="readingbar-source">{sourceUrl ? hostLabel(sourceUrl) : "Your pasted text"}</span>
        <span className="readingbar-title">{title}</span>
      </p>

      <ModeBar activeId={modeId} onSelect={onSelectMode} />

      <button
        type="button"
        className="readingbar-change"
        aria-expanded={inputOpen}
        aria-controls="transform-box"
        onClick={onToggleInput}
        disabled={busy}
      >
        {inputOpen ? "Hide the box" : "Read another page"}
      </button>
    </div>
  );
}
