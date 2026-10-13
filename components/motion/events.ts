// The motion layer (GSAP, Lenis) is loaded lazily, so components talk to it
// through DOM events instead of importing it and pulling it into their bundle.
export const CONTENT_CHANGED_EVENT = "ostov:content-changed";
export const SCROLL_LOCK_EVENT = "ostov:scroll-lock";

/** Call after client-side DOM changes that add animated elements or change page height. */
export function notifyContentChanged(): void {
  window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT));
}

export function setScrollLocked(locked: boolean): void {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent<boolean>(SCROLL_LOCK_EVENT, { detail: locked }));
}
