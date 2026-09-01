import ActionMode from "@/components/modes/ActionMode";
import AdhdMode from "@/components/modes/AdhdMode";
import DyslexiaMode from "@/components/modes/DyslexiaMode";
import FocusMode from "@/components/modes/FocusMode";
import ListenMode from "@/components/modes/ListenMode";
import type { ModeDefinition } from "@/components/modes/types";

/**
 * The Mode registry. One line per Mode — that line plus the renderer file it points at is the
 * entire cost of adding a Mode. Nothing else in the app knows the list.
 */
export const MODES: ModeDefinition[] = [
  { id: "focus", label: "Focus", description: "One card at a time, with your place kept.", Renderer: FocusMode },
  { id: "dyslexia", label: "Dyslexia", description: "Dyslexia-friendly font, warm tint, bolded word starts.", Renderer: DyslexiaMode },
  { id: "action", label: "Action", description: "Just what you have to do, and by when.", Renderer: ActionMode },
  { id: "listen", label: "Listen", description: "Have the page read aloud to you.", Renderer: ListenMode },
  { id: "adhd", label: "ADHD", description: "Micro-cards: one idea per screen, key words bolded.", Renderer: AdhdMode }
];

export const DEFAULT_MODE_ID = MODES[0].id;

export function findMode(id: string): ModeDefinition {
  return MODES.find((mode) => mode.id === id) ?? MODES[0];
}
