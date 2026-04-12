# Featured Products Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `FeaturedProductsSection` component — a swipeable, wrapping product carousel with a segmented progress indicator and per-card hover info panels — and mount it on the homepage after `ManifestoSection`.

**Architecture:** A dedicated `useProductCarousel` hook owns all drag/snap/wrap state and exposes `x` (MotionValue), `current`, `cardWidth`, `containerRef`, `handleDragEnd`, `prev`, and `next`. The section shell composes `ProductCard` and `ProductCarouselIndicator` using those values. No state lives in the section component itself.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, motion/react (motion values + spring animation + drag), lucide-react (ChevronLeft, ChevronRight)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/components/FeaturedProductsSection/constants.ts` | PRODUCTS array + layout constants |
| Create | `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts` | All carousel state: card width, drag, snap, wrap |
| Create | `app/components/FeaturedProductsSection/ProductCard.tsx` | Grey placeholder card + animated hover info panel |
| Create | `app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx` | Segmented bar + counter + prev/next arrows |
| Create | `app/components/FeaturedProductsSection/index.tsx` | Section shell — composes all parts |
| Modify | `app/page.tsx` | Mount `<FeaturedProductsSection />` after `<ManifestoSection />` |

---

## Task 1: Constants

**Files:**
- Create: `app/components/FeaturedProductsSection/constants.ts`

- [ ] **Step 1: Create the constants file**

```ts
export const PRODUCTS = [
  { id: 0, category: "Apparel",     name: "Product Name", price: 699 },
  { id: 1, category: "Apparel",     name: "Product Name", price: 699 },
  { id: 2, category: "Accessories", name: "Product Name", price: 499 },
  { id: 3, category: "Accessories", name: "Product Name", price: 499 },
] as const;

export type Product = (typeof PRODUCTS)[number];

/** px gap between cards */
export const CARD_GAP = 16;

/** px of the next card that peeks at the right edge */
export const PEEK_AMOUNT = 40;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 2: `useProductCarousel` hook

**Files:**
- Create: `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts`

- [ ] **Step 1: Create the hook**

```ts
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "motion/react";
import { PRODUCTS, CARD_GAP, PEEK_AMOUNT } from "../constants";

export function useProductCarousel() {
  const [current, setCurrent] = useState(0);
  const cardWidthRef = useRef(0);
  const [cardWidth, setCardWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      // Two full cards + one gap + one peek = container width
      const w = Math.floor((container.offsetWidth - CARD_GAP - PEEK_AMOUNT) / 2);
      cardWidthRef.current = w;
      setCardWidth(w);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const snapTo = useCallback(
    (index: number) => {
      // Wrap: always land on a valid index 0–3
      const wrapped = ((index % PRODUCTS.length) + PRODUCTS.length) % PRODUCTS.length;
      animate(x, -wrapped * (cardWidthRef.current + CARD_GAP), {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(wrapped);
    },
    [x],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = cardWidthRef.current * 0.2;
      const { x: offsetX } = info.offset;
      const { x: velX } = info.velocity;

      if (offsetX < -threshold || velX < -400) {
        snapTo(current + 1);
      } else if (offsetX > threshold || velX > 400) {
        snapTo(current - 1);
      } else {
        snapTo(current);
      }
    },
    [current, snapTo],
  );

  const prev = useCallback(() => snapTo(current - 1), [current, snapTo]);
  const next = useCallback(() => snapTo(current + 1), [current, snapTo]);

  return { current, cardWidth, containerRef, x, handleDragEnd, prev, next };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 3: `ProductCard` component

**Files:**
- Create: `app/components/FeaturedProductsSection/ProductCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "./constants";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

export default function ProductCard({ product, cardWidth }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer"
      style={{ width: cardWidth, aspectRatio: "3 / 4" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/[0.08]"
          >
            <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">
              {product.category}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">
              {product.name}
            </p>
            <p className="text-[9px] text-black/60 mt-1">
              DKK {product.price.toLocaleString("da-DK")},00
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 4: `ProductCarouselIndicator` component

**Files:**
- Create: `app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS } from "./constants";

interface ProductCarouselIndicatorProps {
  current: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function ProductCarouselIndicator({
  current,
  onPrev,
  onNext,
}: ProductCarouselIndicatorProps) {
  return (
    <div className="flex justify-end pr-[5%] mt-5 w-full">
      <div className="w-1/4 min-w-[160px]">
        {/* Segmented progress bar — dark-on-light, mirrors HeroSection's SlideIndicator */}
        <div className="flex gap-1 w-full">
          {PRODUCTS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-px transition-colors duration-300"
              style={{
                backgroundColor:
                  i === current ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>

        {/* Counter + arrows */}
        <div className="flex items-center justify-between mt-2.5 pointer-events-auto">
          <span className="text-[0.65rem] tracking-[0.2em] tabular-nums text-black/40">
            {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
            {String(PRODUCTS.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              aria-label="Previous product"
              className="text-black/30 hover:text-black transition-colors duration-200"
            >
              <ChevronLeft size={13} strokeWidth={1.25} />
            </button>
            <button
              onClick={onNext}
              aria-label="Next product"
              className="text-black/30 hover:text-black transition-colors duration-200"
            >
              <ChevronRight size={13} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 5: `FeaturedProductsSection` shell

**Files:**
- Create: `app/components/FeaturedProductsSection/index.tsx`

- [ ] **Step 1: Create the section component**

```tsx
"use client";

import { motion } from "motion/react";
import ProductCard from "./ProductCard";
import ProductCarouselIndicator from "./ProductCarouselIndicator";
import { useProductCarousel } from "./hooks/useProductCarousel";
import { PRODUCTS, CARD_GAP } from "./constants";

export default function FeaturedProductsSection() {
  const { current, cardWidth, containerRef, x, handleDragEnd, prev, next } =
    useProductCarousel();

  return (
    <section data-nav-theme="light" className="w-full bg-white pt-16 pb-12 select-none">
      {/* Section label */}
      <p className="text-[9px] tracking-[0.25em] uppercase text-black/40 text-center mb-9">
        ( FEATURED PRODUCTS )
      </p>

      {/* Carousel viewport — overflow clips the track */}
      <div ref={containerRef} className="w-full overflow-hidden">
        <motion.div
          className="flex"
          style={{
            x,
            gap: CARD_GAP,
            willChange: "transform",
            cursor: "grab",
          }}
          drag="x"
          dragConstraints={{
            left: -(PRODUCTS.length - 1) * (cardWidth + CARD_GAP),
            right: 0,
          }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: "grabbing" }}
        >
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} cardWidth={cardWidth} />
          ))}
        </motion.div>
      </div>

      {/* Progress indicator */}
      <ProductCarouselIndicator current={current} onPrev={prev} onNext={next} />

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

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 6: Mount on homepage + browser verification

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import and mount the section**

Replace the entire contents of `app/page.tsx` with:

```tsx
import HeroSection from "./components/HeroSection";
import ManifestoSection from "./components/ManifestoSection";
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

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000` with no compilation errors in the terminal

- [ ] **Step 3: Verify the section renders**

Open `http://localhost:3000` and scroll past the Manifesto section. Check:
- White section with `( FEATURED PRODUCTS )` label at the top
- Two grey cards visible with a sliver of a third peeking on the right
- Segmented progress bar bottom-right showing `01 / 04`

- [ ] **Step 4: Verify navigation**

Click the `›` arrow. Check:
- Track animates one card-width to the left with a spring bounce
- Progress bar segment advances to position 2, counter shows `02 / 04`
- Click `›` three more times — on the fourth click (past card 4) it wraps back to `01 / 04`
- Click `‹` from position 1 — wraps to `04 / 04`

- [ ] **Step 5: Verify drag / swipe**

Drag the track left past ~20% of a card width and release. Check:
- Snaps to the next card with spring animation
- Does not get stuck at the last card — dragging left wraps to card 1

- [ ] **Step 6: Verify hover info panel**

Hover over either visible card. Check:
- Info panel animates up from the bottom of the card
- Panel is inset from all card edges (does not touch any border)
- Shows category, "Product Name", and `DKK 499,00` or `DKK 699,00`
- Panel disappears when the cursor leaves the card

- [ ] **Step 7: Final TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors
