# Hero Indicator Preview & Auto-Slide Design

**Date:** 2026-04-19

## Overview

Two features added to the hero carousel:

1. **Thumbnail previews** on slide indicator hover — desktop only
2. **Auto-slide** every 5 seconds — all screens, pauses on desktop hover, resets on any manual navigation

---

## Feature Scope

| Feature | Mobile | Desktop |
|---|---|---|
| Auto-slide (5s interval) | Yes | Yes |
| Reset timer on manual nav | Yes | Yes |
| Pause timer on hover | No | Yes |
| Thumbnail preview on indicator hover | No | Yes |

---

## Architecture

### 1. New hook: `useAutoSlide`

**File:** `app/components/HeroSection/hooks/useAutoSlide.ts`

**Interface:**
```ts
function useAutoSlide(options: {
  next: () => void;
  isPaused: boolean;
}): { reset: () => void }
```

**Behaviour:**
- Starts a 5-second `setInterval` that calls `next()`.
- When `isPaused` becomes `true`, clears the interval and does not restart until `isPaused` is `false` again.
- `reset()` clears and immediately restarts the interval — used to prevent auto-advance right after a manual interaction.
- Implemented with `useEffect` + `useRef` to hold the interval ID across renders without stale closures.

---

### 2. Wiring in `HeroSection` (`index.tsx`)

**Changes:**
- Add `isHovered` boolean state, toggled by `onMouseEnter` / `onMouseLeave` on the `<section>` element.
- Call `useAutoSlide({ next: wrappedNext, isPaused: isHovered })`.
- Wrap `prev`, `next`, and `goTo` from `useSlider` to call `reset()` before delegating to the original — this is what resets the timer on manual navigation.
- Pass the wrapped functions to `SlideIndicator` in place of the originals.

**No changes** to `useSlider`, `Slide`, or `HeroOverlayText`.

---

### 3. Thumbnail previews in `SlideIndicator`

**File:** `app/components/HeroSection/SlideIndicator.tsx`

**Changes:**
- Track `hoveredIndex: number | null` with `useState` locally.
- On each segment `<button>`, add `onMouseEnter={() => setHoveredIndex(i)}` and `onMouseLeave={() => setHoveredIndex(null)}`.
- When `hoveredIndex === i`, render a thumbnail above the segment:
  - Same flex-width as the segment (no extra sizing needed — it's a sibling in a flex column).
  - A 1px white line on top (`rgba(255,255,255,0.35)`).
  - A `<img>` or `<Image>` using `SLIDES[i].image` (the `.webp` fallback — used even for the video slide).
  - The segment bar itself acts as the bottom frame.
  - Opacity-based CSS transition for fade in/out (`opacity-0` → `opacity-100`).
- The entire thumbnail block is wrapped in `hidden md:flex` (or `md:block`) so it never renders on mobile.

**No new props** — `SlideIndicator`'s interface is unchanged.

---

## Key Decisions

- **Video slide thumbnail:** uses `SLIDES[i].image` (`.webp` fallback) — no video element in the preview.
- **Pause scope:** `onMouseEnter`/`onMouseLeave` on the `<section>` (full hero), not just the indicator — consistent with the agreed behaviour.
- **Desktop-only gating:** Tailwind responsive prefix (`md:`) for thumbnail markup; hover pause is naturally desktop-only since `mouseleave` does not fire on touch.
- **Timer reset trigger:** wrapping `prev`/`next`/`goTo` in `HeroSection` — avoids coupling `useSlider` to auto-slide concerns.
