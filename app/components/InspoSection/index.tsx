"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import type { MotionValue } from "motion/react";
import { ArrowLeft, ChevronDown } from "lucide-react";

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

function Dot({ x, y, fillOrder, scrollYProgress, maxScale }: { x: number; y: number; fillOrder: number; scrollYProgress: MotionValue<number>; maxScale: number }) {
  const isCenter = fillOrder === TOTAL - 1;

  // Compress fill ranges into the first FILL_END of scroll progress
  const start = (fillOrder / TOTAL) * FILL_END;
  const end = ((fillOrder + 1) / TOTAL) * FILL_END;

  const fill = useTransform(scrollYProgress, [start, end], [0, 1]);
  const bg = useTransform(fill, (v) => `rgba(255,255,255,${v})`);
  const border = useTransform(fill, (v) => `rgba(255,255,255,${0.5 + v * 0.5})`);

  // Center dot scales up to fill the section after all dots are filled.
  // Non-center dots use a flat [0,1]→[1,1] range so hooks are always called.
  const scale = useTransform(scrollYProgress, isCenter ? [FILL_END, 1] : [0, 1], isCenter ? [1, maxScale] : [1, 1]);

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
  const [labelFadingOut, setLabelFadingOut] = useState(false);
  const [maxScale, setMaxScale] = useState(80);
  const [navTheme, setNavTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const calculate = () => {
      // dot is w-7 = 28px, radius = 14px; scale must cover viewport diagonal from center
      const diag = Math.sqrt((window.innerWidth / 2) ** 2 + (window.innerHeight / 2) ** 2);
      setMaxScale(Math.ceil(diag / 14) + 2);
    };
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setFilledCount(Math.min(TOTAL, Math.round((v / FILL_END) * TOTAL)));
    setLabelFadingOut(v > FILL_END);
    setNavTheme(v >= 0.87 ? "light" : "dark");
  });

  const textOpacity = useTransform(scrollYProgress, [0.83, 0.9, 1], [0, 1, 1]);
  // Plain CSS opacity (not a motion value) to avoid layer promotion that
  // disables subpixel font AA and makes the text look grey.
  const labelVisible = filledCount >= 1 && !labelFadingOut;

  // Corner accent dots: alternate filled/outline as each point is reached; both filled at the end.
  const dotAFilled = filledCount === TOTAL || filledCount % 2 === 1;
  const dotBFilled = filledCount === TOTAL || (filledCount > 0 && filledCount % 2 === 0);

  return (
    <div ref={wrapperRef} style={{ height: "1400vh" }}>
      <section data-nav-theme={navTheme} className="sticky top-0 w-full h-screen bg-black overflow-hidden select-none">
        {/* Corner accent dots — below the navbar, alternate filled as scroll progresses */}
        <div className="absolute top-20 right-5 flex flex-col gap-1.5 pointer-events-none">
          <div className={`w-1.75 h-1.75 rounded-full border border-white/50 transition-colors duration-200 ${dotAFilled ? "bg-white border-white" : "bg-transparent"}`} />
          <div className={`w-1.75 h-1.75 rounded-full border border-white/50 transition-colors duration-200 ${dotBFilled ? "bg-white border-white" : "bg-transparent"}`} />
        </div>

        {/* Rotated side label */}
        <p
          className="absolute left-4 pointer-events-none font-mono text-md tracking-[0.28em] uppercase text-white/25 whitespace-nowrap"
          style={{
            top: "50%",
            transform: "rotate(-90deg) translateX(-50%)",
            transformOrigin: "left center",
          }}
        >
          9TSEVEN_MANTRA
        </p>

        {/* Centered square container keeps the circle perfectly round */}
        <div className="absolute inset-0 px-2 flex flex-col items-center justify-center gap-10">
          {/* Text label — changes with each newly filled dot */}
          <div className="h-20 flex items-center justify-center pointer-events-none">
            <p className="text-lg md:text-2xl text-pretty tracking-wide uppercase text-white whitespace-pre-line text-center transition-opacity duration-300 ease-out" style={{ opacity: labelVisible ? 1 : 0 }}>
              {TEXTS[filledCount] || TEXTS[1]}
            </p>
          </div>

          <div className="relative" style={{ width: "min(55vw, 55vh)", aspectRatio: "1" }}>
            {DOTS.map(([x, y], i) => (
              <Dot key={i} x={x} y={y} fillOrder={FILL_SEQUENCE[i]} scrollYProgress={scrollYProgress} maxScale={maxScale} />
            ))}
          </div>
        </div>

        {/* Text revealed over the white fill */}
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6 gap-6" style={{ opacity: textOpacity }}>
          <p className="text-black text-lg md:text-2xl leading-relaxed text-center max-w-2xl whitespace-pre-line">{"This is what we strive to live by.\nA mindset of growth, balance, and accountability. Grounded in gratitude, driven by progress, and open to every part of the journey.\n\nTake what resonates. Move at your own pace. Keep evolving."}</p>
          <Image src="/Logo/9t7.svg" alt="9TSEVEN" width={10} height={10} className="w-5 h-5 invert p-0.5" style={{ width: "40px", height: "40px" }} />
          <Link href="/" className="pointer-events-auto mt-2 inline-flex items-center gap-2 bg-black text-white px-7 py-3 text-[0.65rem] tracking-[0.14em] uppercase font-semibold hover:bg-black/80 transition-colors duration-150">
            <ArrowLeft size={12} strokeWidth={1.75} />
            Back to home
          </Link>
        </motion.div>

        {/* Bottom instruction — pulses gently, disappears once the first dot is reached */}
        <motion.div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none" animate={{ opacity: filledCount >= 1 ? 0 : [0.5, 1, 0.5] }} transition={filledCount >= 1 ? { duration: 0.4, ease: "easeOut" } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <p className="text-[11px] tracking-[0.28em] uppercase text-white">Scroll</p>
          <p className="text-[11px] tracking-[0.28em] uppercase text-white">The Dots</p>
          <ChevronDown size={13} className="text-white mt-1" strokeWidth={1.25} />
        </motion.div>
      </section>
    </div>
  );
}
