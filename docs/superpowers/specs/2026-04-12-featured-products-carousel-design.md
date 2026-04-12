# Featured Products Carousel — Design Spec

**Date:** 2026-04-12

---

## Overview

A Featured Products section placed directly after `ManifestoSection` on the homepage. Editorial carousel showing 4 placeholder product cards, advancing one card at a time, wrapping infinitely. Matches the visual language of the site (sparse typography, Lucide icons, motion/react animations).

---

## File Structure

```
app/components/FeaturedProductsSection/
  index.tsx                      — section shell, renders header + carousel + footer link
  ProductCard.tsx                — individual card (grey placeholder + hover info panel)
  ProductCarouselIndicator.tsx   — segmented progress bar + counter + prev/next arrows
  hooks/
    useProductCarousel.ts        — all carousel state and interaction logic
  constants.ts                   — PRODUCTS array (4 placeholder entries)
```

`app/page.tsx` gets `<FeaturedProductsSection />` appended after `<ManifestoSection />`.

---

## Section Layout

- **Background:** white (`bg-white`)
- **Nav theme:** `data-nav-theme="light"`
- **Vertical padding:** `pt-16 pb-12`
- **Section header:** `( FEATURED PRODUCTS )` — centered, `text-[9px]`, `tracking-[0.25em]`, uppercase, `text-black/40`
- **Carousel viewport:** full-width, `overflow-hidden`
- **Footer link:** `VIEW ALL PRODUCTS` — centered below indicator, `text-[9px]`, `tracking-[0.2em]`, uppercase, `text-black/50`, underline on hover

---

## Product Cards

### Sizing
- Each card takes up slightly less than half the carousel container so two full cards are visible with a natural peek of the third card at the right edge.
- Exact width: `cardWidth = (containerWidth - gap) / 2 - peekAmount`, where `peekAmount ≈ 24px` and `gap = 16px`. Measured from a `containerRef` on mount and resize.
- Height: `aspect-ratio: 3/4` — scales proportionally with card width.
- Cards maintain equal height because they all share the same computed `cardWidth`.

### Appearance
- Background: `bg-[#e0e0e0]` (grey placeholder)
- `rounded-sm`, `overflow-hidden`

### Hover info panel
- Visible only on hover (`group-hover` pattern or `onMouseEnter`/`onMouseLeave` state)
- Positioned `absolute`, `bottom-4` (16px), `left-3.5` (14px) to `right-3.5` (14px) — does not touch any card edge
- Animation: slides up from `translateY(8px)` + `opacity: 0` to resting position with `motion/react`
- Background: `rgba(255,255,255,0.96)`, `border-t border-black/8`
- Contents (top to bottom):
  1. **Category** — `text-[8px]`, `tracking-[0.15em]`, uppercase, `text-black/40`
  2. **Product name** — `text-[10px]`, `font-semibold`, `tracking-[0.08em]`, uppercase, `text-black`
  3. **Price** — `text-[9px]`, `text-black/60`, formatted as `DKK 699,00`

---

## Carousel Behaviour (`useProductCarousel`)

### State
- `current: number` — active card index (0–3)
- `cardWidth: number` — measured pixel width of one card (updated on resize)
- `containerRef` — attached to the overflow-hidden viewport div
- `x: MotionValue<number>` — drives the track's x transform

### Navigation
- **Advance one card at a time** — track translates by one `cardWidth + gap` per step
- **Wrap-around:** both `next` and `prev` use modulo arithmetic:
  - `next → (current + 1) % PRODUCTS.length`
  - `prev → (current - 1 + PRODUCTS.length) % PRODUCTS.length`
- **`snapTo(index)`:** calls `animate(x, -index * (cardWidth + gap), { spring config })` with same spring as HeroSection (`stiffness: 320, damping: 36, mass: 0.9`)

### Drag
- `motion.div` on the track with `drag="x"`
- `dragConstraints: { left: -(PRODUCTS.length - 1) * (cardWidth + gap), right: 0 }` — same structure as HeroSection but using card step size
- `dragElastic: 0.06`, `dragMomentum: false`
- `onDragEnd`: same threshold logic as `useSlider` — offset > 20% of cardWidth or velocity > 400px/s triggers next/prev with modulo wrap (dragging left past last card snaps to index 0; dragging right past first card snaps to index 3)

### Resize handling
- `ResizeObserver` on `containerRef` recalculates `cardWidth` and re-snaps to `current` position without animation on resize

---

## Progress Indicator (`ProductCarouselIndicator`)

Mirrors `SlideIndicator` from `HeroSection` but inverted for a light background:

| Element | HeroSection | FeaturedProducts |
|---|---|---|
| Active segment | `rgba(255,255,255,0.9)` | `rgba(0,0,0,0.85)` |
| Inactive segment | `rgba(255,255,255,0.18)` | `rgba(0,0,0,0.15)` |
| Counter colour | `text-white/40` | `text-black/40` |
| Arrow colour | `text-white/40` hover `text-white` | `text-black/30` hover `text-black` |
| Arrow icon | `ChevronLeft/Right` size 13, strokeWidth 1.25 | same |
| Position | `absolute bottom-8 right-8` | same relative positioning, right-aligned |

4 segments, one per product card. Active segment = `current` index.

---

## Constants (`PRODUCTS`)

```ts
export const PRODUCTS = [
  { id: 0, category: "Apparel", name: "Product Name", price: 699 },
  { id: 1, category: "Apparel", name: "Product Name", price: 699 },
  { id: 2, category: "Accessories", name: "Product Name", price: 499 },
  { id: 3, category: "Accessories", name: "Product Name", price: 499 },
];
```

Price formatted at render time: `DKK ${price.toLocaleString("da-DK")},00`

---

## page.tsx change

```tsx
import FeaturedProductsSection from "./components/FeaturedProductsSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ManifestoSection />
      <FeaturedProductsSection />
    </main>
  );
}
```

---

## Out of scope

- Real product data or API integration
- Cart / add-to-bag functionality
- Mobile-specific breakpoints (cards scale naturally with viewport width via aspect-ratio)
- Autoplay
