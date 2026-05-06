import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "./types";

interface SlideIndicatorProps {
  current: number;
  slides: HeroSlide[];
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

const TEXT_TRANSITION = {
  type: "tween" as const,
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

const SMOOTH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function SlideIndicator({ current, slides, onPrev, onNext, onGoTo }: SlideIndicatorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="absolute bottom-8 right-8 w-1/4 z-10 pointer-events-none">
      {/* Progress bar */}
      <div className="flex gap-1 w-full pointer-events-auto">
        {slides.map((slide, i) => (
          <button
            type="button"
            key={i}
            onClick={() => {
              if (i !== current) onGoTo(i);
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex-1 group"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="relative h-10 flex items-end">
              <div
                className="hidden md:flex absolute bottom-2 left-0 w-full justify-start"
                style={{
                  height: "clamp(0.7rem, 1.1vw, 0.9rem)",
                  opacity: hoveredIndex === i ? 1 : 0,
                  clipPath: "inset(0 -9999px)",
                  transition: `opacity 300ms ${SMOOTH_EASE}`,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {hoveredIndex === i && (
                    <motion.p key={`indicator-heading-${i}`} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={TEXT_TRANSITION} className="font-bold text-fg leading-[1.1] uppercase tracking-tight whitespace-nowrap" style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.8rem)" }}>
                      {slide.heading}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="relative z-10 w-full h-px group-hover:h-1.25"
                style={{
                  backgroundColor: i === current ? "var(--color-fg)" : "var(--color-fg-subtle)",
                  transition: `height 400ms ${SMOOTH_EASE}, background-color 400ms ${SMOOTH_EASE}`,
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Counter + arrows */}
      <div className="flex items-center justify-between mt-4 pointer-events-auto">
        <span className="font-mono text-fg-muted text-[0.65rem] tracking-eyebrow tabular-nums">
          {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
          {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={onPrev} aria-label="Previous slide" className="text-fg-muted hover:text-fg transition-colors duration-base">
            <ChevronLeft size={13} strokeWidth={1.25} />
          </button>
          <button onClick={onNext} aria-label="Next slide" className="text-fg-muted hover:text-fg transition-colors duration-base">
            <ChevronRight size={13} strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
