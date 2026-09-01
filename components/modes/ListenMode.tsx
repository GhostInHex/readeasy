"use client";

import { useEffect, useState } from "react";
import type { ModeProps } from "@/components/modes/types";
import type { Restructured } from "@/lib/types";

/** The browser's voice, or null where there is none. Checked by object, not by key: some
 * environments define `speechSynthesis` as undefined rather than leaving it out. */
function voice(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

/** What gets read, in order: the title, then each section's heading and simplified text. */
function passagesOf(restructured: Restructured): string[] {
  return [
    restructured.title,
    ...restructured.sections.flatMap((section) => [section.heading, section.simplifiedText])
  ]
    .map((passage) => passage.trim())
    .filter(Boolean);
}

/**
 * Listen mode: the page read aloud by the browser's own speech synthesis. Deliberately plain —
 * play, stop, and a note about which passage is being read. No sentence highlighting.
 */
export default function ListenMode({ restructured }: ModeProps) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [passageIndex, setPassageIndex] = useState(0);

  // speechSynthesis only exists in the browser, so support is settled after mount.
  useEffect(() => {
    setSupported(voice() !== null);
  }, []);

  // Leaving the mode, or a new transform, must never leave a voice talking over the next page.
  useEffect(() => {
    return () => voice()?.cancel();
  }, []);

  useEffect(() => {
    voice()?.cancel();
    setSpeaking(false);
    setPassageIndex(0);
  }, [restructured]);

  const passages = passagesOf(restructured);

  function stop() {
    voice()?.cancel();
    setSpeaking(false);
    setPassageIndex(0);
  }

  function play() {
    const synthesis = voice();
    if (!synthesis) return;
    synthesis.cancel();

    passages.forEach((passage, index) => {
      const utterance = new SpeechSynthesisUtterance(passage);
      utterance.rate = 0.95;
      utterance.onstart = () => setPassageIndex(index);
      if (index === passages.length - 1) {
        utterance.onend = () => {
          setSpeaking(false);
          setPassageIndex(0);
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
        {passages.map((passage, index) => (
          <li key={index} className={speaking && index === passageIndex ? "listen-now" : undefined}>
            {passage.length > 90 ? `${passage.slice(0, 90)}…` : passage}
          </li>
        ))}
      </ol>
    </div>
  );
}
