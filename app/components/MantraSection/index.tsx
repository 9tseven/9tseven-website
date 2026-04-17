"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";

const TOTAL = 11;
const RADIUS = 42;

const DOTS: [number, number][] = [
  [50, 50],
  ...Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 10;
    return [50 + RADIUS * Math.cos(angle), 50 + RADIUS * Math.sin(angle)] as [number, number];
  }),
];

// Fill clockwise from top-right, outer ring first, center last
const CLOCKWISE_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 0];
const FILL_SEQUENCE: number[] = new Array(TOTAL).fill(0);
CLOCKWISE_ORDER.forEach((dotIdx, order) => {
  FILL_SEQUENCE[dotIdx] = order;
});

function Dot({ x, y, fillOrder, inView }: { x: number; y: number; fillOrder: number; inView: boolean }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <motion.div className="w-7 h-7 rounded-full" initial={{ backgroundColor: "rgba(0,0,0,0)", borderColor: "rgba(0,0,0,0.25)" }} animate={inView ? { backgroundColor: "rgba(0,0,0,1)", borderColor: "rgba(0,0,0,1)" } : { backgroundColor: "rgba(0,0,0,0)", borderColor: "rgba(0,0,0,0.25)" }} transition={{ duration: 0.8, delay: fillOrder * 0.35 }} style={{ borderWidth: 1, borderStyle: "solid" }} />
    </div>
  );
}

export default function MantraSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.6, once: true });

  return (
    <section ref={sectionRef} data-nav-theme="light" className="w-full bg-white px-8 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-0">
          {/* Heading */}
          <div className="flex-1 md:pr-16">
            <h2 className="text-5xl font-bold leading-none tracking-tight text-black md:text-6xl lg:text-[6rem]">
              Community.
              <br />
              Create a space for inspiration &amp; human connection.
            </h2>
          </div>

          {/* Dots */}
          <div className="w-full md:w-auto md:shrink-0">
            <div className="relative mx-auto w-full md:w-[min(45vw,55vh,480px)]" style={{ aspectRatio: "1" }}>
              {DOTS.map(([x, y], i) => (
                <Dot key={i} x={x} y={y} fillOrder={FILL_SEQUENCE[i]} inView={inView} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA link */}
        <Link href="/community" className="font-mono text-sm tracking-[-0.05em] text-black underline underline-offset-4 transition-opacity hover:opacity-50">
          READ MORE ABOUT THE COMMUNITY
        </Link>
      </div>
    </section>
  );
}
