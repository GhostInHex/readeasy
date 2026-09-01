"use client";

import { useState } from "react";
import type { ModeProps } from "@/components/modes/types";
import { toBionicSegments } from "@/lib/bionic";

function paragraphsOf(text: string): string[] {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

/** Bolds the leading half of each word. Real <strong> elements, no HTML injection. */
function BionicText({ text }: { text: string }) {
  return (
    <>
      {toBionicSegments(text).map((segment, index) => (
        <span key={index}>
          {segment.lead && <strong>{segment.lead}</strong>}
          {segment.rest}
        </span>
      ))}
    </>
  );
}

function Passage({ text, bionic }: { text: string; bionic: boolean }) {
  return (
    <>
      {paragraphsOf(text).map((paragraph, index) => (
        <p key={index}>{bionic ? <BionicText text={paragraph} /> : paragraph}</p>
      ))}
    </>
  );
}

/**
 * Dyslexia mode: OpenDyslexic, a warm cream page, wide letter and line spacing, and Bionic
 * Reading on by default. Every style is scoped under .mode-dyslexia so leaving the mode restores
 * the normal reading view exactly.
 */
export default function DyslexiaMode({ restructured }: ModeProps) {
  const [bionic, setBionic] = useState(true);

  return (
    <div className="mode-dyslexia">
      <label className="switch">
        <input type="checkbox" checked={bionic} onChange={(event) => setBionic(event.target.checked)} />
        Bold the start of each word
      </label>

      {restructured.sections.map((section, index) => (
        <section className="dyslexia-section" key={index}>
          <h4>{bionic ? <BionicText text={section.heading} /> : section.heading}</h4>
          <Passage text={section.simplifiedText} bionic={bionic} />
          {section.keyTakeaway && (
            <p className="takeaway">
              <strong>Key takeaway:</strong>{" "}
              {bionic ? <BionicText text={section.keyTakeaway} /> : section.keyTakeaway}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
