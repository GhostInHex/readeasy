"use client";

import ComingSoon from "@/components/modes/ComingSoon";
import type { ModeProps } from "@/components/modes/types";

/** Stub until ticket 08 (read aloud with the browser's speechSynthesis). */
export default function ListenMode(_props: ModeProps) {
  return <ComingSoon name="Listen" />;
}
