import type { ComponentType } from "react";
import type { Restructured, TransformRequest } from "@/lib/types";

/**
 * The Mode contract. Every Mode is a renderer over the same restructured JSON, so adding one
 * means writing a single component file and adding a single line to `registry.ts`.
 *
 * `source` carries the request that produced this transform, so a Mode that needs its own
 * Restructure variant (ADHD, ticket 11) can ask the route for one without new plumbing.
 */
export interface ModeProps {
  restructured: Restructured;
  source: TransformRequest | null;
}

export interface ModeDefinition {
  id: string;
  label: string;
  /** One line, shown under the mode bar so a reader knows what they are switching to. */
  description: string;
  Renderer: ComponentType<ModeProps>;
}
