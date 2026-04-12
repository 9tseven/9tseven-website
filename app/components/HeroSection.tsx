"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue, animate } from "motion/react";
import Image from "next/image";

const SLIDES = [
  {
    id: 0,
    bg: "#0d0c0a",
    accent: "radial-gradient(ellipse 80% 60% at 30% 70%, #1f1c16 0%, transparent 70%)",
    image: "/Hero/1.webp",
  },
  {
    id: 1,
    bg: "#0a0c0d",
    accent: "radial-gradient(ellipse 80% 60% at 70% 30%, #141c20 0%, transparent 70%)",
    image: "/Hero/2.webp",
  },
  {
    id: 2,
    bg: "#0c0d0a",
    accent: "radial-gradient(ellipse 80% 60% at 20% 50%, #181e12 0%, transparent 70%)",
    image: "/Hero/3.webp",
  },
  {
    id: 3,
    bg: "#0d0a0c",
    accent: "radial-gradient(ellipse 80% 60% at 80% 60%, #1e141c 0%, transparent 70%)",
    image: "/Hero/4.webp",
  },
  {
    id: 4,
    bg: "#0b0b0b",
    accent: "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1a14 0%, transparent 70%)",
    image: "/Hero/5.webp",
  },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  // State ensures dragConstraints re-renders with the real value after mount
  const [slideWidth, setSlideWidth] = useState(0);
  // Ref gives callbacks the latest value without stale closures
  const slideWidthRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.offsetWidth ?? 0;
      setSlideWidth(w);
      slideWidthRef.current = w;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const snapTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
      animate(x, -clamped * slideWidthRef.current, {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(clamped);
    },
    [x],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = slideWidthRef.current * 0.2;
      const { x: offsetX } = info.offset;
      const { x: velX } = info.velocity;

      if (offsetX < -threshold || velX < -400) {
        snapTo(current + 1);
      } else if (offsetX > threshold || velX > 400) {
        snapTo(current - 1);
      } else {
        // Snap back to current
        snapTo(current);
      }
    },
    [current, snapTo],
  );

  const prev = useCallback(() => snapTo(current - 1), [current, snapTo]);
  const next = useCallback(() => snapTo(current + 1), [current, snapTo]);

  return (
    <section data-nav-theme="dark" className="relative w-full h-screen overflow-hidden select-none">
      {/* Filmstrip container */}
      <div ref={containerRef} className="w-full h-full">
        <motion.div
          className="flex h-full"
          style={{
            x,
            width: `${SLIDES.length * 100}%`,
            cursor: "grab",
            willChange: "transform",
          }}
          drag="x"
          dragConstraints={{
            left: -(SLIDES.length - 1) * slideWidth,
            right: 0,
          }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: "grabbing" }}
        >
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full shrink-0"
              style={{
                width: `${100 / SLIDES.length}%`,
                backgroundColor: slide.bg,
                backgroundImage: slide.accent,
              }}
            >
              {/* Grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: GRAIN_SVG,
                  backgroundRepeat: "repeat",
                  backgroundSize: "128px 128px",
                }}
              />

              {/* Hero image */}
              <Image src={slide.image} alt={`Hero slide ${slide.id + 1}`} fill className="object-cover pointer-events-none" sizes="100vw" priority={slide.id === 0} draggable={false} />
              {/* Readability overlay */}
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Logo — centered bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-17 md:w-25">
        <Image src="/Logo/9t7.svg" alt="9TSEVEN" width={500} height={500} className="w-full h-auto" priority />
      </div>

      {/* Slide indicator — 25% wide, anchored bottom-right */}
      <div className="absolute bottom-8 right-8 w-1/4 z-10 pointer-events-none">
        {/* Segmented progress bar — only the active segment is lit */}
        <div className="flex gap-1 w-full">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-px transition-colors duration-300"
              style={{
                backgroundColor: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>

        {/* Counter + arrows */}
        <div className="flex items-center justify-between mt-4 pointer-events-auto">
          <span className="text-white/40 text-[0.65rem] tracking-[0.2em] tabular-nums">
            {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
            {String(SLIDES.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={prev} aria-label="Previous slide" className="text-white/40 hover:text-white transition-colors duration-200">
              <ChevronLeft size={13} strokeWidth={1.25} />
            </button>
            <button onClick={next} aria-label="Next slide" className="text-white/40 hover:text-white transition-colors duration-200">
              <ChevronRight size={13} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
