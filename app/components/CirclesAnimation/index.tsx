"use client";

import { motion } from "motion/react";

const TOTAL = 11;
const RADIUS = 42;

const DOTS: [number, number][] = [
  [50, 50],
  ...Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 10;
    return [50 + RADIUS * Math.cos(angle), 50 + RADIUS * Math.sin(angle)] as [number, number];
  }),
];

const CLOCKWISE_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 0];
const FILL_SEQUENCE: number[] = new Array(TOTAL).fill(0);
CLOCKWISE_ORDER.forEach((dotIdx, order) => {
  FILL_SEQUENCE[dotIdx] = order;
});

const LAST_ORDER = TOTAL - 1;

function Dot({ x, y, fillOrder, active, dotClassName, onComplete, stepDelay, dotDuration }: { x: number; y: number; fillOrder: number; active: boolean; dotClassName?: string; onComplete?: () => void; stepDelay: number; dotDuration: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <motion.div
        className={dotClassName ?? "w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full"}
        initial={{ backgroundColor: "rgba(0,0,0,0)", borderColor: "rgba(0,0,0,0.3)" }}
        animate={active ? { backgroundColor: "rgba(11,11,11,1)", borderColor: "rgba(11,11,11,1)" } : { backgroundColor: "rgba(0,0,0,0)", borderColor: "rgba(0,0,0,0.3)" }}
        transition={{ duration: dotDuration, delay: fillOrder * stepDelay }}
        style={{ borderWidth: 1, borderStyle: "solid" }}
        onAnimationComplete={fillOrder === LAST_ORDER && active ? onComplete : undefined}
      />
    </div>
  );
}

export default function CirclesAnimation({ active, onComplete, className, dotClassName, stepDelay = 0.35, dotDuration = 0.8 }: { active: boolean; onComplete?: () => void; className?: string; dotClassName?: string; stepDelay?: number; dotDuration?: number }) {
  return (
    <div className={className ?? "relative mx-auto w-70 md:w-72 lg:w-80 xl:w-100"} style={{ aspectRatio: "1" }}>
      {DOTS.map(([x, y], i) => (
        <Dot key={i} x={x} y={y} fillOrder={FILL_SEQUENCE[i]} active={active} dotClassName={dotClassName} onComplete={onComplete} stepDelay={stepDelay} dotDuration={dotDuration} />
      ))}
    </div>
  );
}
