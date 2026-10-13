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
  display: "swap",
  variable: "--font-mono",
  // Captions are small and below the fold; don't compete with the hero for bandwidth.
  preload: false,
});

export const fontVariables = `${sans.variable} ${mono.variable}`;
