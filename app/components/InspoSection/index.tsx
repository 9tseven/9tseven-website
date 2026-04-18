"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import type { MotionValue } from "motion/react";
import { ChevronDown } from "lucide-react";

const TOTAL = 11;
const RADIUS = 42; // % of the square container
// First 80% of scroll fills the dots; last 20% expands the center dot
const FILL_END = 0.8;

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

const TEXTS = ["", "1.\nGratitude. Thank you for this one\n life.", "2.\nCreate a space for diversity.\nWe are all the same.", "3.\nIt's you vs you. At your own\npace, in your own time.", "4.\nWelcome all feelings. To appreciate the\nhighs, we have to appreciate the lows.", "5.\nNothing changes if nothing changes.\nStart now and improve later.", "6.\nChallenge your limits. Growth happens\nwhen you step outside your comfort zone.", "7.\nFuel your passion, not just your body. What\nDrives you is as important as what nourishes you", "8.\nYou're always developing, Always\nevolving. Enjoy the process.", "9.\nHolistic health. Invest in your physical,\nmental and emotional well-being.", "10.\nCommunity. Create a space for\ninspiration & human connection", "11.\nYou"];

const FILL_SEQUENCE: number[] = new Array(TOTAL).fill(0);
CLOCKWISE_ORDER.forEach((dotIdx, order) => {
  FILL_SEQUENCE[dotIdx] = order;
});

function Dot({ x, y, fillOrder, scrollYProgress }: { x: number; y: number; fillOrder: number; scrollYProgress: MotionValue<number> }) {
  const isCenter = fillOrder === TOTAL - 1;

  // Compress fill ranges into the first FILL_END of scroll progress
  const start = (fillOrder / TOTAL) * FILL_END;
  const end = ((fillOrder + 1) / TOTAL) * FILL_END;

  const fill = useTransform(scrollYProgress, [start, end], [0, 1]);
  const bg = useTransform(fill, (v) => `rgba(255,255,255,${v})`);
  const border = useTransform(fill, (v) => `rgba(255,255,255,${0.5 + v * 0.5})`);

  // Center dot scales up to fill the section after all dots are filled.
  // Non-center dots use a flat [0,1]→[1,1] range so hooks are always called.
  const scale = useTransform(scrollYProgress, isCenter ? [FILL_END, 1] : [0, 1], isCenter ? [1, 100] : [1, 1]);

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <motion.div
        className="w-7 h-7 rounded-full"
        style={{
          backgroundColor: bg,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: border,
          scale,
          ...(isCenter ? { zIndex: 10 } : {}),
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

  const textOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);
  // Fades in the first text as the first dot fills; stays at 1 for all subsequent texts
  const firstTextOpacity = useTransform(scrollYProgress, [0, (1 / TOTAL) * FILL_END], [0, 1]);

  return (
    <div ref={wrapperRef} style={{ height: "1400vh" }}>
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
          <div className="h-[60px] flex items-center justify-center pointer-events-none">
            <motion.p className="md:text-[20px] tracking-[0.22em] uppercase text-white transition-none whitespace-pre-line text-center" style={{ opacity: firstTextOpacity }}>
              {TEXTS[filledCount]}
            </motion.p>
          </div>

          <div className="relative" style={{ width: "min(55vw, 55vh)", aspectRatio: "1" }}>
            {DOTS.map(([x, y], i) => (
              <Dot key={i} x={x} y={y} fillOrder={FILL_SEQUENCE[i]} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>

        {/* Text revealed over the white fill */}
        <motion.div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" style={{ opacity: textOpacity }}>
          <p className="text-black text-7xl tracking-[0.18em] uppercase text-center self-center">Placeholder</p>
        </motion.div>

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
