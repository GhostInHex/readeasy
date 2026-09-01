"use client";

import { MODES } from "@/components/modes/registry";

interface ModeBarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

/** The Mode toggle bar. It renders whatever the registry contains — never a hard-coded list. */
export default function ModeBar({ activeId, onSelect }: ModeBarProps) {
  return (
    <div className="mode-bar" role="tablist" aria-label="Reading modes">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={mode.id === activeId}
          className={mode.id === activeId ? "tab tab-active" : "tab"}
          onClick={() => onSelect(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
