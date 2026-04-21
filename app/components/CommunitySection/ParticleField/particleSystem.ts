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
