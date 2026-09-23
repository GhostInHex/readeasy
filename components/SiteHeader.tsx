"use client";

import { useEffect, useRef, type ReactNode } from "react";
import ThemeSwitch from "@/components/ThemeSwitch";

interface SiteHeaderProps {
  /**
   * The reading bar: page identity and the Mode switcher, once there is a page to switch. It is a
   * second row of this header rather than an element below it so the whole thing is one sticky
   * block — a bar that sticks to a moving target has to guess the header's height, and guesses
   * wrong the moment the wordmark wraps.
   */
  children?: ReactNode;
}

/**
 * The masthead: the wordmark, the theme switch a light-sensitive reader needs before they read
 * anything, and — while a page is open — the reading bar beneath them.
 *
 * Sticky, because both rows are things a reader reaches for mid-page: the theme when their eyes
 * start to hurt, the Mode when the current one stops suiting the section they are on. Opaque, so
 * nothing scrolling behind it degrades the contrast.
 *
 * The header also publishes its own height as `--header-h`, which is what the sticky "before"
 * panel offsets against. Measured here (and re-measured by a ResizeObserver) because the height
 * is not fixed: the reading bar adds a row when a page is open, and either row wraps when a long
 * page title or five Modes run long — every one of those moments would break a hard-coded offset.
 */
export default function SiteHeader({ children }: SiteHeaderProps) {
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = header.current;
    if (!node) return;

    const measure = () => {
      document.documentElement.style.setProperty("--header-h", `${node.offsetHeight}px`);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header" ref={header}>
      <div className="masthead">
        <a className="wordmark" href="/">
          <span className="wordmark-read">Read</span>
          <span className="wordmark-easy">Easy</span>
        </a>
        <ThemeSwitch />
      </div>
      {children}
    </header>
  );
}
