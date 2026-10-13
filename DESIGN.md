# Design system — Ostov Architects

Derived from the shipped site. Change the code first, then this file.

## Direction
Quiet, editorial architecture studio. Photography carries the colour; the interface is paper, ink and hairlines. The signature is the **drafting axes**: four fixed 1px vertical lines (two on phones) behind every page, the "ostov" (frame) of the layout.

## Tokens (`app/globals.css`)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#eeebe5` | page background |
| `--paper-deep` | `#e4e0d8` | image placeholders, portrait backgrounds |
| `--ink` | `#161614` | text, dark sections (hero scrim, footer, transition) |
| `--ink-soft` | `#57544e` | secondary text (≥ 4.5:1 on paper) |
| `--line` | `ink @ 14%` | hairlines, axes |
| `--accent` | `#9c4a2b` | section indices, form errors, focus ring. Never for large areas. |
| `--gutter` | `clamp(1rem, 3vw, 2.5rem)` | side padding and grid gaps |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | every entrance; GSAP equivalent `expo.out` |

Single light theme by design: the genre is print-like, and dark sections already provide contrast.

## Type
- **Geologica** (variable, latin + cyrillic, `display: swap`, preloaded): everything. Display sizes at weight 300, tracking −0.045em, leading 0.92 (`.display`).
- **IBM Plex Mono 400** (`display: optional`): `.caption` only, uppercase, 12px. Years, areas, indices, labels — the "drawing sheet" voice. `optional`, because a late swap re-wraps captions and was the only layout shift.
- Headings use `text-wrap: balance`, paragraphs `pretty`.

## Layout
- 12-column grid at `md`, single column below. Asymmetry comes from spans and offsets (7 + 4 with a 45% top offset in the projects grid; wide + offset pair in galleries), never from equal cards.
- Media always sits in a `.frame` with a fixed aspect ratio, so nothing shifts while images stream in.

## Motion
| What | How | Why |
|---|---|---|
| Hero zoom-out (1.1 → 1, 2.6s) and line-by-line titles | CSS keyframes | starts on first paint, no JS |
| Fade-up reveals (24px, 0.9s, stagger 70ms) | GSAP + ScrollTrigger, `once` | below-the-fold only; on-screen elements are never hidden |
| Image reveal | `clip-path` inset on the frame + scale on `<picture>` | separate layer from parallax on `<img>` |
| Featured strip | pinned horizontal scrub ≥ 768px, native scroll-snap below | |
| Manifesto | word opacity scrub 0.14 → 1, only from the viewport edge | keeps full contrast until it matters |
| Page transition | ink panel up (0.6s) / away (0.75s), `expo.inOut` | same-locale links only |
| Header | hides on scroll down, light tone over `[data-tone="dark"]` | |

Only `transform`, `opacity` and `clip-path` animate. `prefers-reduced-motion`: no Lenis, no scroll scenes, fade-only transition, CSS animations collapse to 0.01ms.
