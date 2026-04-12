# Manifesto Section — Design Spec
Date: 2026-04-12

## Overview

A full-viewport section placed directly below the hero (`HeroSection`). White background, black text. Two-column layout: left half reserved for images (unstyled for now), right half displays the 9TSEVEN manifesto. The animation is scroll-driven — manifesto lines illuminate sequentially as the user scrolls through the section.

---

## Layout

- **Section**: full-width, white background (`#ffffff`), `min-height: 100vh`
- **Columns**: two equal columns (50/50), side by side
  - **Left column**: empty `<div data-image-area />` — no styling applied, left for future image work
  - **Right column**: vertically centered manifesto content
- **Padding**: `py-24` vertical breathing room; right column has left padding to offset from center
- **Nav theme**: `data-nav-theme="light"` on the section element so the navbar transitions to black text on scroll

---

## Content (right column)

```
[eyebrow]  9TSEVEN                     — tiny uppercase, letter-spaced, muted
[title]    Manifesto                   — medium size, light weight
[sub]      A guidance of living.       — small, italic or regular, muted

[divider line]

Gratitude. Thank you for this one life.
Create a space for diversity. We are all the same.
It's you vs you. At your own pace, in your own time.
Welcome all feelings. To appreciate the highs, we have to appreciate the lows.
Nothing changes if nothing changes. Start now and improve later.
Challenge your limits. Growth happens when you step outside your comfort zone.
Fuel your passion, not just your body. What drives you is as important as what nourishes you.
You're always developing, always evolving. Enjoy the process.
Holistic health. Invest in your physical, mental, and emotional well-being.
Community. Create a space for inspiration & human connection.
```

Each manifesto entry is a single line (no bullets, no numbers).

---

## Animation — Scroll-Driven Highlight

**Behaviour:** Lines start near-invisible and brighten to full black as the user scrolls through the section. Lines above the current reading position remain lit; lines below remain dim. This creates a sequential top-to-bottom illumination effect as the user reads down.

**Implementation:**
- `"use client"` component
- `useRef` on the section element
- `useScroll` from `motion/react` with:
  - `target`: section ref
  - `offset`: `["start end", "end start"]`
- 10 lines × individual `useTransform` mapping a sub-range of `scrollYProgress` to `opacity: [0.15, 1]`
  - Line 1 activates at scroll progress `[0.0, 0.1]`
  - Line 2 at `[0.08, 0.18]`, etc. — evenly distributed with slight overlap so the transition feels smooth
- Each line wrapped in `<motion.p>` with `style={{ opacity }}`
- No mount animation — scroll-driven only

**No animation on the left column** — it stays static.

---

## Component

- File: `app/components/ManifestoSection.tsx`
- Added to `app/page.tsx` below `<HeroSection />`
- No props needed — content is static

---

## Constraints

- No new dependencies — uses `motion/react` and Tailwind v4 already in the project
- Left column intentionally unstyled — do not add placeholder styling or comments beyond the `data-image-area` attribute
