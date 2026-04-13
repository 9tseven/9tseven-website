# FeaturedProductsSection — Carousel & Card Redesign

**Date:** 2026-04-13  
**Status:** Approved

---

## Overview

Four targeted changes to `FeaturedProductsSection`: smaller cards, native scroll-snap carousel, full-height image overlay arrow panels, and always-visible price info on mobile.

---

## 1. Card Sizing

Add horizontal padding to the section so cards no longer fill the full viewport width.

- Mobile: `px-6` (24px each side)
- Desktop: `px-16` (64px each side)

Effect: each card's computed width shrinks by ~50–80px on desktop, reducing the 3:4 height by ~65–105px. Aspect ratio stays `3 / 4`. No change to card count (3 on desktop, 1 on mobile) or PEEK_AMOUNT logic.

The same padding solves the mobile breathing-room requirement — cards will have visible space on both sides.

---

## 2. Carousel — Native CSS Scroll-Snap

Replace the Framer Motion drag track with a native scroll container.

### Markup change (`index.tsx`)

```
Before: <motion.div drag="x" style={{x}} ...>
After:  <div style={{overflowX: 'scroll', scrollSnapType: 'x mandatory'}} ...>
```

The outer `containerRef` div keeps `overflow-hidden` removed (scroll needs to be visible to the browser). The scrollbar is hidden with inline styles `{ msOverflowStyle: 'none', scrollbarWidth: 'none' }` plus the Tailwind utility `[&::-webkit-scrollbar]:hidden` on the scroll container.

Each `ProductCard` wrapper gets `scrollSnapAlign: 'start'` via inline style.

### Hook changes (`useProductCarousel.ts`)

- Remove: `useMotionValue`, `animate` from framer-motion, `x` motion value, `handleDragEnd`
- Add: `scrollRef` (replaces the motion-value role — same `containerRef` ref, just used differently)
- `snapTo(page)` becomes:
  ```ts
  scrollRef.current?.scrollTo({
    left: page * visibleCardsRef.current * (cardWidthRef.current + CARD_GAP),
    behavior: 'smooth',
  });
  ```
- Add `onScroll` handler on the scroll container (debounced ~80ms) to derive `current` from `scrollLeft`:
  ```ts
  const page = Math.round(scrollLeft / (visibleCardsRef.current * (cardWidthRef.current + CARD_GAP)));
  setCurrent(page);
  ```
- `handleScroll` is added to the hook's return value and wired to the scroll container's `onScroll` prop in `index.tsx`
- `prev`, `next`, `pageCount`, `visibleCards`, `cardWidth`, `current` — all unchanged in the public API; `x` and `handleDragEnd` are removed

### What stays the same

- Page-by-page snapping behaviour
- Prev/next buttons in `ProductCarouselIndicator`
- Segmented progress bar
- `ResizeObserver` for responsive layout
- Mobile (1 card) vs desktop (3 cards) logic

---

## 3. Image Overlay Arrow Panels

Replace the small `<button>` chevrons with full-height side-strip tap targets.

### Structure (inside `ProductCard`)

Two absolute-positioned divs, each ~22% of card width, covering the full height of the card:

```tsx
{/* Left panel */}
<div
  className="absolute left-0 top-0 bottom-0 w-[22%] z-10
             flex items-center justify-center
             bg-black/10 md:bg-transparent md:opacity-0
             md:group-hover:opacity-100 md:hover:bg-black/18
             transition-all duration-200 cursor-pointer"
  onClick={prevImage}
  aria-label="Previous image"
>
  <ChevronLeft size={18} strokeWidth={1.25} className="text-white" />
</div>

{/* Right panel */}
<div
  className="absolute right-0 top-0 bottom-0 w-[22%] z-10
             flex items-center justify-center
             bg-black/10 md:bg-transparent md:opacity-0
             md:group-hover:opacity-100 md:hover:bg-black/18
             transition-all duration-200 cursor-pointer"
  onClick={nextImage}
  aria-label="Next image"
>
  <ChevronRight size={18} strokeWidth={1.25} className="text-white" />
</div>
```

The card's outer div gets `group` added to its className.

**Mobile behaviour:** Panels always render at `bg-black/10` — low opacity, large tap target, no hover required.  
**Desktop behaviour:** Hidden (`opacity-0`, transparent background) until the `group` is hovered, then fades to `bg-black/18`.

React's `hovered` state is retained on the card for the price panel animation only. Panel visibility is CSS-only.

Only rendered when `hasMultiple` is true (unchanged condition).

---

## 4. Mobile Price Panel — Always Visible

On mobile, the name/price info must be visible without hover. Two separate renders keyed by breakpoint:

```tsx
{/* Mobile: always visible, no animation */}
<div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 md:hidden z-20">
  <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
  <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">{product.name}</p>
  <p className="text-[9px] text-black/60 mt-1">DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2 })}</p>
</div>

{/* Desktop: animated on hover */}
<AnimatePresence>
  {hovered && (
    <motion.div className="hidden md:block absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 z-20"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {/* same content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Files Changed

| File | Change |
|------|--------|
| `hooks/useProductCarousel.ts` | Remove motion values; add scroll-based snapTo + onScroll handler |
| `ProductCard.tsx` | Overlay panels, group hover, mobile price panel |
| `index.tsx` | Section padding, swap motion track for scroll div |
| `constants.ts` | No changes |
| `ProductCarouselIndicator.tsx` | No changes |
