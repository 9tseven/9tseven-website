# Editorial Sections — HomeImageSection & BrandStatementSection

**Date:** 2026-04-13
**Status:** Approved
**Files affected:**
- `app/components/HomeImageSection/index.tsx` (new)
- `app/components/BrandStatementSection/index.tsx` (new)
- `app/page.tsx` (add both sections after `FeaturedProductsSection`)

---

## Overview

Two new sections to be added to the home page after `FeaturedProductsSection`, inspired by the Odd Ritual Golf editorial layout.

---

## Section 1 — HomeImageSection

A three-column editorial image grid. Each panel is a full-bleed photo with:
- A small uppercase label centered on the image
- A cursor-tracking text row that follows the mouse Y-position within the panel
- An image zoom on hover

### Layout

```
| Our Products        | Our Story           | Our Community       |
| (full-bleed photo)  | (full-bleed photo)  | (full-bleed photo)  |
```

- Three equal-width columns (`grid-template-columns: 1fr 1fr 1fr`)
- `gap: 10px` with white background showing through (matching `--site--gutter`)
- Section height: `78vh`
- Each panel has `overflow: hidden` to clip the zooming image

### Panel label

- Positioned dead-center (`top: 50%; left: 50%; transform: translate(-50%, -50%)`)
- `9px`, `letter-spacing: 0.28em`, `text-transform: uppercase`
- `color: rgba(255,255,255,0.6)`
- Always visible (not toggled on hover)

### Hover effect

Two parts, both activate on `mouseenter` and deactivate on `mouseleave`:

**1. Image zoom**
- `transform: scale(1.06)` on the inner photo element
- `transition: transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)`
- Implemented via a toggled CSS class (`is-hovered`) set by a `mousemove` listener

**2. Cursor-tracking text row**
- Two labels per panel: one left-aligned, one right-aligned (with square brackets, e.g. `[ View all ]`)
- Row is absolutely positioned, `left: 0; right: 0`, padding `0 18px`
- Y-position driven by a **lerp loop** (`requestAnimationFrame`, factor `0.1`) — smooth lag behind cursor
- Initialised to cursor position on `mouseenter` to prevent jump
- Fades in/out via `opacity` CSS transition (`0.4s ease`)
- Cursor is **not** hidden on hover (`cursor: default`)

### Panels (labels & links)

| Panel | Label | Left text | Right text | Link |
|-------|-------|-----------|------------|------|
| 1 | Our Products | Shop | [ View all ] | `/products` |
| 2 | Our Story | About | [ Read more ] | `/about` |
| 3 | Our Community | Social | [ Instagram ] | Instagram URL |

### Implementation approach

- Client component (`"use client"`)
- Use `useRef` per panel + `mousemove`/`mouseenter`/`mouseleave` event listeners
- `requestAnimationFrame` lerp loop per panel, cancelled when not hovering and settled
- Images via Next.js `<Image>` with `fill` and `object-fit: cover`

---

## Section 2 — BrandStatementSection

A minimal white section used as a closing editorial statement after the image grid.

### Layout (top to bottom, centered column)

```
9TSEVEN©2025                          ← small uppercase, centered
Copenhagen   More than running   Denmark  ← 3-col row, vertically centered
             [body text]               ← centered, narrow column
             [logo]                    ← centered, low opacity
```

### Brand line
- `9TSEVEN©2025`
- `10px`, `letter-spacing: 0.22em`, `text-transform: uppercase`
- `color: rgba(0,0,0,0.45)`
- Centered, sits above the middle row

### Middle row
- CSS grid: `grid-template-columns: 1fr auto 1fr`
- Vertically centered (`align-items: center`)

| Slot | Content | Style |
|------|---------|-------|
| Left | Copenhagen | `9px`, `letter-spacing: 0.28em`, uppercase, `rgba(0,0,0,0.4)` |
| Center | More than running | `22px`, `letter-spacing: 0.12em`, uppercase, `font-weight: 300`, `rgba(0,0,0,0.8)` |
| Right | Denmark | `9px`, `letter-spacing: 0.28em`, uppercase, `rgba(0,0,0,0.4)`, right-aligned |

### Body text
- `"Rooted in identity, shaped by culture, and driven by community — our expression is a reflection of where we come from and where we're going."`
- `11px`, `line-height: 1.8`, `letter-spacing: 0.02em`
- `color: rgba(0,0,0,0.45)`
- `max-width: 380px`, centered

### Logo
- Next.js `<Image>` pointing to `/Logo/9t7.svg`
- `width: 80px`, `height: auto`
- `opacity: 0.25`
- Centered below body text, `margin-top: 52px`

### Section padding
- `padding: 90px 40px 80px`
- White background, no border

---

## Page integration

Add both sections to `app/page.tsx` after `FeaturedProductsSection`:

```tsx
<HeroSection />
<FeaturedProductsSection />
<HomeImageSection />
<BrandStatementSection />
```

---

## What is not changing

- `HeroSection`, `FeaturedProductsSection` are untouched
- Global font (`Figtree`) and layout remain as-is
- No new dependencies — uses existing Framer Motion, Next.js Image, and React hooks
