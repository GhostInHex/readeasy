"use client";

import { useEffect, useRef, useState } from "react";
import type { ModeProps } from "@/components/modes/types";
import { spokenWordAt, toSpokenPassages } from "@/lib/speech";

/**
 * The karaoke highlight. It lives here rather than in a stylesheet for two reasons: `globals.css`
 * belongs to another ticket, and a CSS-module import from this file would break the test suite,
 * which loads the Mode registry — and so this component — with no CSS loader. React hoists a
 * `<style>` carrying a `precedence` into the document head and de-duplicates it by `href`, so the
 * rule lands once no matter how often the Mode is mounted.
 *
 * The rule's one job is to move without moving the text: no padding, no weight change, no border.
 * The breathing room around the word is a box-shadow spread, which paints outside the box without
 * taking up space, and the underline is a text decoration, which does not reflow either — so the
 * mark glides along a line that stays perfectly still. Colours come from `app/tokens.css` with
 * literal fallbacks; `--ink` on `--accent-soft` is a pairing tokens.css verifies for contrast in
 * both themes, and the underline is a second cue for a reader who does not see the wash.
 */
const HIGHLIGHT = `
.listen-word {
  background: var(--accent-soft, #e3e9f0);
  color: var(--ink, #231e19);
  border-radius: var(--radius-sm, 0.5rem);
  box-shadow: 0 0 0 0.15em var(--accent-soft, #e3e9f0);
  text-decoration-line: underline;
  text-decoration-color: var(--accent, #22406a);
  text-decoration-thickness: 0.09em;
  text-underline-offset: 0.16em;
}
`;

/** The browser's voice, or null where there is none. Checked by object, not by key: some
 * environments define `speechSynthesis` as undefined rather than leaving it out. */
function voice(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

/**
 * Whether this browser can say where it is in a word as it speaks. Chrome and Edge can; where the
 * event does not exist, Listen still reads the page aloud and simply never marks a word.
 */
function reportsWordBoundaries(): boolean {
  if (typeof window === "undefined" || typeof SpeechSynthesisUtterance === "undefined") return false;
  return "onboundary" in SpeechSynthesisUtterance.prototype;
}

/**
 * Listen mode: the page read aloud by the browser's own speech synthesis, with the word being
 * spoken highlighted as it goes — the page as a score, the voice as the cursor.
 *
 * The highlight is driven by real `boundary` events, never by a timer, so it cannot drift out of
 * sync with the voice: no event, no mark. That is also the whole fallback story for browsers that
 * do not report boundaries — they get exactly the Listen mode that shipped before this.
 */
export default function ListenMode({ restructured }: ModeProps) {
  const [supported, setSupported] = useState(true);
  const [followsWords, setFollowsWords] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [passageIndex, setPassageIndex] = useState(0);
  /** Where the voice is inside the current passage, or null when no word is lit. */
  const [charIndex, setCharIndex] = useState<number | null>(null);
  const highlight = useRef<HTMLElement>(null);

  // speechSynthesis only exists in the browser, so support is settled after mount.
  useEffect(() => {
    setSupported(voice() !== null);
    setFollowsWords(reportsWordBoundaries());
  }, []);

  // Leaving the mode, or a new transform, must never leave a voice talking over the next page.
  useEffect(() => {
    return () => voice()?.cancel();
  }, []);

  useEffect(() => {
    voice()?.cancel();
    setSpeaking(false);
    setPassageIndex(0);
    setCharIndex(null);
  }, [restructured]);

  // Keep the moving word on screen. `nearest` scrolls as little as it can, and does nothing at all
  // while the word is already in view, so the page only moves when the reader would lose the mark.
  useEffect(() => {
    highlight.current?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [passageIndex, charIndex]);

  const passages = toSpokenPassages(restructured);

  function stop() {
    voice()?.cancel();
    setSpeaking(false);
    setPassageIndex(0);
    setCharIndex(null);
  }

  function play() {
    const synthesis = voice();
    if (!synthesis) return;
    synthesis.cancel();

    passages.forEach((passage, index) => {
      const utterance = new SpeechSynthesisUtterance(passage);
      utterance.rate = 0.95;
      utterance.onstart = () => {
        setPassageIndex(index);
        setCharIndex(null);
      };
      // Some engines report sentence boundaries alongside word ones; a sentence's index would drag
      // the mark back to the start of the sentence, so only words move it. The passage is set here
      // as well as in `onstart`, so an engine that skips `onstart` still highlights.
      utterance.onboundary = (event) => {
        if (event.name && event.name !== "word") return;
        setPassageIndex(index);
        setCharIndex(event.charIndex);
      };
      if (index === passages.length - 1) {
        utterance.onend = () => {
          setSpeaking(false);
          setPassageIndex(0);
          setCharIndex(null);
        };
      }
      synthesis.speak(utterance);
    });

    setSpeaking(true);
  }

  if (!supported) {
    return (
      <div className="coming-soon" role="status">
        <p>This browser cannot read pages aloud.</p>
        <p>
          Listen mode needs built-in speech synthesis. Chrome, Edge and Safari have it — or use Focus
          mode to read the page yourself.
        </p>
      </div>
    );
  }

  if (!passages.length) {
    return <p className="placeholder">There is nothing to read aloud on this page.</p>;
  }

  return (
    <div className="mode-listen">
      <style href="readeasy-listen-word" precedence="default">
        {HIGHLIGHT}
      </style>

      <div className="listen-controls">
        <button type="button" className="primary" onClick={play} disabled={speaking}>
          ▶ Play
        </button>
        <button type="button" className="secondary" onClick={stop} disabled={!speaking}>
          ■ Stop
        </button>
      </div>

      <p className="listen-status" aria-live="polite">
        {speaking ? `Reading part ${passageIndex + 1} of ${passages.length}` : "Ready to read this page aloud."}
      </p>

      <ol className="listen-outline">
        {passages.map((passage, index) => {
          const reading = speaking && index === passageIndex;
          const spoken = reading && charIndex !== null ? spokenWordAt(passage, charIndex) : null;

          return (
            <li key={index} className={reading ? "listen-now" : undefined}>
              {spoken?.word ? (
                <>
                  {spoken.before}
                  <mark ref={highlight} className="listen-word">
                    {spoken.word}
                  </mark>
                  {spoken.after}
                </>
              ) : (
                passage
              )}
            </li>
          );
        })}
      </ol>

      {!followsWords && (
        <p className="hint">This browser reads the page aloud, but cannot mark each word as it goes.</p>
      )}
    </div>
  );
}
