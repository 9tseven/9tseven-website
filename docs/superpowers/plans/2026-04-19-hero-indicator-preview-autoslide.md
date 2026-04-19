# Hero Indicator Preview & Auto-Slide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-segment thumbnail previews on indicator hover (desktop only) and an auto-slide timer (all screens) that pauses on desktop hover and resets on manual navigation.

**Architecture:** A new `useAutoSlide` hook owns the 5-second timer and exposes a `reset()` function. `HeroSection/index.tsx` wires auto-slide and hover-pause state, wrapping `useSlider`'s nav functions to call `reset()` on manual interaction. `SlideIndicator` gains local hover state to show per-segment image thumbnails on desktop.

**Tech Stack:** React hooks (`useEffect`, `useRef`, `useState`), Tailwind CSS responsive prefixes (`md:`), Next.js `<Image>`, existing `motion/react` spring animation (untouched).

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| **Create** | `app/components/HeroSection/hooks/useAutoSlide.ts` | 5-second timer, pause, reset |
| **Modify** | `app/components/HeroSection/index.tsx` | Wire auto-slide, hover pause, wrap nav fns |
| **Modify** | `app/components/HeroSection/SlideIndicator.tsx` | Per-segment hover thumbnails (desktop only) |

---

## Task 1: Create `useAutoSlide` hook

**Files:**
- Create: `app/components/HeroSection/hooks/useAutoSlide.ts`

- [ ] **Step 1: Create the hook file**

```ts
// app/components/HeroSection/hooks/useAutoSlide.ts
"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSlideOptions {
  next: () => void;
  isPaused: boolean;
  intervalMs?: number;
}

export function useAutoSlide({ next, isPaused, intervalMs = 5000 }: UseAutoSlideOptions) {
  const nextRef = useRef(next);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref fresh so interval always calls the latest `next`
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    intervalRef.current = setInterval(() => {
      nextRef.current();
    }, intervalMs);
  }, [clear, intervalMs]);

  const reset = useCallback(() => {
    if (!isPaused) start();
  }, [isPaused, start]);

  useEffect(() => {
    if (isPaused) {
      clear();
    } else {
      start();
    }
    return clear;
  }, [isPaused, start, clear]);

  return { reset };
}
```

- [ ] **Step 2: Verify the file was created cleanly**

Run: `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/HeroSection/hooks/useAutoSlide.ts
git commit -m "feat: add useAutoSlide hook with pause and reset support"
```

---

## Task 2: Wire auto-slide and hover pause into `HeroSection`

**Files:**
- Modify: `app/components/HeroSection/index.tsx`

- [ ] **Step 1: Add hover state, import hook, wrap nav functions**

Replace the content of `app/components/HeroSection/index.tsx` with:

```tsx
"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Slide from "./Slide";
import SlideIndicator from "./SlideIndicator";
import HeroOverlayText from "./HeroOverlayText";
import { useSlider } from "./hooks/useSlider";
import { useAutoSlide } from "./hooks/useAutoSlide";
import { SLIDES } from "./constants";

export default function HeroSection() {
  const { current, slideWidth, containerRef, x, handleDragEnd, prev, next, goTo } = useSlider();
  const [isHovered, setIsHovered] = useState(false);

  const { reset } = useAutoSlide({ next, isPaused: isHovered });

  const handlePrev = useCallback(() => {
    reset();
    prev();
  }, [reset, prev]);

  const handleNext = useCallback(() => {
    reset();
    next();
  }, [reset, next]);

  const handleGoTo = useCallback(
    (index: number) => {
      reset();
      goTo(index);
    },
    [reset, goTo],
  );

  return (
    <section
      data-nav-theme="dark"
      className="relative w-full h-screen overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Filmstrip container */}
      <div ref={containerRef} className="w-full h-full">
        <motion.div
          className="flex h-full"
          style={{
            x,
            width: `${SLIDES.length * 100}%`,
            cursor: "grab",
            willChange: "transform",
          }}
          drag="x"
          dragConstraints={{
            left: -(SLIDES.length - 1) * slideWidth,
            right: 0,
          }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            reset();
            handleDragEnd(e, info);
          }}
          whileDrag={{ cursor: "grabbing" }}
        >
          {SLIDES.map((slide) => (
            <Slide
              key={slide.id}
              id={slide.id}
              bg={slide.bg}
              accent={slide.accent}
              image={slide.image}
              video={"video" in slide ? slide.video : undefined}
              slideCount={SLIDES.length}
            />
          ))}
        </motion.div>
      </div>

      {/* Logo — centered bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-17 md:w-25">
        <Image src="/Logo/9t7.svg" alt="9TSEVEN" width={500} height={500} className="w-full h-auto" priority />
      </div>

      <HeroOverlayText current={current} />

      <SlideIndicator current={current} onPrev={handlePrev} onNext={handleNext} onGoTo={handleGoTo} />
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 3: Start dev server and verify auto-slide**

Run: `npm run dev`

Open the site in a browser. Watch the hero — it should advance to the next slide automatically every 5 seconds. Clicking an arrow or an indicator should reset the 5-second countdown (the slide should not auto-advance for another 5 seconds after any manual interaction). Hovering anywhere over the hero should freeze the timer; moving the mouse away should resume it.

- [ ] **Step 4: Commit**

```bash
git add app/components/HeroSection/index.tsx
git commit -m "feat: wire auto-slide and hover-pause into HeroSection"
```

---

## Task 3: Add per-segment thumbnail previews to `SlideIndicator`

**Files:**
- Modify: `app/components/HeroSection/SlideIndicator.tsx`

- [ ] **Step 1: Add hover state and thumbnail markup**

Replace the content of `app/components/HeroSection/SlideIndicator.tsx` with:

```tsx
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SLIDES } from "./constants";

interface SlideIndicatorProps {
  current: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export default function SlideIndicator({ current, onPrev, onNext, onGoTo }: SlideIndicatorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="absolute bottom-8 right-8 w-1/4 z-10 pointer-events-none">
      {/* Segmented progress bar */}
      <div className="flex gap-1 w-full pointer-events-auto">
        {SLIDES.map((slide, i) => (
          <button
            type="button"
            key={i}
            onClick={() => {
              if (i !== current) onGoTo(i);
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex-1 flex flex-col items-stretch group"
            aria-label={`Go to slide ${i + 1}`}
          >
            {/* Thumbnail — desktop only, shown on hover */}
            <div className="hidden md:block">
              <div
                className="w-full overflow-hidden transition-[opacity,max-height] duration-200 ease-in-out"
                style={{
                  maxHeight: hoveredIndex === i ? "120px" : "0px",
                  opacity: hoveredIndex === i ? 1 : 0,
                }}
              >
                {/* Top framing line */}
                <div
                  className="w-full h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
                />
                {/* Thumbnail image */}
                <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={slide.image}
                    alt={`Slide ${i + 1} preview`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 5vw, 0px"
                  />
                </div>
              </div>
            </div>

            {/* Segment bar (acts as bottom frame when thumbnail is visible) */}
            <div className="h-5 flex items-end">
              <div
                className="w-full h-px group-hover:h-1.25 [transition:height_200ms_ease,background-color_300ms_ease]"
                style={{
                  backgroundColor: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)",
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Counter + arrows */}
      <div className="flex items-center justify-between mt-4 pointer-events-auto">
        <span className="font-mono text-white/40 text-[0.65rem] tracking-[0.2em] tabular-nums">
          {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
          {String(SLIDES.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={onPrev} aria-label="Previous slide" className="text-white/40 hover:text-white transition-colors duration-200">
            <ChevronLeft size={13} strokeWidth={1.25} />
          </button>
          <button onClick={onNext} aria-label="Next slide" className="text-white/40 hover:text-white transition-colors duration-200">
            <ChevronRight size={13} strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 3: Verify in browser on desktop**

With the dev server running, hover over each indicator segment. Verify:
- A thumbnail fades in above the hovered segment, flush with the segment bar.
- A thin white line appears on top of the thumbnail (top frame).
- The segment bar below acts as the bottom frame.
- No thumbnail appears on mobile (resize browser below `md` breakpoint / 768px).
- The video slide (slide 3) shows its `.webp` image, not a video.
- Hovering an indicator still pauses auto-slide (the hero stops advancing while hovered).

- [ ] **Step 4: Commit**

```bash
git add app/components/HeroSection/SlideIndicator.tsx
git commit -m "feat: add per-segment thumbnail preview to slide indicator (desktop only)"
```
