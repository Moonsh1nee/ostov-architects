"use client";

import { useEffect } from "react";

const HEADER = "[data-site-header]";
const REVEAL_ZONE = 120; // px from the top where the header is always shown
const THRESHOLD = 6; // ignore sub-pixel jitter from smooth scrolling

/**
 * The header has no background, so it slides away while reading downwards
 * and comes back on any upward scroll — the usual pattern for photo-led sites.
 */
export function useHeaderAutoHide(disabled: boolean) {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(HEADER);
    if (!header) return;
    if (disabled) {
      header.dataset.hidden = "false";
      return;
    }
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - lastY) < THRESHOLD) return;
      header.dataset.hidden = String(y > REVEAL_ZONE && y > lastY);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Keyboard users tabbing into the nav must be able to see it.
    const onFocus = () => (header.dataset.hidden = "false");
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      header.removeEventListener("focusin", onFocus);
    };
  }, [disabled]);
}
