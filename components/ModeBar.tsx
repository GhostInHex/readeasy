"use client";

import { MODES } from "@/components/modes/registry";

interface ModeBarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * The Mode switcher. It renders whatever the registry contains — never a hard-coded list.
 *
 * One segmented control rather than five separate pills: the Modes are five views of the same page,
 * so they read as one choice with five settings. Each option carries its own description as a title,
 * which is the same line the reading panel prints under the heading once the Mode is on.
 */
export default function ModeBar({ activeId, onSelect }: ModeBarProps) {
  return (
    <div className="mode-switch" role="tablist" aria-label="Reading modes">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          title={mode.description}
          aria-selected={mode.id === activeId}
          className={mode.id === activeId ? "mode-option mode-option-active" : "mode-option"}
          onClick={() => onSelect(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
