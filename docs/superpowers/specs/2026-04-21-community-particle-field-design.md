# Community Particle Field — Design

## Overview

A new full-bleed dark section on the community page, placed after the existing
`ImageSection`. It renders a swarm of ~2500 white dots on black that drift
ambiently and, every 10–15 seconds, coalesce briefly into one of five shapes
inspired by physical dot-art reference images provided by the 9t7 team
(feather, waves-burst, diamond, architecture, crescent). On desktop the
cursor physically displaces particles; on mobile an "autopilot" runs the same
animation with optional tap-to-scatter.

The "individual points forming a collective shape" metaphor is the point of the
section: each dot is a person, together they form something.

## Goals

- A distinctive visual moment on the community page that is inspired by — not
  a literal copy of — the 5 reference photos.
- Feels alive on every device, interactive on desktop, lean-back on mobile.
- Shapes are recognizable when they land, but the section is never a
  slideshow. Most of the time it is quiet ambient drift.
- Ships with no new runtime dependencies; maintainable with the stack already
  in the repo.

## Non-goals

- No audio reactivity.
- No gyroscope / device-orientation input (iOS permission prompt friction).
- No scroll-driven shape timing (scroll only controls the sticky hold, not the
  animation).
- No headline, copy, or content overlays in this section — pure animation.
- No WebGL, no bloom/glow shaders. The reference photos are flat dots on
  black; Canvas 2D matches the aesthetic.

## Placement & Page Integration

- File: `app/community/page.tsx`
- The new section is rendered **after** `<ImageSection />`.
- Before `<ImageSection />` is currently empty and intentionally reserved for
  future content — not part of this spec.
- The existing `AsciiRun` animation inside `ImageSection` is unchanged.
- `ImageSection` has been given `bg-white` on its root `<section>` (separate
  small change, already applied).

```tsx
export default function Community() {
  return (
    <main>
      <ImageSection />
      <ParticleField />
    </main>
  );
}
```

## Section Layout

- Outer wrapper: `height: 200vh`, `background: black`,
  `data-nav-theme="dark"`.
- Inner container: `position: sticky; top: 0; height: 100vh`, contains the
  canvas. Matches the sticky-hold pattern already used by `ImageSection`.
- Canvas fills the sticky container and sizes via `ResizeObserver` with
  `devicePixelRatio` handling for crisp rendering on retina displays.
- Purely visual — no headline, no copy, no CTA inside this section.

## File Layout

```
app/components/CommunitySection/
  ParticleField/
    index.tsx              section wrapper (200vh outer, 100vh sticky inner, dark bg)
    ParticleCanvas.tsx     client component: canvas ref, RAF loop, event listeners
    particleSystem.ts      pure TS: Particle class, field state, update/draw
    shapeCycle.ts          state machine (drift -> form -> hold -> dissolve -> next)
    shapes.ts              imports + exposes the 5 shape target arrays (typed)
    shapes/
      feather.json         [[x, y], ...] in normalized [-1, 1] space
      waves.json
      diamond.json
      architecture.json
      crescent.json
    useInteraction.ts      hook: pointer/touch -> disturbance point

scripts/
  extract-shape-points.ts  offline, run once per reference photo

public/CommunitySection/reference/
  feather.png              source images, kept for re-extraction
  waves.png
  diamond.png
  architecture.png
  crescent.png
```

### Boundaries

- `particleSystem.ts` is pure TypeScript — no React, no DOM. Takes a canvas
  2D context and drives it. Unit-testable.
- `ParticleCanvas.tsx` is the React surface: mounts the canvas, wires up RAF
  and events, passes interaction state into the system.
- `shapeCycle.ts` owns timing and which shape is current — a small state
  machine, independently testable.
- `shapes.ts` is a pure data module — imports the 5 JSONs and exports them
  typed.
- The extraction script lives under `scripts/` and runs offline with `tsx` or
  equivalent — not part of the runtime bundle. Run it once per photo; the
  JSON is checked into the repo.

## Shape Extraction Pipeline

**Input:** one reference image path, one output JSON path, desired point
count (default 2500), brightness threshold (default 180/255).

**Algorithm:**
1. Load image into a pixel buffer (`sharp` is the expected library; confirmed
   at implementation).
2. For each pixel, compute brightness:
   `0.299·R + 0.587·G + 0.114·B`.
3. Keep pixels with brightness above threshold.
4. Cluster adjacent lit pixels into blobs (8-neighbor flood fill). Each blob
   becomes one candidate point at its centroid. This collapses multi-pixel
   dots into single points.
5. Normalize count to target (2500):
   - If `candidates > target`: random-sample down, preserving spatial
     distribution.
   - If `candidates < target`: fill remainder by duplicating existing points
     with small random offsets (keeps the shape, doesn't invent structure).
6. Normalize coordinates to `[-1, 1]` on both axes, centered, aspect-ratio
   preserved.
7. Write JSON:
   ```json
   { "points": [[x, y], ...], "sourceImage": "feather.png", "count": 2500 }
   ```

**Usage:**
```bash
tsx scripts/extract-shape-points.ts \
  --in public/CommunitySection/reference/feather.png \
  --out app/components/CommunitySection/ParticleField/shapes/feather.json \
  --count 2500 \
  --threshold 180
```

**Why the JSON is checked in:** the extraction is deterministic-ish but
depends on threshold and sampling. Checking in the JSON makes the runtime
reproducible, allows hand-editing, and removes image decoding from the build.

**Consistent indexing across shapes:** particle `i` morphs from
`feather[i] → waves[i] → diamond[i] → architecture[i] → crescent[i]`.
Extraction order (flood-fill traversal) is essentially arbitrary, so morphs
look chaotic-but-organic — which is the intent. No sorting step.

## Runtime — Particle System

### Particle state

Each of ~2500 particles holds:
```
position: { x, y }    current, in canvas-pixel space
velocity: { x, y }    carried between frames, damped each step
home:     { x, y }    drift anchor (random at init, stable for session)
```

No per-particle color, size, or lifetime. Uniformity is part of the
aesthetic.

### Update loop (per frame, target 60fps)

For each particle:

1. **Compute target position** based on current cycle phase:
   - `drift` → `target = home + slowNoiseOffset(time, i)` — low-frequency
     curl-noise wobble around home.
   - `forming` → `target = shape[i]` scaled to canvas.
   - `holding` → `target = shape[i] + tinyWobble(time, i)` — breathing
     micro-motion so the shape doesn't look frozen.
   - `dissolving` → `target = home`.

2. **Spring toward target:**
   `velocity += (target - position) * stiffness`.
   Stiffness varies by phase — soft during drift, stronger during forming so
   shapes land cleanly in ~1.5s.

3. **Cursor disturbance** (only if pointer active and phase is `drift` or
   `dissolving`):
   - If particle within ~120px of pointer, apply outward force scaled by
     `1 / distance²`.
   - No separate recovery code — the spring in step 2 handles recovery.

4. **Damping:** `velocity *= 0.85`.

5. **Integrate:** `position += velocity`.

### Drawing

Each frame:
1. Clear canvas with opaque black.
2. For each particle, draw a filled white circle (~1.2px radius, slight
   alpha for soft edges).

No trails, no glow, no connecting lines.

## Shape Cycle State Machine

```
drift       -> after dwell (8s ± 2s jitter)  -> forming
forming     -> after 1.5s                    -> holding
holding     -> after 2s                      -> dissolving
dissolving  -> after 1.5s                    -> drift (shapeIndex = (i+1) % 5)
```

Total cycle ≈ 13s per shape: 8s ± 2s drift, then ~5s of active motion
(forming + holding + dissolving). The jitter on drift prevents a metronomic
feel.

**Interface to the particle system:**
```ts
{
  phase: 'drift' | 'forming' | 'holding' | 'dissolving',
  progress: number,         // 0..1 within current phase
  currentShapeIndex: number,
  nextShapeIndex: number,
}
```

The particle system reads this each frame. No coupling in the other
direction.

## Interaction (`useInteraction.ts`)

Pure hook — returns `{ active: boolean, x: number, y: number }` in canvas
coordinates. The particle system reads this each frame.

- **Desktop:** `pointermove` / `pointerleave` on the canvas.
- **Mobile:** `touchstart` + `touchmove` sets active + position; `touchend`
  clears active.
  - Tap-to-scatter falls out naturally: a brief touch = one frame of
    disturbance = a scatter ripple.
  - Drag sweeps the field.
- No gyroscope, no permission prompts.
- Cursor/touch influence is suppressed during `forming` and `holding` so
  the shape lands cleanly even if the user is waving the pointer over it.

## Responsive & Accessibility

- Canvas resizes via `ResizeObserver`; shape coordinates re-scale.
- Shapes map from `[-1, 1]` to canvas with `min(width, height) * 0.4` so
  they fit with margin on any viewport.
- Drift "home" positions: uniform random fill of the canvas area.
  Regenerated on significant resize (e.g., orientation change).
- **Particle count:** desktop 2500, mobile 1500.
  Detection: `(pointer: coarse)` media query — treats touch-primary devices
  as mobile regardless of viewport width.
- **`prefers-reduced-motion: reduce`:** shape cycle disabled, field stays in
  `drift` permanently. Cursor disturbance still works.
- **Off-screen pause:** `IntersectionObserver` pauses the RAF loop when the
  sticky inner is out of the viewport. Saves battery and CPU.

## Performance Budget

- Desktop: ≥60fps sustained at 2500 particles.
- Mid mobile (iPhone 12-class, mid-range Android): ≥55fps at 1500 particles.
- Only tuning knob: particle count. No architectural fallback.

## Testing

### Unit (pure TS, no DOM)

- `shapeCycle.ts` — advance with a fake clock; assert phase transitions
  happen at the right times; shape index wraps `0 → 1 → 2 → 3 → 4 → 0`.
- `particleSystem.ts` — spring update with known inputs produces expected
  next position; damping reduces velocity monotonically; cursor disturbance
  is suppressed during `forming` and `holding`.
- `shapes.ts` loader — each of the 5 JSONs has exactly 2500 points and all
  coordinates lie within `[-1, 1]`. Guards against a bad extraction run
  shipping.

### Manual verification checklist

- Shapes are recognizable when they land (visual comparison against each
  reference photo).
- Morphs feel organic, not mechanical — no visible "all particles arrive at
  once and stop."
- Cursor displacement feels physical; particles recover cleanly.
- Cursor is correctly ignored during `forming` and `holding` (shape lands
  cleanly even when the mouse is over it).
- Mobile touch scatter works; drag sweeps the field.
- `prefers-reduced-motion` stops the cycle (test via DevTools emulation).
- RAF loop pauses when the section scrolls out of view (CPU drops to near
  zero in DevTools Performance panel).
- No memory leak on repeated mount/unmount (navigate away and back several
  times).

No visual regression tooling — animation frame-matching is more trouble than
it is worth for this piece.

## Open items deferred to implementation

- Exact `sharp` API for the extraction script — confirmed when writing it.
- Noise function choice for `drift`: simple sin-sum vs. `simplex-noise`
  package. No strong reason to pull a dependency; will start with sin-sum
  and only escalate if the drift looks too regular.
