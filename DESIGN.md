# Design system — Ostov Architects

Derived from the shipped site. Change the code first, then this file.

## Direction
Cinematic architecture studio (genre reference: yodezeen.com — techniques, not layout). Photography carries all the colour; the interface is neutral paper, ink, hairlines and pill buttons. Statements are set big, bold and in caps, one idea per screen. The signature is the **drafting axes**: four fixed 1px vertical lines (two on phones) behind every page, the "ostov" (frame) of the layout.

## Tokens (`app/globals.css`)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#efeeec` | page background (neutral, so photos carry the warmth) |
| `--paper-deep` | `#e3e2df` | image placeholders, portrait backgrounds |
| `--ink` | `#201e1e` | text, dark sections (hero scrim, footer, transition) |
| `--ink-soft` | `#5d5a59` | secondary text (≥ 4.5:1 on paper) |
| `--line` | `ink @ 12%` | hairlines, axes |
| `--accent` | `#9c4a2b` | section indices, form errors, focus ring. Never for large areas. |
| `--gutter` | `clamp(1rem, 3vw, 2.5rem)` | side padding and grid gaps |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | every entrance; GSAP equivalent `expo.out` |

Single light theme by design: the genre is print-like, and dark sections already provide contrast.

## Type
- **Geologica** (variable, latin + cyrillic, `display: swap`, preloaded): everything. `.display` = weight 650, caps, tracking −0.035em, leading 0.9 (titles, statements, cities). `.statement` = weight 450 caps for short studio text and card titles.
- **Pills** (`.pill`, `.pill-light` over photos, `.pill-dark` for primary CTAs): every call to action and the project filter.
- **IBM Plex Mono 400** (`display: optional`): `.caption` only, uppercase, 12px. Years, areas, indices, labels — the "drawing sheet" voice. `optional`, because a late swap re-wraps captions and was the only layout shift.
- Headings use `text-wrap: balance`, paragraphs `pretty`.

## Layout
- 12-column grid at `md`, single column below. Asymmetry comes from spans and offsets (7 + 4 with a 45% top offset in the projects grid; wide + offset pair in galleries), never from equal cards.
- Media always sits in a `.frame` with a fixed aspect ratio, so nothing shifts while images stream in.

## Motion
| What | How | Why |
|---|---|---|
| Intro: wordmark letters rise, rule draws, all lifts away (≈2.5s, once per session) | CSS keyframes + head script | decided before first paint; skippable |
| Hero slideshow: 3 slides × 6s, 1.2s crossfade + zoom 1.12 → 1 | CSS keyframes, shared 18s cycle | runs from first frame; static first slide under reduced motion |
| Line-by-line page titles, project cover zoom-out | CSS keyframes | starts on first paint, no JS |
| Fade-up reveals (24px, 0.9s, stagger 70ms) | GSAP + ScrollTrigger, `once` | below-the-fold only; on-screen elements are never hidden |
| Image reveal | `clip-path` inset on the frame + scale on `<picture>` | separate layer from parallax on `<img>` |
| Expanding photo | pinned ≥ 768px: text panel slides out, photo scales 1.15 → 1 | split screen without JS, stacked on phones |
| Featured projects | `position: sticky` full-screen slides stacking over each other | no JS at all |
| Statement | word opacity scrub 0.14 → 1, only from the viewport edge | keeps full contrast until it matters |
| Page transition | ink panel up (0.6s) / away (0.75s), `expo.inOut` | same-locale links only |
| Header | hides on scroll down, light tone over `[data-tone="dark"]` | |

Only `transform`, `opacity` and `clip-path` animate. `prefers-reduced-motion`: no Lenis, no scroll scenes, fade-only transition, CSS animations collapse to 0.01ms.
