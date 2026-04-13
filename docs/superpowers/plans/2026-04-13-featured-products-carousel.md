# Featured Products Carousel Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Framer Motion drag carousel with a native CSS scroll-snap carousel, add full-height image overlay arrow panels, shrink cards via section padding, and show the price panel always on mobile.

**Architecture:** The hook loses all motion values and gains a `handleScroll` debounce that snaps to page boundaries; `index.tsx` swaps the motion track for a plain scroll container with CSS snap; `ProductCard` gets full-height side panels (CSS group-hover on desktop, always visible on mobile) and a static mobile price panel alongside the existing animated desktop one.

**Tech Stack:** Next.js, React, Tailwind CSS, Framer Motion (retained in ProductCard only), Lucide icons

---

## File Map

| File | What changes |
|------|-------------|
| `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts` | Remove `useMotionValue`/`animate`/`x`/`handleDragEnd`; add `scrollDebounceRef`, `handleScroll`, update `snapTo` |
| `app/components/FeaturedProductsSection/index.tsx` | Add section padding wrapper, replace `motion.div` track with plain scroll div, wire `handleScroll`, remove `x`/drag props |
| `app/components/FeaturedProductsSection/ProductCard.tsx` | Add `group` class, replace chevron buttons with full-height overlay panels, add mobile-only price panel |

---

## Task 1 — Refactor `useProductCarousel.ts`

**Files:**
- Modify: `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts`

- [ ] **Step 1: Replace the file contents**

```ts
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PRODUCTS, CARD_GAP, PEEK_AMOUNT } from "../constants";

const MOBILE_BREAKPOINT = 640;

export function useProductCarousel() {
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [pageCount, setPageCount] = useState(2);

  const cardWidthRef = useRef(0);
  const visibleCardsRef = useRef(3);
  const pageCountRef = useRef(2);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const isMobile = containerWidth < MOBILE_BREAKPOINT;

      const visible = isMobile ? 1 : 3;
      const pages = PRODUCTS.length / visible;

      const peek = isMobile ? 0 : PEEK_AMOUNT;
      const w = Math.floor((containerWidth - CARD_GAP * (visible - 1) - peek) / visible);

      const layoutChanged = visible !== visibleCardsRef.current;

      cardWidthRef.current = w;
      visibleCardsRef.current = visible;
      pageCountRef.current = pages;

      setCardWidth(w);
      setVisibleCards(visible);
      setPageCount(pages);

      if (layoutChanged) {
        setCurrent(0);
        container.scrollLeft = 0;
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const snapTo = useCallback((pageIndex: number) => {
    const pages = pageCountRef.current;
    const wrapped = ((pageIndex % pages) + pages) % pages;
    containerRef.current?.scrollTo({
      left: wrapped * visibleCardsRef.current * (cardWidthRef.current + CARD_GAP),
      behavior: "smooth",
    });
    setCurrent(wrapped);
  }, []);

  // Debounced: after 150 ms of scroll inactivity, snap to the nearest page boundary.
  // This corrects any mid-page positions from manual swipes on desktop.
  const handleScroll = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const page = Math.round(
        container.scrollLeft / (visibleCardsRef.current * (cardWidthRef.current + CARD_GAP))
      );
      const clamped = Math.max(0, Math.min(page, pageCountRef.current - 1));
      setCurrent(clamped);
      container.scrollTo({
        left: clamped * visibleCardsRef.current * (cardWidthRef.current + CARD_GAP),
        behavior: "smooth",
      });
    }, 150);
  }, []);

  const prev = useCallback(() => snapTo(current - 1), [current, snapTo]);
  const next = useCallback(() => snapTo(current + 1), [current, snapTo]);

  return { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/madschristiansen/Desktop/skrivebord/kea/4SEM/9t7/9tseven-website
npx tsc --noEmit 2>&1 | grep useProductCarousel
```

Expected: no output (no errors in this file).

- [ ] **Step 3: Commit**

```bash
git add app/components/FeaturedProductsSection/hooks/useProductCarousel.ts
git commit -m "refactor: replace motion-based carousel with native scroll-snap hook"
```

---

## Task 2 — Update `index.tsx`

**Files:**
- Modify: `app/components/FeaturedProductsSection/index.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import ProductCard from "./ProductCard";
import ProductCarouselIndicator from "./ProductCarouselIndicator";
import { useProductCarousel } from "./hooks/useProductCarousel";
import { PRODUCTS, CARD_GAP } from "./constants";

export default function FeaturedProductsSection() {
  const { current, cardWidth, pageCount, containerRef, handleScroll, prev, next } =
    useProductCarousel();

  return (
    <section data-nav-theme="light" className="w-full bg-white py-8 select-none">
      {/* Section label */}
      <p className="text-[9px] tracking-[0.25em] uppercase text-black/40 text-center mb-9">
        ( FEATURED PRODUCTS )
      </p>

      {/* Padding wrapper — shrinks the card area away from viewport edges */}
      <div className="w-full px-6 md:px-16">
        {/* Native scroll container */}
        <div
          ref={containerRef}
          className="w-full overflow-x-scroll [&::-webkit-scrollbar]:hidden"
          style={
            {
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
            } as React.CSSProperties
          }
          onScroll={handleScroll}
        >
          <div className="flex" style={{ gap: CARD_GAP }}>
            {PRODUCTS.map((product) => (
              <div key={product.id} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
                <ProductCard product={product} cardWidth={cardWidth} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} />

      {/* Footer link */}
      <div className="text-center mt-8">
        <button className="text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors duration-200 border-b border-black/20 pb-px">
          VIEW ALL PRODUCTS
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "index.tsx"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/components/FeaturedProductsSection/index.tsx
git commit -m "feat: add section padding and wire native scroll container in FeaturedProductsSection"
```

---

## Task 3 — Update `ProductCard.tsx` — overlay panels + mobile price

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
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

  return (
    <div
      className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group"
      style={{ width: cardWidth, aspectRatio: "3 / 4" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image with slide animation */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={imgIndex}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: dir * (cardWidth || 300) }),
            center: { x: 0 },
            exit: (dir: number) => ({ x: -dir * (cardWidth || 300) }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.9 }}
          className="absolute inset-0"
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <Image
            src={images[imgIndex]}
            alt={product.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* New Arrival tag */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
        <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">
          New Arrival
        </span>
      </div>

      {/* Full-height overlay arrow panels
          Mobile:  always visible at bg-black/10 (no hover needed)
          Desktop: hidden until the card (group) is hovered; panel hover darkens to bg-black/20 */}
      {hasMultiple && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-[22%] z-10
                       flex items-center justify-center
                       bg-black/10
                       md:bg-transparent md:opacity-0
                       md:group-hover:opacity-100 md:hover:bg-black/20
                       transition-all duration-200 cursor-pointer"
            onClick={prevImage}
            role="button"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} strokeWidth={1.25} className="text-white drop-shadow" />
          </div>
          <div
            className="absolute right-0 top-0 bottom-0 w-[22%] z-10
                       flex items-center justify-center
                       bg-black/10
                       md:bg-transparent md:opacity-0
                       md:group-hover:opacity-100 md:hover:bg-black/20
                       transition-all duration-200 cursor-pointer"
            onClick={nextImage}
            role="button"
            aria-label="Next image"
          >
            <ChevronRight size={18} strokeWidth={1.25} className="text-white drop-shadow" />
          </div>
        </>
      )}

      {/* Mobile: price panel — always visible */}
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden">
        <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">
          {product.category}
        </p>
        <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">
          {product.name}
        </p>
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
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="hidden md:block absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20"
          >
            <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">
              {product.category}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">
              {product.name}
            </p>
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

- [ ] **Step 2: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit 2>&1
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard.tsx
git commit -m "feat: add full-height overlay arrow panels and mobile always-visible price panel"
```

---

## Task 4 — Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and navigate to the section with the product cards.

- [ ] **Step 2: Desktop checks (browser width > 768px)**

| What to check | Expected |
|---------------|----------|
| Cards are noticeably smaller than before | Yes — section has 64px padding each side |
| Cards do not touch viewport edges | Padded gap visible on both sides |
| Prev/next indicator pages through cards | Yes — 3 cards per page |
| Hovering a card reveals the left/right overlay panels | Yes — fade in at low grey opacity |
| Clicking overlay panels switches card image | Yes — slide animation plays |
| No horizontal scrollbar visible | Hidden via CSS |
| Scrolling horizontally with trackpad/mouse snaps to page boundary | Yes — after 150 ms debounce |

- [ ] **Step 3: Mobile checks (browser width < 640px)**

| What to check | Expected |
|---------------|----------|
| One card visible at a time, with padding on both sides | Yes |
| Left/right overlay panels always visible at low opacity | Yes — no hover needed |
| Price/name panel always visible at card bottom | Yes — no hover needed |
| Swiping left/right scrolls carousel natively | Yes — native touch scroll |
| After swipe, carousel snaps to a card boundary | Yes — debounce corrects position |

- [ ] **Step 4: Fix any issues found, then commit**

```bash
git add -p
git commit -m "fix: adjust carousel visual details from manual QA"
```

(Skip this step if no issues found.)
