# Product Card: Aspect Ratio, Image Drag & Progress Bar

**Date:** 2026-04-15

## Summary

Three focused changes to the Featured Products Section:

1. Card aspect ratio changes from `3/4` to `4/5`
2. Mobile-only drag gesture to cycle through a product's images
3. Progress bar segments gain a larger hit zone, a hover grow effect, and click-to-navigate

---

## 1. Aspect Ratio

**File:** `app/components/FeaturedProductsSection/ProductCard.tsx`

Change the inline style on the root card `<div>` from `aspectRatio: "3 / 4"` to `aspectRatio: "4 / 5"`. No other layout changes are required — outer padding was already removed by the developer prior to this spec.

---

## 2. Image Drag (Mobile Only)

**File:** `app/components/FeaturedProductsSection/ProductCard.tsx`

### Behaviour

- **Mobile (viewport width < 640px):** dragging horizontally anywhere on the card cycles through that product's images.
- **Desktop (≥ 640px):** no change — images are cycled via the existing chevron arrow buttons on hover; the outer carousel's native horizontal scroll remains the dominant gesture.

### Interaction model

- `pointerdown`: record start X. On mobile, call `e.preventDefault()` to suppress native scroll interference. Return early on desktop (skip all drag logic).
- `pointermove`: compute `dragDelta = currentX - startX`. Translate the current image and pre-position the incoming image so it peeks in from the side in real time, giving live visual feedback.
- `pointerup`: if `|dragDelta| >= 40px`, commit — fire `nextImage()` or `prevImage()` (the existing handlers) with the correct direction, then reset the translate. If below threshold, snap the translate back to 0 with a short spring transition.
- Call `e.stopPropagation()` on `pointermove` and `pointerup` when drag is active so the outer carousel scroll container never sees the gesture.

### Implementation notes

- The live translate is applied as a CSS transform on the `motion.div` wrapping the current image; the incoming image is rendered at `translateX(±cardWidth)` then shifted by `dragDelta` in the same frame.
- The breakpoint check (`window.innerWidth < 640`) is evaluated inside the `pointerdown` handler. A `useRef` flag tracks whether a drag is active to avoid state flicker.
- The existing `isAnimating` guard prevents a new drag from starting while a spring commit animation is in flight.

---

## 3. Progress Bar

**File:** `app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx`  
**Hook:** `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts`

### Visual behaviour

- Each segment is wrapped in a `<button>` with a 20px-tall hit zone (`h-5`, `flex items-end`) so it is easy to hover and click.
- The visual bar inside is `h-px` at rest. On wrapper hover it grows to `h-[5px]`, anchored at the bottom edge (the wrapper uses `items-end`, so the bar expands upward).
- The active segment is `bg-black/85`; inactive segments are `bg-black/15`. Both honour the grow on hover.
- Transition: `transition-all duration-200`.

### Click-to-navigate

- A new `onGoTo: (index: number) => void` prop is added to `ProductCarouselIndicator`.
- Each segment `<button>` calls `onGoTo(i)` on click.
- In `useProductCarousel`, `snapTo` is already implemented and exported; it is passed through as `onGoTo` from `FeaturedProductsSection`.

---

## Files Changed

| File | Change |
|---|---|
| `ProductCard.tsx` | Aspect ratio `3/4` → `4/5`; pointer-event drag handlers for mobile image cycling |
| `ProductCarouselIndicator.tsx` | Segment hit zone wrapper, hover grow effect, `onGoTo` prop |
| `useProductCarousel.ts` | Expose `snapTo` (or a thin wrapper) for the `onGoTo` callback |
| `index.tsx` | Pass `onGoTo={snapTo}` to `ProductCarouselIndicator` |
