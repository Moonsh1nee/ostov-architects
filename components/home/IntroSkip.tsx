"use client";

const LEAVE_MS = 450; // .intro fade under html[data-intro="leaving"]

export function IntroSkip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="pill pill-light"
      onClick={() => {
        const root = document.documentElement;
        root.dataset.intro = "leaving";
        window.setTimeout(() => (root.dataset.intro = "skip"), LEAVE_MS);
      }}
    >
      {label}
    </button>
  );
}
