"use client";

import { createContext, useContext } from "react";
import type { ReadingLevel } from "@/lib/types";

export interface ReadingLevelControl {
  /** The level currently on screen. */
  level: ReadingLevel;
  /** The level being fetched, if any. The version already on screen stays until it arrives. */
  pending: ReadingLevel | null;
  /** Why the last switch could not be finished, in words a reader can act on. */
  error: string | null;
  select: (level: ReadingLevel) => void;
}

const Context = createContext<ReadingLevelControl | null>(null);

/**
 * The reading-level control, shared between the workspace that owns the transforms and the toolbar
 * that shows the pills.
 *
 * Context rather than props because the two live at opposite ends of the reading view: the level
 * decides which transform the split view is given, and the pills sit inside the panel that transform
 * renders into. Threading a level and a callback through every layer between them would make three
 * components that have no interest in reading levels carry them anyway.
 */
export function ReadingLevelProvider({
  value,
  children
}: {
  value: ReadingLevelControl;
  children: React.ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/**
 * The control, or `null` where there is none above in the tree.
 *
 * Null rather than a thrown error: the toolbar is a reusable piece of the reading view, and a
 * toolbar rendered somewhere without a workspace should leave the pills out, not take the page down
 * with it.
 */
export function useReadingLevel(): ReadingLevelControl | null {
  return useContext(Context);
}
