"use client";

import { useEffect, useState } from "react";
import { matchCachedPage } from "@/lib/fixtures";
import type { TransformSuccess } from "@/lib/types";

interface LeftPanelProps {
  result: TransformSuccess | null;
  busy: boolean;
}

/**
 * Left panel rule: the default view is the cleaned original text, rendered in a
 * deliberately plain style so a reader can verify nothing was invented or dropped.
 *
 * A Cached page is the one exception — for the Demo trio we already have a screenshot of the
 * real, cluttered page, and showing it makes the "before" honest in a way plain text cannot. The
 * cleaned text stays one click away, and if the image is missing the panel silently falls back to
 * it rather than showing a broken picture.
 */
export default function LeftPanel({ result, busy }: LeftPanelProps) {
  const cached = result ? matchCachedPage(result.sourceUrl) : null;
  const [shotFailed, setShotFailed] = useState(false);
  const [preferText, setPreferText] = useState(false);

  useEffect(() => {
    setShotFailed(false);
    setPreferText(false);
  }, [result]);

  const showShot = cached !== null && !shotFailed && !preferText;

  return (
    <div className="panel panel-original">
      <h2>Original page</h2>
      {busy && <p className="placeholder">Cleaning the page…</p>}
      {!busy && !result && <p className="placeholder">The cleaned original text will appear here.</p>}

      {!busy && result && showShot && cached && (
        <figure className="original-shot">
          <img
            src={cached.screenshot}
            alt={`The original page as published: ${cached.label}`}
            onError={() => setShotFailed(true)}
          />
          <figcaption>
            The page as published.{" "}
            <button type="button" className="link" onClick={() => setPreferText(true)}>
              Show the cleaned text
            </button>
          </figcaption>
        </figure>
      )}

      {!busy && result && !showShot && (
        <>
          <pre className="original-text">{result.cleanedOriginal}</pre>
          {cached && !shotFailed && (
            <p className="shot-switch">
              <button type="button" className="link" onClick={() => setPreferText(false)}>
                Show the original page
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
