"use client";

import { useState } from "react";
import ModeBar from "@/components/ModeBar";
import ReadingToolbar from "@/components/ReadingToolbar";
import { DEFAULT_MODE_ID, findMode } from "@/components/modes/registry";
import { useReadingPreferences } from "@/components/useReadingPreferences";
import { preferenceAttributes } from "@/lib/preferences";
import type { Restructured, TransformRequest } from "@/lib/types";

interface ReadingViewProps {
  restructured: Restructured;
  source: TransformRequest | null;
}

/**
 * The reading view: cosmetic toggles, shared header (title, summary, reading time), the Mode bar,
 * and whichever Mode renderer is active. Modes never own the header, so switching Mode never loses
 * context, and the preference data attributes sit on this one element so every Mode inherits them.
 */
export default function ReadingView({ restructured, source }: ReadingViewProps) {
  const [modeId, setModeId] = useState<string>(DEFAULT_MODE_ID);
  const [preferences, updatePreferences] = useReadingPreferences();
  const mode = findMode(modeId);
  const Renderer = mode.Renderer;

  return (
    <div className="reading" {...preferenceAttributes(preferences)}>
      <ReadingToolbar preferences={preferences} onChange={updatePreferences} />

      <h3>{restructured.title}</h3>
      <p className="summary">{restructured.summary}</p>
      <p className="reading-time">{restructured.readingTimeMinutes} min read</p>

      <ModeBar activeId={mode.id} onSelect={setModeId} />
      <p className="mode-description">{mode.description}</p>

      <div className="mode-body" role="tabpanel" aria-label={`${mode.label} mode`}>
        <Renderer restructured={restructured} source={source} />
      </div>
    </div>
  );
}
