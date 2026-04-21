import { SHAPE_COUNT } from "./shapes";

export type CyclePhase = "forming" | "holding";

export interface CycleState {
  phase: CyclePhase;
  /** 0..1 within the current phase */
  progress: number;
  currentShapeIndex: number;
}

const FORMING_MS = 4000;
const HOLDING_BASE_MS = 10000;
const HOLDING_JITTER_MS = 2000;

function randomHoldingDuration(): number {
  return HOLDING_BASE_MS + (Math.random() * 2 - 1) * HOLDING_JITTER_MS;
}

export function createShapeCycle() {
  let phase: CyclePhase = "forming";
  let phaseStart = 0;
  let phaseDuration = FORMING_MS;
  let currentShapeIndex = 0;
  let hasBooted = false;

  function advancePhaseIfDue(nowMs: number) {
    const elapsed = nowMs - phaseStart;
    if (elapsed < phaseDuration) return;
    switch (phase) {
      case "forming":
        phase = "holding";
        phaseDuration = randomHoldingDuration();
        break;
      case "holding":
        phase = "forming";
        currentShapeIndex = (currentShapeIndex + 1) % SHAPE_COUNT;
        phaseDuration = FORMING_MS;
        break;
    }
    phaseStart = nowMs;
  }

  return {
    read(nowMs: number): CycleState {
      if (!hasBooted) {
        phaseStart = nowMs;
        hasBooted = true;
      }
      advancePhaseIfDue(nowMs);
      const progress = Math.min(1, (nowMs - phaseStart) / phaseDuration);
      return { phase, progress, currentShapeIndex };
    },
    /** Advance immediately to the next shape (for click/tap to skip). */
    skip(nowMs: number) {
      currentShapeIndex = (currentShapeIndex + 1) % SHAPE_COUNT;
      phase = "forming";
      phaseStart = nowMs;
      phaseDuration = FORMING_MS;
      hasBooted = true;
    },
    /** For reduced-motion mode: pin to the current shape forever. */
    freeze() {
      phase = "holding";
      phaseDuration = Number.POSITIVE_INFINITY;
    },
  };
}

export type ShapeCycle = ReturnType<typeof createShapeCycle>;
