"use client";

import { useEffect } from "react";

const HEADER = "[data-site-header]";
const DARK_SECTION = '[data-tone="dark"]';

/**
 * Sets data-tone="dark" on the fixed header while any dark section
 * (hero photo, footer, "next project" block) sits under the header strip.
 * Re-binds per route because each page brings its own sections.
 */
export function useHeaderTone(pathname: string, forceDark: boolean) {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(HEADER);
    if (!header) return;
    if (forceDark) {
      header.dataset.tone = "dark";
      return;
    }
    const underHeader = new Set<Element>();
    const apply = () => {
      header.dataset.tone = underHeader.size > 0 ? "dark" : "light";
    };
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      underHeader.clear();
      const strip = header.offsetHeight / 2;
      // Shrink the root to a thin band at the header's vertical centre.
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) underHeader.add(e.target);
            else underHeader.delete(e.target);
          }
          apply();
        },
        { rootMargin: `-${strip}px 0px -${Math.max(0, window.innerHeight - strip - 1)}px 0px` },
      );
      document.querySelectorAll(DARK_SECTION).forEach((el) => observer!.observe(el));
      apply();
    };
    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [pathname, forceDark]);
}
