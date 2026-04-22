import type { CycleState } from "./shapeCycle";
import { SHAPES, PARTICLE_COUNT, type Point } from "./shapes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
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
const FORMING_STIFFNESS = 0.025;
const HOLDING_STIFFNESS = 0.035;
const WOBBLE_AMP = 7;
const WOBBLE_FREQ = 0.0012;
const POINTER_RADIUS = 150;
const POINTER_FORCE = 1800;

function stiffnessFor(phase: CycleState["phase"]): number {
  switch (phase) {
    case "forming":
      return FORMING_STIFFNESS;
    case "holding":
      return HOLDING_STIFFNESS;
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

  function shapePointIndex(i: number, totalPoints: number): number {
    return Math.floor((i * totalPoints) / count);
  }

  function seedPositions() {
    const shape = SHAPES[0];
    for (let i = 0; i < count; i++) {
      const pt = shape.points[shapePointIndex(i, shape.points.length)];
      const [sx, sy] = mapShapePoint(pt, size);
      const p = particles[i] ?? ({} as Particle);
      if (particles[i] === undefined) {
        p.x = sx;
        p.y = sy;
        p.vx = 0;
        p.vy = 0;
        particles[i] = p;
      }
    }
    particles.length = count;
  }

  seedPositions();

  function shapeTarget(i: number, shapeIndex: number, time: number): [number, number] {
    const shape = SHAPES[shapeIndex];
    const pt = shape.points[shapePointIndex(i, shape.points.length)];
    const [sx, sy] = mapShapePoint(pt, size);
    const wx = Math.sin(time * WOBBLE_FREQ + i * 0.9) * WOBBLE_AMP;
    const wy = Math.cos(time * WOBBLE_FREQ + i * 1.3) * WOBBLE_AMP;
    return [sx + wx, sy + wy];
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
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const [tx, ty] = shapeTarget(i, cycle.currentShapeIndex, time);
        p.vx += (tx - p.x) * k;
        p.vy += (ty - p.y) * k;
        if (pointer.active) applyPointer(p, pointer);
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
      seedPositions();
    },
    particleCount(): number {
      return count;
    },
  };
}

export type ParticleSystem = ReturnType<typeof createParticleSystem>;
