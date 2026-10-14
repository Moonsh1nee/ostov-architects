"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { BASE_PATH } from "@/lib/paths";
import type { Engine } from "./engine";

/**
 * Boots the motion layer once the browser is idle after first paint, so GSAP,
 * ScrollTrigger and Lenis never compete with the LCP image for the main thread.
 */
export function MotionRoot() {
  const pathname = usePathname();
  const router = useRouter();
  const engine = useRef<Engine | null>(null);

  useEffect(() => {
    let cancelled = false;
    const boot = () => {
      // Releases the deferred hero slides (see .slide in globals.css), aligned to the running cycle.
      const root = document.documentElement;
      root.style.setProperty("--hero-elapsed", `${(performance.now() / 1000).toFixed(2)}s`);
      root.dataset.idle = "";
      void import("./engine").then(({ createEngine }) => {
        if (cancelled) return;
        engine.current = createEngine({ navigate: (href) => router.push(href, { scroll: false }), basePath: BASE_PATH });
        engine.current.pageChanged();
      });
    };
    const idle = "requestIdleCallback" in window;
    const handle = idle ? window.requestIdleCallback(boot, { timeout: 2500 }) : window.setTimeout(boot, 1200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      engine.current?.destroy();
      engine.current = null;
    };
  }, [router]);

  useEffect(() => {
    engine.current?.pageChanged();
  }, [pathname]);

  return null;
}
