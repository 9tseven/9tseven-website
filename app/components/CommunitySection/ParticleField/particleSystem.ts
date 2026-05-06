import type { CycleState } from "./shapeCycle";
import { SHAPES, PARTICLE_COUNT, type Point } from "./shapes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tint: number;
}

const TINTS = ["rgba(255, 255, 255, 0.95)", "rgba(230, 230, 230, 0.85)", "rgba(200, 200, 200, 0.75)", "rgba(170, 170, 170, 0.65)"];

function pickTint(i: number): number {
  const h = Math.sin(i * 12.9898) * 43758.5453;
  return Math.abs(Math.floor((h - Math.floor(h)) * TINTS.length)) % TINTS.length;
}

const GLOW_RADIUS = 4;
const GLOW_SPRITE_SIZE = GLOW_RADIUS * 2;

function createGlowSprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = GLOW_SPRITE_SIZE;
  c.height = GLOW_SPRITE_SIZE;
  const g = c.getContext("2d");
  if (!g) return c;
  const grad = g.createRadialGradient(GLOW_RADIUS, GLOW_RADIUS, 0, GLOW_RADIUS, GLOW_RADIUS, GLOW_RADIUS);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  grad.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, GLOW_SPRITE_SIZE, GLOW_SPRITE_SIZE);
  return c;
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
const FORMING_STIFFNESS = 0.02;
const HOLDING_STIFFNESS = 0.02;
const WOBBLE_AMP = 3;
const WOBBLE_FREQ = 0.0012;
const POINTER_RADIUS = 140;
const POINTER_FORCE = 600;

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
  const glowSprite = createGlowSprite();

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
        p.tint = pickTint(i);
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
      ctx.clearRect(0, 0, size.width, size.height);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        ctx.drawImage(glowSprite, p.x - GLOW_RADIUS, p.y - GLOW_RADIUS);
      }
      ctx.globalCompositeOperation = "source-over";

      for (let t = 0; t < TINTS.length; t++) {
        ctx.fillStyle = TINTS[t];
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const p = particles[i];
          if (p.tint !== t) continue;
          ctx.moveTo(p.x + 1.2, p.y);
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        }
        ctx.fill();
      }
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
