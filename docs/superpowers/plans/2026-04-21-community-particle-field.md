# Community Particle Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new dark-themed section on the community page that renders ~2500 white dots on black, drifting ambiently and coalescing into one of five shapes (extracted from reference photos) every ~13 seconds. Cursor physically displaces particles on desktop; mobile runs the same cycle with optional tap-to-scatter.

**Architecture:** Pure-TS particle system and shape-cycle state machine, rendered by a thin React client component onto a single `<canvas>` via Canvas 2D. Section wrapper uses the sticky-hold pattern already used by `ImageSection` (200vh outer, 100vh sticky inner). Shape targets extracted offline from 5 reference photos into JSON files checked into the repo.

**Tech Stack:** Next.js 16.2.3, React 19.2.4, Tailwind CSS 4, TypeScript 5, Canvas 2D. `sharp` added as a devDependency for the offline extraction script. No test framework — verification is `npm run lint`, `npm run build`, and manual browser checks.

**Project caveat:** This repo uses Next.js 16 with breaking changes. When uncertain about a Next API, consult `node_modules/next/dist/docs/` as directed by [AGENTS.md](../../../AGENTS.md). The existing `ImageSection` uses the sticky-hold pattern we mirror here — see [ImageSection.tsx](../../../app/components/CommunitySection/ImageSection.tsx).

**Design spec:** [docs/superpowers/specs/2026-04-21-community-particle-field-design.md](../specs/2026-04-21-community-particle-field-design.md)

---

## Task 1: Place reference images and scaffold folders

**Files:**
- Create (manual): `public/CommunitySection/reference/feather.png`
- Create (manual): `public/CommunitySection/reference/waves.png`
- Create (manual): `public/CommunitySection/reference/diamond.png`
- Create (manual): `public/CommunitySection/reference/architecture.png`
- Create (manual): `public/CommunitySection/reference/crescent.png`
- Create: `app/components/CommunitySection/ParticleField/shapes/.gitkeep`

- [ ] **Step 1: Ask the user to place the 5 reference images**

The 5 source photos from the 9t7 team must be placed at the exact paths below with the exact filenames (matches are used by the extraction script in Task 3):

- `public/CommunitySection/reference/feather.png` — the wing/feather-shaped dot composition
- `public/CommunitySection/reference/waves.png` — the scattered burst/cosmic composition
- `public/CommunitySection/reference/diamond.png` — the horizontal-lines composition
- `public/CommunitySection/reference/architecture.png` — the vertical-columns-with-sweeps composition
- `public/CommunitySection/reference/crescent.png` — the arc-fading-to-particles composition

File extensions may be `.png`, `.jpeg`, or `.png` — update filenames in the extraction script (Task 3) to match if they differ.

Block until the user confirms the 5 images are in place.

- [ ] **Step 2: Create the shapes output directory placeholder**

Path: `app/components/CommunitySection/ParticleField/shapes/.gitkeep`

```
```

(Empty file; `git add` lets us commit the empty directory before Task 3 populates it.)

- [ ] **Step 3: Commit**

```bash
git add public/CommunitySection/reference app/components/CommunitySection/ParticleField/shapes/.gitkeep
git commit -m "feat: add community particle field reference images and scaffold"
```

---

## Task 2: Install `sharp` as a devDependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install sharp**

Run:

```bash
npm install --save-dev sharp
```

Expected: `package.json` gains `"sharp": "^<version>"` under `devDependencies`; `package-lock.json` updates.

- [ ] **Step 2: Verify install**

Run:

```bash
npm run lint
```

Expected: passes without new errors. (Sharp is not imported anywhere yet.)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add sharp for offline shape extraction"
```

---

## Task 3: Build the shape extraction script

**Files:**
- Create: `scripts/extract-shape-points.ts`

- [ ] **Step 1: Write the extraction script**

Path: `scripts/extract-shape-points.ts`

```ts
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { argv } from "node:process";

type Point = [number, number];

interface Args {
  in: string;
  out: string;
  count: number;
  threshold: number;
}

function parseArgs(): Args {
  const args: Partial<Args> = { count: 2500, threshold: 180 };
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "") as keyof Args;
    const value = argv[i + 1];
    if (key === "count" || key === "threshold") {
      (args[key] as number) = Number(value);
    } else {
      (args[key] as string) = value;
    }
  }
  if (!args.in || !args.out) {
    throw new Error("Usage: --in <path> --out <path> [--count N] [--threshold 0-255]");
  }
  return args as Args;
}

async function loadGreyscale(path: string) {
  const { data, info } = await sharp(path)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function findBlobs(data: Buffer, width: number, height: number, threshold: number): Point[] {
  const visited = new Uint8Array(width * height);
  const centroids: Point[] = [];
  const stack: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx] || data[idx] < threshold) continue;
      let sumX = 0;
      let sumY = 0;
      let n = 0;
      stack.push(idx);
      visited[idx] = 1;
      while (stack.length) {
        const i = stack.pop()!;
        const px = i % width;
        const py = (i - px) / width;
        sumX += px;
        sumY += py;
        n++;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const ni = ny * width + nx;
            if (visited[ni] || data[ni] < threshold) continue;
            visited[ni] = 1;
            stack.push(ni);
          }
        }
      }
      centroids.push([sumX / n, sumY / n]);
    }
  }
  return centroids;
}

function normalizeCount(points: Point[], target: number): Point[] {
  if (points.length === target) return points;
  if (points.length > target) {
    const step = points.length / target;
    const sampled: Point[] = [];
    for (let i = 0; i < target; i++) {
      sampled.push(points[Math.floor(i * step)]);
    }
    return sampled;
  }
  const filled = [...points];
  while (filled.length < target) {
    const source = filled[Math.floor(Math.random() * points.length)];
    filled.push([
      source[0] + (Math.random() - 0.5) * 2,
      source[1] + (Math.random() - 0.5) * 2,
    ]);
  }
  return filled;
}

function normalizeCoords(points: Point[], width: number, height: number): Point[] {
  const longSide = Math.max(width, height);
  const offsetX = (longSide - width) / 2;
  const offsetY = (longSide - height) / 2;
  return points.map(([x, y]) => [
    ((x + offsetX) / longSide) * 2 - 1,
    ((y + offsetY) / longSide) * 2 - 1,
  ]);
}

async function main() {
  const args = parseArgs();
  const { data, width, height } = await loadGreyscale(args.in);
  const blobs = findBlobs(data, width, height, args.threshold);
  const sized = normalizeCount(blobs, args.count);
  const normalized = normalizeCoords(sized, width, height);
  const sourceImage = args.in.split("/").pop() ?? args.in;
  const output = {
    points: normalized,
    sourceImage,
    count: normalized.length,
  };
  await writeFile(args.out, JSON.stringify(output));
  console.log(
    `Extracted ${blobs.length} blobs from ${args.in}, sampled to ${normalized.length}, wrote ${args.out}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Lint**

Run:

```bash
npm run lint
```

Expected: passes. If ESLint complains about the `scripts/` directory, add `scripts/` to the ignore list in `eslint.config.mjs` (it's not part of the app bundle) — single-line addition to the existing `ignores` array.

- [ ] **Step 3: Commit**

```bash
git add scripts/extract-shape-points.ts eslint.config.mjs
git commit -m "feat: add offline shape extraction script"
```

---

## Task 4: Run extraction on all 5 reference images

**Files:**
- Create: `app/components/CommunitySection/ParticleField/shapes/feather.json`
- Create: `app/components/CommunitySection/ParticleField/shapes/waves.json`
- Create: `app/components/CommunitySection/ParticleField/shapes/diamond.json`
- Create: `app/components/CommunitySection/ParticleField/shapes/architecture.json`
- Create: `app/components/CommunitySection/ParticleField/shapes/crescent.json`

- [ ] **Step 1: Extract all 5 shapes**

Run each command below. Each run prints to stdout: `Extracted <raw> blobs from <in>, sampled to 2500, wrote <out>`. A healthy raw blob count is between ~500 and ~20000. If the raw count is below 500 for an image, lower `--threshold` by 20 and retry that single image. If it is above 20000, raise `--threshold` by 20 and retry.

```bash
npx tsx scripts/extract-shape-points.ts \
  --in public/CommunitySection/reference/feather.png \
  --out app/components/CommunitySection/ParticleField/shapes/feather.json \
  --count 2500 --threshold 180
```

```bash
npx tsx scripts/extract-shape-points.ts \
  --in public/CommunitySection/reference/waves.png \
  --out app/components/CommunitySection/ParticleField/shapes/waves.json \
  --count 2500 --threshold 180
```

```bash
npx tsx scripts/extract-shape-points.ts \
  --in public/CommunitySection/reference/diamond.png \
  --out app/components/CommunitySection/ParticleField/shapes/diamond.json \
  --count 2500 --threshold 180
```

```bash
npx tsx scripts/extract-shape-points.ts \
  --in public/CommunitySection/reference/architecture.png \
  --out app/components/CommunitySection/ParticleField/shapes/architecture.json \
  --count 2500 --threshold 180
```

```bash
npx tsx scripts/extract-shape-points.ts \
  --in public/CommunitySection/reference/crescent.png \
  --out app/components/CommunitySection/ParticleField/shapes/crescent.json \
  --count 2500 --threshold 180
```

Each run prints the raw blob count to stdout — note it down to confirm the threshold is reasonable (raw count between 500 and 20000 is healthy).

- [ ] **Step 2: Spot-check one output file**

Run:

```bash
node -e "const d=require('./app/components/CommunitySection/ParticleField/shapes/feather.json'); console.log('count:', d.count, 'first point:', d.points[0], 'source:', d.sourceImage);"
```

Expected: `count: 2500`, first point is a 2-element array with both values between -1 and 1.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/shapes
git commit -m "feat: generate shape target data from reference images"
```

---

## Task 5: Build the typed shape loader

**Files:**
- Create: `app/components/CommunitySection/ParticleField/shapes.ts`

- [ ] **Step 1: Write the module**

Path: `app/components/CommunitySection/ParticleField/shapes.ts`

```ts
import feather from "./shapes/feather.json";
import waves from "./shapes/waves.json";
import diamond from "./shapes/diamond.json";
import architecture from "./shapes/architecture.json";
import crescent from "./shapes/crescent.json";

export type Point = readonly [number, number];

export interface ShapeData {
  readonly points: readonly Point[];
  readonly sourceImage: string;
  readonly count: number;
}

export const SHAPES: readonly ShapeData[] = [
  feather as ShapeData,
  waves as ShapeData,
  diamond as ShapeData,
  architecture as ShapeData,
  crescent as ShapeData,
];

export const SHAPE_COUNT = SHAPES.length;
export const PARTICLE_COUNT = SHAPES[0].count;

for (const shape of SHAPES) {
  if (shape.count !== PARTICLE_COUNT) {
    throw new Error(
      `Shape ${shape.sourceImage} has ${shape.count} points; expected ${PARTICLE_COUNT}. Re-run extraction with matching --count.`
    );
  }
}
```

- [ ] **Step 2: Lint + typecheck**

Existing `tsconfig.json` already has `"resolveJsonModule": true`, so JSON imports work without config changes.

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/shapes.ts
git commit -m "feat: typed shape data loader"
```

---

## Task 6: Build the shape-cycle state machine

**Files:**
- Create: `app/components/CommunitySection/ParticleField/shapeCycle.ts`

- [ ] **Step 1: Write the module**

Path: `app/components/CommunitySection/ParticleField/shapeCycle.ts`

```ts
import { SHAPE_COUNT } from "./shapes";

export type CyclePhase = "drift" | "forming" | "holding" | "dissolving";

export interface CycleState {
  phase: CyclePhase;
  /** 0..1 within the current phase */
  progress: number;
  currentShapeIndex: number;
  nextShapeIndex: number;
}

const DRIFT_BASE_MS = 8000;
const DRIFT_JITTER_MS = 2000;
const FORMING_MS = 1500;
const HOLDING_MS = 2000;
const DISSOLVING_MS = 1500;

function randomDriftDuration(): number {
  return DRIFT_BASE_MS + (Math.random() * 2 - 1) * DRIFT_JITTER_MS;
}

export function createShapeCycle() {
  let phase: CyclePhase = "drift";
  let phaseStart = 0;
  let phaseDuration = randomDriftDuration();
  let currentShapeIndex = 0;
  let hasBooted = false;

  function phaseDurationFor(p: CyclePhase): number {
    switch (p) {
      case "drift":
        return randomDriftDuration();
      case "forming":
        return FORMING_MS;
      case "holding":
        return HOLDING_MS;
      case "dissolving":
        return DISSOLVING_MS;
    }
  }

  function advancePhaseIfDue(nowMs: number) {
    const elapsed = nowMs - phaseStart;
    if (elapsed < phaseDuration) return;
    switch (phase) {
      case "drift":
        phase = "forming";
        break;
      case "forming":
        phase = "holding";
        break;
      case "holding":
        phase = "dissolving";
        break;
      case "dissolving":
        phase = "drift";
        currentShapeIndex = (currentShapeIndex + 1) % SHAPE_COUNT;
        break;
    }
    phaseStart = nowMs;
    phaseDuration = phaseDurationFor(phase);
  }

  return {
    read(nowMs: number): CycleState {
      if (!hasBooted) {
        phaseStart = nowMs;
        hasBooted = true;
      }
      advancePhaseIfDue(nowMs);
      const progress = Math.min(1, (nowMs - phaseStart) / phaseDuration);
      const nextShapeIndex =
        phase === "dissolving"
          ? (currentShapeIndex + 1) % SHAPE_COUNT
          : currentShapeIndex;
      return { phase, progress, currentShapeIndex, nextShapeIndex };
    },
    /** For reduced-motion mode: pin to drift forever. */
    forceDrift() {
      phase = "drift";
      phaseDuration = Number.POSITIVE_INFINITY;
    },
  };
}

export type ShapeCycle = ReturnType<typeof createShapeCycle>;
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/shapeCycle.ts
git commit -m "feat: shape-cycle state machine"
```

---

## Task 7: Build the particle system

**Files:**
- Create: `app/components/CommunitySection/ParticleField/particleSystem.ts`

- [ ] **Step 1: Write the module**

Path: `app/components/CommunitySection/ParticleField/particleSystem.ts`

```ts
import type { CycleState } from "./shapeCycle";
import { SHAPES, PARTICLE_COUNT, type Point } from "./shapes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
}

export interface PointerState {
  active: boolean;
  x: number;
  y: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

const DAMPING = 0.85;
const DRIFT_STIFFNESS = 0.006;
const FORMING_STIFFNESS = 0.08;
const HOLDING_STIFFNESS = 0.12;
const DISSOLVING_STIFFNESS = 0.04;
const DRIFT_NOISE_AMP = 18;
const DRIFT_NOISE_FREQ = 0.0006;
const HOLD_WOBBLE_AMP = 1.2;
const HOLD_WOBBLE_FREQ = 0.003;
const POINTER_RADIUS = 120;
const POINTER_FORCE = 1800;

function stiffnessFor(phase: CycleState["phase"]): number {
  switch (phase) {
    case "drift":
      return DRIFT_STIFFNESS;
    case "forming":
      return FORMING_STIFFNESS;
    case "holding":
      return HOLDING_STIFFNESS;
    case "dissolving":
      return DISSOLVING_STIFFNESS;
  }
}

function shapeScale(viewport: ViewportSize): number {
  return Math.min(viewport.width, viewport.height) * 0.4;
}

function mapShapePoint(p: Point, viewport: ViewportSize): readonly [number, number] {
  const scale = shapeScale(viewport);
  return [viewport.width / 2 + p[0] * scale, viewport.height / 2 + p[1] * scale];
}

export function createParticleSystem(particleCount: number, viewport: ViewportSize) {
  let count = Math.min(particleCount, PARTICLE_COUNT);
  let size = viewport;
  const particles: Particle[] = [];

  function resetHomes() {
    for (let i = 0; i < count; i++) {
      const p = particles[i] ?? ({} as Particle);
      const hx = Math.random() * size.width;
      const hy = Math.random() * size.height;
      p.homeX = hx;
      p.homeY = hy;
      if (particles[i] === undefined) {
        p.x = hx;
        p.y = hy;
        p.vx = 0;
        p.vy = 0;
        particles[i] = p;
      }
    }
    particles.length = count;
  }

  resetHomes();

  function driftTarget(i: number, time: number): [number, number] {
    const p = particles[i];
    const offsetX =
      Math.sin(time * DRIFT_NOISE_FREQ + i * 0.37) * DRIFT_NOISE_AMP;
    const offsetY =
      Math.cos(time * DRIFT_NOISE_FREQ * 0.8 + i * 0.71) * DRIFT_NOISE_AMP;
    return [p.homeX + offsetX, p.homeY + offsetY];
  }

  function shapeTarget(
    i: number,
    shapeIndex: number,
    time: number,
    withWobble: boolean
  ): [number, number] {
    const shape = SHAPES[shapeIndex];
    const pt = shape.points[i % shape.points.length];
    const [sx, sy] = mapShapePoint(pt, size);
    if (!withWobble) return [sx, sy];
    const wx = Math.sin(time * HOLD_WOBBLE_FREQ + i * 0.9) * HOLD_WOBBLE_AMP;
    const wy = Math.cos(time * HOLD_WOBBLE_FREQ + i * 1.3) * HOLD_WOBBLE_AMP;
    return [sx + wx, sy + wy];
  }

  function targetFor(
    i: number,
    cycle: CycleState,
    time: number
  ): [number, number] {
    switch (cycle.phase) {
      case "drift":
        return driftTarget(i, time);
      case "forming":
        return shapeTarget(i, cycle.currentShapeIndex, time, false);
      case "holding":
        return shapeTarget(i, cycle.currentShapeIndex, time, true);
      case "dissolving":
        return driftTarget(i, time);
    }
  }

  function applyPointer(p: Particle, pointer: PointerState) {
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > POINTER_RADIUS * POINTER_RADIUS || distSq < 1) return;
    const dist = Math.sqrt(distSq);
    const force = POINTER_FORCE / distSq;
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }

  return {
    update(cycle: CycleState, pointer: PointerState, time: number) {
      const k = stiffnessFor(cycle.phase);
      const pointerActive =
        pointer.active &&
        (cycle.phase === "drift" || cycle.phase === "dissolving");
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const [tx, ty] = targetFor(i, cycle, time);
        p.vx += (tx - p.x) * k;
        p.vy += (ty - p.y) * k;
        if (pointerActive) applyPointer(p, pointer);
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        ctx.moveTo(p.x + 1.2, p.y);
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      }
      ctx.fill();
    },
    resize(nextViewport: ViewportSize, nextCount?: number) {
      size = nextViewport;
      if (nextCount !== undefined) count = Math.min(nextCount, PARTICLE_COUNT);
      resetHomes();
    },
    particleCount(): number {
      return count;
    },
  };
}

export type ParticleSystem = ReturnType<typeof createParticleSystem>;
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/particleSystem.ts
git commit -m "feat: particle system with drift, shape morph, pointer displace"
```

---

## Task 8: Build the interaction hook

**Files:**
- Create: `app/components/CommunitySection/ParticleField/useInteraction.ts`

- [ ] **Step 1: Write the hook**

Path: `app/components/CommunitySection/ParticleField/useInteraction.ts`

```ts
"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { PointerState } from "./particleSystem";

/**
 * Attaches pointer + touch listeners to the given canvas and exposes a
 * pointer state ref that the RAF loop reads each frame.
 */
export function useInteraction(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const pointerRef = useRef<PointerState>({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function toLocal(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const { x, y } = toLocal(e.clientX, e.clientY);
      pointerRef.current.active = true;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onPointerLeave() {
      pointerRef.current.active = false;
    }

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = toLocal(t.clientX, t.clientY);
      pointerRef.current.active = true;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = toLocal(t.clientX, t.clientY);
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onTouchEnd() {
      pointerRef.current.active = false;
    }

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [canvasRef]);

  return pointerRef;
}
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/useInteraction.ts
git commit -m "feat: interaction hook for pointer and touch"
```

---

## Task 9: Build the canvas component

**Files:**
- Create: `app/components/CommunitySection/ParticleField/ParticleCanvas.tsx`

- [ ] **Step 1: Write the component**

Path: `app/components/CommunitySection/ParticleField/ParticleCanvas.tsx`

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createParticleSystem } from "./particleSystem";
import { createShapeCycle } from "./shapeCycle";
import { useInteraction } from "./useInteraction";

const DESKTOP_PARTICLES = 2500;
const MOBILE_PARTICLES = 1500;

function initialParticleCount(): number {
  if (typeof window === "undefined") return DESKTOP_PARTICLES;
  return window.matchMedia("(pointer: coarse)").matches
    ? MOBILE_PARTICLES
    : DESKTOP_PARTICLES;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useInteraction(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const system = createParticleSystem(initialParticleCount(), {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
    const cycle = createShapeCycle();
    if (prefersReducedMotion()) cycle.forceDrift();

    function resize() {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      system.resize({ width: w, height: h });
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    let rafId = 0;
    function frame(time: number) {
      rafId = requestAnimationFrame(frame);
      if (!visible) return;
      if (!ctx) return;
      const state = cycle.read(time);
      system.update(state, pointerRef.current, time);
      system.draw(ctx);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [pointerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full"
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/ParticleCanvas.tsx
git commit -m "feat: canvas component driving particle system"
```

---

## Task 10: Build the section wrapper

**Files:**
- Create: `app/components/CommunitySection/ParticleField/index.tsx`

- [ ] **Step 1: Write the wrapper**

Path: `app/components/CommunitySection/ParticleField/index.tsx`

```tsx
import ParticleCanvas from "./ParticleCanvas";

export default function ParticleField() {
  return (
    <section data-nav-theme="dark" className="bg-black" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen w-full">
        <ParticleCanvas />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/ParticleField/index.tsx
git commit -m "feat: particle field section wrapper"
```

---

## Task 11: Integrate into the community page

**Files:**
- Modify: `app/community/page.tsx`

- [ ] **Step 1: Add the new section after `ImageSection`**

Replace the contents of `app/community/page.tsx` with:

```tsx
import ImageSection from "../components/CommunitySection/ImageSection";
import ParticleField from "../components/CommunitySection/ParticleField";

export default function Community() {
  return (
    <main>
      <ImageSection />
      <ParticleField />
    </main>
  );
}
```

Note: the existing file also imports `AsciiRun` at the top but does not use it. The replacement above drops that unused import (the import was already dead code).

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
npm run lint && npx tsc --noEmit
```

Expected: passes. The unused-import warning from `AsciiRun` (if ESLint flagged it previously) is gone.

- [ ] **Step 3: Commit the page integration and the already-staged ImageSection bg-white change**

The `bg-white` tweak to `ImageSection.tsx` has been sitting unstaged since the brainstorming phase. It belongs with this integration.

```bash
git add app/community/page.tsx app/components/CommunitySection/ImageSection.tsx
git commit -m "feat: add particle field to community page and set ImageSection background"
```

---

## Task 12: Manual verification

**Files:** none.

- [ ] **Step 1: Run the production build**

Run:

```bash
npm run build
```

Expected: build succeeds. No new warnings about the community page or `ParticleField` folder.

- [ ] **Step 2: Start the dev server**

Run in a background shell:

```bash
npm run dev
```

Open `http://localhost:3000/community` in a browser.

- [ ] **Step 3: Desktop visual checklist**

With DevTools open, scroll through the page and confirm:

- [ ] `ImageSection` has a white background (no more transparent page-body showing through).
- [ ] After scrolling past `ImageSection`, the page transitions into a full-bleed black section with a drifting field of white dots.
- [ ] The dots drift continuously — no frozen frames — at roughly 60 fps (DevTools → Performance → Frame rate overlay).
- [ ] Moving the cursor over the canvas pushes nearby particles aside; they recover smoothly when the cursor leaves.
- [ ] After ~6–10 seconds of drift, the field forms a recognizable shape (compare against the corresponding reference image in `public/CommunitySection/reference/`), holds for ~2 seconds, then dissolves back into drift.
- [ ] The five shapes appear in order `feather → waves → diamond → architecture → crescent` and then loop.
- [ ] During `forming` and `holding`, moving the cursor does not visibly deform the shape.

- [ ] **Step 4: Mobile visual checklist**

In DevTools, toggle device emulation to a mid-tier mobile (e.g., iPhone 12 Pro or Pixel 5):

- [ ] The particle field still renders, with fewer particles (noticeably sparser than desktop).
- [ ] Tapping the canvas produces a visible scatter ripple.
- [ ] Dragging sweeps particles along the finger path.
- [ ] Frame rate stays above ~55 fps during drift.

- [ ] **Step 5: Accessibility checks**

- [ ] DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → `reduce`. Reload the page. The particle field continues to drift but never coalesces into a shape. Cursor displacement still works.
- [ ] Scroll the page so the particle section is fully off-screen. In DevTools → Performance, record 3–5 seconds. CPU usage from `requestAnimationFrame` should be near zero (the RAF loop still fires but `update`/`draw` are skipped because `visible` is false).

- [ ] **Step 6: Navigation regression**

- [ ] Navigate to another page (e.g., `/`), then back to `/community` several times. No console errors. No warnings about leaked event listeners or observers. Frame rate remains stable after 3–4 navigations.

- [ ] **Step 7: Stop the dev server**

- [ ] **Step 8: If any check failed**

- Shape is unrecognizable → re-run extraction for that image with a different `--threshold` (see Task 4).
- Frame rate drops on mobile emulation → lower `MOBILE_PARTICLES` in `ParticleCanvas.tsx` (e.g., to 1000) and commit the change.
- Shape lands but looks "all at once" mechanical → increase `DRIFT_STIFFNESS` slightly (e.g., 0.006 → 0.009) so the starting velocities are higher when `forming` begins, producing varied arrival times. Commit the change.
- No fixes needed → this task is complete. No commit required.
