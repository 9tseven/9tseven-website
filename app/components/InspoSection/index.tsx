"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import type { MotionValue } from "motion/react";
import { ChevronDown } from "lucide-react";

const TOTAL = 11;
const RADIUS = 42; // % of the square container

// Dot 0 = center; dots 1–10 evenly placed clockwise from 12 o'clock
const DOTS: [number, number][] = [
  [50, 50], // 0 — center
  ...Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 10;
    return [50 + RADIUS * Math.cos(angle), 50 + RADIUS * Math.sin(angle)] as [number, number];
  }),
];

// Clockwise from top-right (dot 2 ≈ 1 o'clock), outer ring first, center last
const CLOCKWISE_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 0];

// Placeholder texts indexed by filled dot count (0 = none filled, 11 = all filled)
const TEXTS = ["", "Placeholder 1", "Placeholder 2", "Placeholder 3", "Placeholder 4", "Placeholder 5", "Placeholder 6", "Placeholder 7", "Placeholder 8", "Placeholder 9", "Placeholder 10", "Placeholder 11"];
const FILL_SEQUENCE: number[] = new Array(TOTAL).fill(0);
CLOCKWISE_ORDER.forEach((dotIdx, order) => {
  FILL_SEQUENCE[dotIdx] = order;
});

function Dot({ x, y, fillOrder, scrollYProgress }: { x: number; y: number; fillOrder: number; scrollYProgress: MotionValue<number> }) {
  const start = fillOrder / TOTAL;
  const end = (fillOrder + 1) / TOTAL;

  const fill = useTransform(scrollYProgress, [start, end], [0, 1]);
  const bg = useTransform(fill, (v) => `rgba(255,255,255,${v})`);
  const border = useTransform(fill, (v) => `rgba(255,255,255,${0.5 + v * 0.5})`);

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <motion.div
        className="w-7 h-7 rounded-full"
        style={{
          backgroundColor: bg,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: border,
        }}
      />
    </div>
  );
}

export default function InspoSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [filledCount, setFilledCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setFilledCount(Math.min(TOTAL, Math.round(v * TOTAL)));
  });

  return (
    <div ref={wrapperRef} style={{ height: "400vh" }}>
      <section data-nav-theme="dark" className="sticky top-0 w-full h-screen bg-black overflow-hidden select-none">
        {/* Corner accent dots — top right */}
        <div className="absolute top-5 right-5 flex flex-col gap-[5px] pointer-events-none">
          <div className="w-[5px] h-[5px] rounded-full bg-white/40" />
          <div className="w-[5px] h-[5px] rounded-full bg-white/40" />
        </div>

        {/* Rotated side label */}
        <p
          className="absolute left-4 pointer-events-none text-[7px] tracking-[0.28em] uppercase text-white/25 whitespace-nowrap"
          style={{
            top: "50%",
            transform: "rotate(-90deg) translateX(-50%)",
            transformOrigin: "left center",
          }}
        >
          Coming up in space
        </p>

        {/* Centered square container keeps the circle perfectly round */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
          {/* Text label — changes with each newly filled dot */}
          <div className="h-6 flex items-center justify-center pointer-events-none">
            <p className="text-[20px] tracking-[0.22em] uppercase text-white transition-none">{TEXTS[filledCount]}</p>
          </div>

          <div className="relative" style={{ width: "min(55vw, 55vh)", aspectRatio: "1" }}>
            {DOTS.map(([x, y], i) => (
              <Dot key={i} x={x} y={y} fillOrder={FILL_SEQUENCE[i]} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>

        {/* Bottom instruction */}
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none">
          <p className="text-[9px] tracking-[0.28em] uppercase text-white/50">Scroll</p>
          <p className="text-[9px] tracking-[0.28em] uppercase text-white/50">The Dots</p>
          <ChevronDown size={11} className="text-white/30 mt-1" strokeWidth={1.25} />
        </div>
      </section>
    </div>
  );
}
