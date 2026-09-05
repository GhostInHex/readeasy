"use client";

import ReadabilityBadge from "@/components/ReadabilityBadge";
import ReadingLevelPills from "@/components/ReadingLevelPills";
import { findMode } from "@/components/modes/registry";
import { useReadingPreferences } from "@/components/ReadingPreferencesProvider";
import { preferenceAttributes } from "@/lib/preferences";
import type { Restructured, TransformRequest } from "@/lib/types";

interface ReadingViewProps {
  restructured: Restructured;
  source: TransformRequest | null;
  /** The page's own text, for the measured before/after grade level. */
  cleanedOriginal: string;
  /** Chosen in the masthead's reading bar, so it survives scrolling past this panel. */
  modeId: string;
}

/**
 * The reading view: the page's title and summary first, then the facts about this version of it, then
 * whichever Mode renderer is active. Modes never own the heading, so switching Mode never loses
 * context, and the preference data attributes sit on this one element so every Mode inherits them.
 *
 * The order is the point. A reader arriving here wants the page, not the controls that shape it, so
 * the title is the first line and everything adjustable has been lifted to an edge: Mode to the
 * sticky bar above, text size and spacing to the panel's own heading line.
 */
export default function ReadingView({ restructured, source, cleanedOriginal, modeId }: ReadingViewProps) {
  const [preferences] = useReadingPreferences();
  const mode = findMode(modeId);
  const Renderer = mode.Renderer;

  return (
    <div className="reading" {...preferenceAttributes(preferences)}>
      <h3>{restructured.title}</h3>
      <p className="summary">{restructured.summary}</p>

      <div className="reading-meta">
        <ReadabilityBadge cleanedOriginal={cleanedOriginal} restructured={restructured} />
        <p className="reading-time">{restructured.readingTimeMinutes} min read</p>
        <ReadingLevelPills />
      </div>

      <div className="mode-body" role="tabpanel" aria-label={`${mode.label} mode`}>
        <p className="mode-description">{mode.description}</p>
        <Renderer restructured={restructured} source={source} />
      </div>
    </div>
  );
}
