# Manifesto Section Image Animation Redesign

**Date:** 2026-04-13  
**Status:** Approved  
**Files affected:** `app/components/ManifestoSection/index.tsx`

---

## Problem

The current `ManifestImage` component drives opacity and y-position via `useTransform` tied to `scrollYProgress`. This means:

- Images fade out again when the user scrolls back up (bidirectional transform)
- Motion is linear and directly coupled to scroll speed — no spring physics
- Mobile images have no animation at all

## Goal

Images should animate in naturally once when they enter the viewport, then stay permanently. Consistent behaviour on both desktop and mobile.

---

## Design

### `ManifestImage` component

Replace `useTransform`/`scrollYProgress` with Framer Motion's declarative viewport API:

| Prop | Value |
|------|-------|
| `initial` | `{ opacity: 0, y: 40 }` |
| `whileInView` | `{ opacity: 1, y: 0 }` |
| `viewport` | `{ once: true, amount: 0.3 }` |
| `transition` | `{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.2 }` |

- `once: true` guarantees the animation fires exactly once and the image stays visible
- `amount: 0.3` triggers when 30% of the image is in the viewport
- Stagger is achieved via `delay: index * 0.2` (0s, 0.2s, 0.4s for the three images)
- Easing `[0.25, 0.46, 0.45, 0.94]` is a smooth ease-out (deceleration curve)

Props removed: `scrollYProgress`, `index` (index retained only for the delay calculation).

### `ManifestoSection` — desktop

Remove the `scrollYProgress` prop from the `ManifestImage` calls. The `useScroll` hook and `scrollYProgress` value remain in the section because `ManifestoLine` still depends on them.

### Mobile images (currently unanimated)

Apply the same `whileInView` treatment to the mobile `<div>` elements (change to `motion.div`), using identical `initial`, `whileInView`, `viewport`, and `transition` props with the same stagger delay. Mobile-specific sizing classes are unchanged.

---

## What is not changing

- `ManifestoLine` scroll-based reveal logic is untouched
- `useScroll` / `scrollYProgress` in `ManifestoSection` is untouched
- All layout, sizing, z-index, and rotation values are untouched
- `constants.ts` is untouched
