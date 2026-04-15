"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SLIDES } from "./constants";

interface HeroOverlayTextProps {
  current: number;
}

const TEXT_TRANSITION = {
  type: "tween" as const,
  duration: 0.6,
  ease: [0.65, 0, 0.35, 1] as const,
};

export default function HeroOverlayText({ current }: HeroOverlayTextProps) {
  const slide = SLIDES[current];

  return (
    <div
      className="
        absolute z-10
        bottom-25 left-8
        md:bottom-16 md:left-8
      "
    >
      <Link href={slide.href} className="group/hero-text block">
        {/* Heading — fixed-height clip box */}
        <div className="overflow-hidden" style={{ height: "clamp(2rem, 5vw, 3.6rem)" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={`heading-${current}`} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={TEXT_TRANSITION} className="font-bold text-white leading-[1.1] uppercase -tracking-[0.04em]" style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)" }}>
              {slide.heading}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subheading — fixed-height clip box */}
        <div className="overflow-hidden mt-1" style={{ height: "clamp(1.5rem, 3vw, 2rem)" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`sub-${current}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ ...TEXT_TRANSITION, delay: 0.06 }}
              className="
                font-bold text-white/40
                group-hover/hero-text:text-white
                transition-colors duration-300
                leading-[1.2]
                uppercase -tracking-[0.02em]
              "
              style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)" }}
            >
              {slide.subheading}
            </motion.p>
          </AnimatePresence>
        </div>
      </Link>
    </div>
  );
}
