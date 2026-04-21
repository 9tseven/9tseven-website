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
