import { Geologica, IBM_Plex_Mono } from "next/font/google";

// Variable wght axis only: one file per subset covers every weight we use.
export const sans = Geologica({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-mono",
  // Decorative captions: if the font misses the first paint, keep the fallback rather
  // than swap late — a swap re-wraps captions and was the page's only layout shift.
  display: "optional",
});

export const fontVariables = `${sans.variable} ${mono.variable}`;
