# Product Card: Aspect Ratio, Image Drag & Progress Bar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change card aspect ratio to 4:5, add mobile swipe-to-cycle-images on product cards, and make the progress bar segments hoverable/clickable.

**Architecture:** Four focused changes across three component files and one hook. The drag implementation uses two rendering modes in `ProductCard` — a manual drag layer (two images controlled by a `useMotionValue`) and the existing `AnimatePresence` layer — switching between them so the two systems never conflict. The progress bar gains a tall hit-zone wrapper around each segment and a new `onGoTo` prop wired through the hook.

**Tech Stack:** Next.js, React, Framer Motion (`motion/react`), Tailwind CSS

---

## File Map

| File | Change |
|---|---|
| `app/components/FeaturedProductsSection/ProductCard.tsx` | Aspect ratio `3/4 → 4/5`; mobile pointer-event drag handlers; dual render mode |
| `app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx` | Hit-zone wrapper button, hover grow effect, `onGoTo` prop |
| `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts` | Export `snapTo` |
| `app/components/FeaturedProductsSection/index.tsx` | Pass `onGoTo={snapTo}` to indicator |

---

## Task 1: Aspect Ratio

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard.tsx:38`

- [ ] **Step 1: Change the aspect ratio**

In [ProductCard.tsx:38](app/components/FeaturedProductsSection/ProductCard.tsx#L38), change the inline style on the root `<div>`:

```tsx
// Before
style={{ width: cardWidth, aspectRatio: "3 / 4" }}

// After
style={{ width: cardWidth, aspectRatio: "4 / 5" }}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Scroll to the Featured Products section. The cards should be visibly shorter/wider than before. Confirm images still fill the card with `object-cover`.

- [ ] **Step 3: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard.tsx
git commit -m "feat: change product card aspect ratio to 4:5"
```

---

## Task 2: Progress Bar — Hit Zone, Hover Effect, Click Navigation

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx`

- [ ] **Step 1: Replace the segment `<div>` with a full new implementation**

Replace the entire file content with:

```tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselIndicatorProps {
  current: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export default function ProductCarouselIndicator({ current, pageCount, onPrev, onNext, onGoTo }: ProductCarouselIndicatorProps) {
  return (
    <div className="flex justify-end pr-[5%] mt-5 w-full">
      <div className="w-1/4 min-w-40">
        {/* Segmented progress bar */}
        <div className="flex gap-1 w-full">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className="flex-1 h-5 flex items-end group"
              aria-label={`Go to page ${i + 1}`}
            >
              <div
                className="w-full h-px group-hover:h-[5px] transition-all duration-200"
                style={{
                  backgroundColor: i === current ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.15)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Counter + arrows */}
        <div className="flex items-center justify-between mt-2.5 pointer-events-auto">
          <span className="text-[0.65rem] tracking-[0.2em] tabular-nums text-black/40">
            {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
            {String(pageCount).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onPrev} aria-label="Previous product" className="text-black/30 hover:text-black transition-colors duration-200">
              <ChevronLeft size={13} strokeWidth={1.25} />
            </button>
            <button onClick={onNext} aria-label="Next product" className="text-black/30 hover:text-black transition-colors duration-200">
              <ChevronRight size={13} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in the browser**

The indicator will have a TypeScript error until Task 3 passes `onGoTo`. For now, check that the file compiles without syntax errors:

```bash
npx tsc --noEmit
```

Expected: an error about `onGoTo` missing at the call site in `index.tsx` — that is expected and will be fixed in Task 3. No other errors.

---

## Task 3: Wire `onGoTo` Through the Hook

**Files:**
- Modify: `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts:95`
- Modify: `app/components/FeaturedProductsSection/index.tsx:9`

- [ ] **Step 1: Export `snapTo` from the hook**

In `useProductCarousel.ts`, `snapTo` is already defined at line 63. Change the return statement at line 95:

```ts
// Before
return { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next };

// After
return { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next, snapTo };
```

- [ ] **Step 2: Pass `onGoTo` in `FeaturedProductsSection`**

In `index.tsx`, destructure `snapTo` and pass it to the indicator:

```tsx
// Before
const { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next } =
  useProductCarousel();

// After
const { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next, snapTo } =
  useProductCarousel();
```

And update the `ProductCarouselIndicator` usage:

```tsx
// Before
<ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} />

// After
<ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} onGoTo={snapTo} />
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Verify in the browser**

In the Featured Products section, hover the progress bar segments — they should grow upward to 5px. Click any segment — the carousel should jump to that page.

- [ ] **Step 5: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx \
        app/components/FeaturedProductsSection/hooks/useProductCarousel.ts \
        app/components/FeaturedProductsSection/index.tsx
git commit -m "feat: progress bar click-to-navigate and hover grow effect"
```

---

## Task 4: Mobile Image Drag

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard.tsx`

This task adds mobile-only swipe-to-cycle-images. The approach uses two rendering modes:

- **Normal mode** (`isDragMode = false`): the existing `AnimatePresence` layer handles all image transitions. Used for arrow button clicks and after a drag completes.
- **Drag mode** (`isDragMode = true`): two plain `motion.div`s rendered outside `AnimatePresence`, both driven by the `dragX` motion value. The current image is at `x = dragX`, the peek image is at `x = dragX + peekDir * cardWidth`. `AnimatePresence` is hidden via `pointer-events-none opacity-0` so it doesn't flash.

On commit (drag ≥ 40px threshold):
1. Animate `dragX` to `peekDir * -cardWidth` to complete the slide (current image off, peek image fully in).
2. In `onComplete`: reset `dragX` to 0, switch off drag mode, update `imgIndex`. The incoming `AnimatePresence` image uses `skipEnterAnim` ref to enter at `x: 0` with no slide-in animation — seamlessly matching the peek image that just animated to position 0.

On snap-back (drag < 40px threshold):
1. Animate `dragX` back to 0.
2. Switch off drag mode immediately — the current image in `AnimatePresence` at `x: 0` matches the snap-back position.

- [ ] **Step 1: Replace the entire `ProductCard.tsx` with the new implementation**

```tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "./constants";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

export default function ProductCard({ product, cardWidth }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Drag state
  const [isDragMode, setIsDragMode] = useState(false);
  const [peekIdx, setPeekIdx] = useState(0);
  const [peekDir, setPeekDir] = useState<1 | -1>(1);
  const dragX = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const skipEnterAnim = useRef(false);

  const images = product.images as readonly string[];
  const hasMultiple = images.length > 1;

  const prevImage = (e: React.MouseEvent) => {
    if (isAnimating) return;
    e.stopPropagation();
    setDirection(-1);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    if (isAnimating) return;
    e.stopPropagation();
    setDirection(1);
    setImgIndex((i) => (i + 1) % images.length);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (window.innerWidth >= 640 || !hasMultiple || isAnimating || isDragMode) return;
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    dragX.set(delta);

    // Start drag mode on first meaningful movement
    if (!isDragMode && Math.abs(delta) > 4) {
      const dir = delta < 0 ? 1 : -1;
      const peek = dir === 1
        ? (imgIndex + 1) % images.length
        : (imgIndex - 1 + images.length) % images.length;
      setPeekDir(dir as 1 | -1);
      setPeekIdx(peek);
      setIsDragMode(true);
    }

    e.stopPropagation();
  };

  const commitDrag = (dir: 1 | -1) => {
    const newIndex = dir === 1
      ? (imgIndex + 1) % images.length
      : (imgIndex - 1 + images.length) % images.length;

    animate(dragX, dir * -cardWidth, {
      type: "tween",
      duration: 0.18,
      ease: "easeOut",
      onComplete: () => {
        skipEnterAnim.current = true;
        dragX.set(0);
        setDirection(dir);
        setImgIndex(newIndex);
        setIsDragMode(false);
      },
    });
  };

  const snapBack = () => {
    setIsDragMode(false);
    animate(dragX, 0, { type: "spring", stiffness: 400, damping: 40 });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.stopPropagation();

    const delta = dragX.get();
    if (Math.abs(delta) >= 40) {
      commitDrag(delta < 0 ? 1 : -1);
    } else {
      snapBack();
    }
  };

  return (
    <div
      className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group"
      style={{ width: cardWidth, aspectRatio: "4 / 5" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── Drag mode: two manually positioned images ── */}
      {isDragMode && (
        <>
          <motion.div className="absolute inset-0" style={{ x: dragX }}>
            <Image src={images[imgIndex]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            style={{ x: dragX }}
            initial={{ x: peekDir * cardWidth }}
            animate={false}
          >
            <Image src={images[peekIdx]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
        </>
      )}

      {/* ── Normal mode: AnimatePresence slide ── */}
      <div className={isDragMode ? "opacity-0 pointer-events-none" : ""}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={imgIndex}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: skipEnterAnim.current ? 0 : dir * (cardWidth || 300),
              }),
              center: { x: 0 },
              exit: (dir: number) => ({ x: -dir * (cardWidth || 300) }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.9 }}
            className="absolute inset-0"
            onAnimationStart={() => {
              skipEnterAnim.current = false;
              setIsAnimating(true);
            }}
            onAnimationComplete={() => setIsAnimating(false)}
          >
            <Image src={images[imgIndex]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* New Arrival tag */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
        <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
      </div>

      {/* Full-height overlay arrow panels
          Mobile:  always visible at bg-black/10 (no hover needed)
          Desktop: hidden until the card (group) is hovered; panel hover darkens to bg-black/20 */}
      {hasMultiple && (
        <>
          <button
            className="absolute left-0 top-0 bottom-0 w-[15%] z-10
                       flex items-center justify-center
                       bg-black/10
                       md:bg-transparent md:opacity-0
                       md:group-hover:opacity-100 md:hover:bg-black/10
                       focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:-outline-offset-2
                       transition-all duration-200"
            onClick={prevImage}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Previous image"
          >
            <ChevronLeft size={18} strokeWidth={1.25} className="text-white drop-shadow" />
          </button>
          <button
            className="absolute right-0 top-0 bottom-0 w-[15%] z-10
                       flex items-center justify-center
                       bg-black/10
                       md:bg-transparent md:opacity-0
                       md:group-hover:opacity-100 md:hover:bg-black/10
                       focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:-outline-offset-2
                       transition-all duration-200"
            onClick={nextImage}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Next image"
          >
            <ChevronRight size={18} strokeWidth={1.25} className="text-white drop-shadow" />
          </button>
        </>
      )}

      {/* Mobile: price panel — always visible */}
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden">
        <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
        <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">{product.name}</p>
        <p className="text-[9px] text-black/60 mt-1">
          DKK{" "}
          {product.price.toLocaleString("da-DK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Desktop: price panel — animated on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="hidden md:block absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20">
            <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">{product.name}</p>
            <p className="text-[9px] text-black/60 mt-1">
              DKK{" "}
              {product.price.toLocaleString("da-DK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Fix the peek image positioning**

The peek image's initial position is set via `initial` on its `motion.div`. However, `motion/react` `initial` on a `motion.div` with `animate={false}` doesn't update when `peekDir` changes mid-drag. Replace the peek image `motion.div` with a plain `div` using an inline style instead:

Find the peek image block (the second motion.div inside the `{isDragMode && ...}` block) and replace it:

```tsx
// Replace this:
<motion.div
  className="absolute inset-0"
  style={{ x: dragX }}
  initial={{ x: peekDir * cardWidth }}
  animate={false}
>
  <Image src={images[peekIdx]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
</motion.div>

// With this (plain div, transform computed from dragX inline):
<PeekImage
  src={images[peekIdx]}
  name={product.name}
  dragX={dragX}
  peekDir={peekDir}
  cardWidth={cardWidth}
/>
```

And add this helper component at the top of the file, outside `ProductCard`:

```tsx
import { useTransform } from "motion/react";
import type { MotionValue } from "motion/react";

function PeekImage({ src, name, dragX, peekDir, cardWidth }: {
  src: string;
  name: string;
  dragX: MotionValue<number>;
  peekDir: 1 | -1;
  cardWidth: number;
}) {
  const x = useTransform(dragX, (v) => v + peekDir * cardWidth);
  return (
    <motion.div className="absolute inset-0" style={{ x }}>
      <Image src={src} alt={name} fill className="object-cover pointer-events-none" draggable={false} />
    </motion.div>
  );
}
```

This keeps the peek image always at `dragX + peekDir * cardWidth` via a derived motion value — no re-renders when dragging.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test on mobile viewport**

In the browser, open DevTools → toggle device toolbar → select a mobile device (e.g. iPhone 12, 390px wide).

Check:
- Swipe left on a card image → current image slides left, next image peeks from right → on release past midpoint, slide completes
- Swipe right → previous image
- Short swipe (< 40px) → snaps back with no image change
- Arrow buttons still work
- The outer carousel dot indicators still navigate between products correctly
- On desktop (no device emulation): drag on a card does NOT cycle images; outer scroll still works; arrow buttons on hover still cycle images

- [ ] **Step 5: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard.tsx
git commit -m "feat: add mobile swipe-to-cycle-images on product cards"
```
