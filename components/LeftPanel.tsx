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
 *
 * On a phone the two sides cannot sit next to each other, and a reader who came here to read does not
 * want to scroll the whole cluttered original first. So the "before" starts as a strip: enough of the
 * real page to see what was wrong with it, and a control to open the rest. `data-open` is set on the
 * panel at every width, but only the mobile breakpoint acts on it — which is why the fold needs no
 * media query in JavaScript and cannot flash open on load.
 */
export default function LeftPanel({ result, busy }: LeftPanelProps) {
  const cached = result ? matchCachedPage(result.sourceUrl) : null;
  const [shotFailed, setShotFailed] = useState(false);
  const [preferText, setPreferText] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setShotFailed(false);
    setPreferText(false);
    setOpen(false);
  }, [result]);

  const showShot = cached !== null && !shotFailed && !preferText;

  return (
    <div className="panel panel-original" data-open={open ? "true" : "false"}>
      <div className="panel-head">
        <h2>Original page</h2>
        {!busy && result && (
          <button
            type="button"
            className="chip original-fold"
            aria-expanded={open}
            aria-controls="original-body"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            {open ? "Fold away" : "Open the original"}
          </button>
        )}
      </div>

      <div className="original-body" id="original-body">
        {busy && <p className="placeholder">Cleaning the page…</p>}
        {!busy && !result && <p className="placeholder">The cleaned original text will appear here.</p>}

        {!busy && result && showShot && cached && (
          <figure className="original-shot">
            <img
              src={cached.screenshot}
              alt={`The original page as published: ${cached.label}`}
              loading="lazy"
              decoding="async"
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
    </div>
  );
}
