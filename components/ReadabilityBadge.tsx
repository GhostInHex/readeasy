import { flattenRestructured, readability } from "@/lib/readability";
import type { Restructured } from "@/lib/types";

interface ReadabilityBadgeProps {
  cleanedOriginal: string;
  restructured: Restructured;
}

/**
 * The before/after grade level, measured not claimed: "Original: college level → ReadEasy: grade 5".
 *
 * Both sides are scored by the same arithmetic — the cleaned original against the flattened
 * transformed text — so the comparison is honest. When either side is too short to score, the badge
 * renders nothing rather than a made-up number.
 */
export default function ReadabilityBadge({ cleanedOriginal, restructured }: ReadabilityBadgeProps) {
  const original = readability(cleanedOriginal);
  const simplified = readability(flattenRestructured(restructured));

  if (!original || !simplified) {
    return null;
  }

  const easier = simplified.grade < original.grade;

  return (
    <p className="readability-badge" data-easier={easier ? "yes" : "no"}>
      <span className="sr-only">
        Reading level: the original page needs {original.label}, the ReadEasy version needs {simplified.label}.
      </span>
      <span aria-hidden="true">
        Original: <strong>{original.label}</strong>
        <span className="readability-arrow">→</span>
        ReadEasy: <strong>{simplified.label}</strong>
      </span>
    </p>
  );
}
