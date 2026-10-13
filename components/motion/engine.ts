// Loaded with a dynamic import after first paint, so GSAP and Lenis never sit
// on the critical path. Everything here animates transform, opacity or clip-path.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { CONTENT_CHANGED_EVENT, SCROLL_LOCK_EVENT } from "./events";

gsap.registerPlugin(ScrollTrigger);

const EASE = "expo.out"; // matches --ease-out in globals.css
const REVEAL_START = "top 88%";

export interface EngineOptions {
  /** App path without basePath, as next/navigation's router expects it. */
  navigate: (href: string) => void;
  basePath: string;
}

export interface Engine {
  /** Call after every route change (push or history pop). */
  pageChanged: () => void;
  destroy: () => void;
}

const isInView = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};

/**
 * Elements already on screen when motion boots stay as they are: hiding
 * visible content just to fade it back in would read as a flash.
 */
const offscreen = <T extends Element>(nodes: Iterable<T>) => [...nodes].filter((el) => !isInView(el));

function setupPage(root: HTMLElement): gsap.Context {
  return gsap.context(() => {
    for (const el of offscreen(root.querySelectorAll<HTMLElement>('[data-reveal="fade"]'))) {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: EASE,
        scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
      });
    }

    for (const group of root.querySelectorAll<HTMLElement>("[data-stagger]")) {
      const items = offscreen(group.children);
      if (!items.length) continue;
      gsap.from(items, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: group, start: REVEAL_START, once: true },
      });
    }

    for (const frame of offscreen(root.querySelectorAll<HTMLElement>('[data-reveal="clip"]'))) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 92%", once: true } });
      tl.fromTo(
        frame,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: EASE },
      );
      const picture = frame.querySelector("picture");
      if (picture) tl.from(picture, { scale: 1.2, duration: 1.6, ease: EASE }, 0);
    }

    for (const text of root.querySelectorAll<HTMLElement>("[data-words]")) {
      gsap.fromTo(
        text.querySelectorAll(".word"),
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          // Dim only from the moment the text reaches the viewport edge: until then
          // it keeps full contrast (no flash, and audits don't see 0.14-opacity text).
          immediateRender: false,
          scrollTrigger: { trigger: text, start: "top bottom", end: "bottom 55%", scrub: true },
        },
      );
    }

    for (const img of root.querySelectorAll<HTMLElement>("[data-parallax]")) {
      const amount = Number(img.dataset.parallax) || 0.1;
      gsap.fromTo(
        img,
        // Oversize first so the moving image never exposes the frame edge.
        { yPercent: -amount * 50, scale: 1 + amount },
        {
          yPercent: amount * 50,
          ease: "none",
          scrollTrigger: { trigger: img.closest(".frame") ?? img, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      // Expanding photo: the text panel slides off to the right and the photo
      // behind it takes the whole screen. Without JS (or on phones) the same
      // markup is simply a split screen / stacked block.
      for (const section of root.querySelectorAll<HTMLElement>("[data-expand]")) {
        const pinned = section.querySelector<HTMLElement>("[data-expand-pin]");
        const panel = section.querySelector<HTMLElement>("[data-expand-panel]");
        const picture = section.querySelector<HTMLElement>("[data-expand-media] picture");
        if (!pinned || !panel || !picture) continue;
        gsap
          .timeline({
            scrollTrigger: { trigger: pinned, start: "top top", end: "+=130%", pin: true, scrub: 0.6 },
          })
          .to({}, { duration: 0.3 }) // hold: let the statement be read first
          .to(panel, { xPercent: 100, ease: "power2.inOut", duration: 1 })
          .fromTo(picture, { scale: 1.15 }, { scale: 1, ease: "none", duration: 1 }, "<");
      }
    });
  }, root);
}

interface Transition {
  cover: (onCovered: () => void) => void;
  uncover: () => void;
  readonly covered: boolean;
}

function createTransition(overlay: HTMLElement, reduced: boolean): Transition {
  let covered = false;
  let timeline: gsap.core.Timeline | undefined;
  // y: 0 explicitly, so GSAP never folds a stray CSS transform into yPercent.
  const coverFrom = reduced ? { opacity: 0, y: 0, yPercent: 0 } : { opacity: 1, y: 0, yPercent: 100 };
  return {
    get covered() {
      return covered;
    },
    cover(onCovered) {
      timeline?.kill();
      covered = true;
      timeline = gsap
        .timeline({ onComplete: onCovered })
        .set(overlay, { visibility: "visible", pointerEvents: "auto", ...coverFrom })
        .to(overlay, reduced ? { opacity: 1, duration: 0.15 } : { yPercent: 0, duration: 0.6, ease: "expo.inOut" });
    },
    uncover() {
      if (!covered) return;
      timeline?.kill();
      covered = false;
      timeline = gsap
        .timeline()
        .to(overlay, reduced ? { opacity: 0, duration: 0.2 } : { yPercent: -100, duration: 0.75, ease: "expo.inOut" })
        .set(overlay, { visibility: "hidden", pointerEvents: "none" });
    },
  };
}

/** Same-document, same-locale links get the overlay; everything else navigates natively. */
function transitionTarget(event: MouseEvent, basePath: string): string | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }
  const anchor = (event.target as Element | null)?.closest("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.hasAttribute("hreflang")) {
    return null;
  }
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(`${basePath}/`)) return null;
  if (url.pathname === location.pathname) return null; // hash links, same-page links
  const appPath = url.pathname.slice(basePath.length) || "/";
  // Crossing locales swaps the root layout, which is a full document load anyway.
  if (appPath.startsWith("/en/") !== location.pathname.slice(basePath.length).startsWith("/en/")) return null;
  return appPath + url.search;
}

export function createEngine({ navigate, basePath }: EngineOptions): Engine {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.getElementById("main");
  const overlay = document.querySelector<HTMLElement>("[data-transition-overlay]");
  if (!root || !overlay) throw new Error("motion: #main or [data-transition-overlay] missing");

  const lenis = reduced ? null : new Lenis({ autoRaf: false, lerp: 0.1 });
  const raf = (time: number) => lenis?.raf(time * 1000);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }

  const transition = createTransition(overlay, reduced);
  let ctx: gsap.Context | undefined;
  let fallback: number | undefined;

  // Pins and inline styles must be undone while the old page is still mounted:
  // React does not expect GSAP's DOM changes when it removes those nodes.
  let builtFor = "";
  const teardown = () => {
    ctx?.revert();
    ctx = undefined;
  };

  const rebuild = () => {
    teardown();
    ctx = reduced ? undefined : setupPage(root);
    builtFor = location.pathname;
    ScrollTrigger.refresh();
  };

  // On back/forward the router may commit (and run our rebuild) synchronously
  // before this listener fires; only tear down a context built for the old page.
  const onPopState = () => {
    if (builtFor !== location.pathname) teardown();
  };

  const onClick = (event: MouseEvent) => {
    const href = transitionTarget(event, basePath);
    if (!href) return;
    event.preventDefault();
    transition.cover(() => {
      teardown();
      navigate(href);
      // If the route never changes (e.g. a failed navigation), don't leave the screen covered.
      fallback = window.setTimeout(() => transition.uncover(), 4000);
    });
  };

  const onLock = (event: Event) => {
    if ((event as CustomEvent<boolean>).detail) lenis?.stop();
    else lenis?.start();
  };

  document.addEventListener("click", onClick, true);
  // Back/forward: the router renders the previous page in a transition, after this runs.
  window.addEventListener("popstate", onPopState);
  window.addEventListener(SCROLL_LOCK_EVENT, onLock);
  window.addEventListener(CONTENT_CHANGED_EVENT, rebuild);
  // Webfont swap can change text heights after triggers were measured.
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return {
    pageChanged() {
      window.clearTimeout(fallback);
      if (transition.covered) {
        // Forward navigation: jump to top while nobody can see it.
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo(0, 0);
      }
      rebuild();
      transition.uncover();
    },
    destroy() {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener(SCROLL_LOCK_EVENT, onLock);
      window.removeEventListener(CONTENT_CHANGED_EVENT, rebuild);
      window.clearTimeout(fallback);
      ctx?.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
    },
  };
}
