"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Slide from "./Slide";
import SlideIndicator from "./SlideIndicator";
import HeroOverlayText from "./HeroOverlayText";
import HeroLogo3D from "./HeroLogo3D";
import { useSlider } from "./hooks/useSlider";
import { useAutoSlide } from "./hooks/useAutoSlide";
import type { HeroSlide } from "./types";

interface HeroSectionClientProps {
  slides: HeroSlide[];
}

export default function HeroSectionClient({ slides }: HeroSectionClientProps) {
  const { current, slideWidth, containerRef, x, handleDragEnd, prev, next, nextLooping, goTo } = useSlider(slides.length);
  const [isHovered, setIsHovered] = useState(false);

  // Track which slides have been within ±1 of current. Once visited, stay mounted to avoid refetch.
  const mountedRef = useRef<Set<number>>(new Set([0]));
  const [, force] = useState(0);
  useEffect(() => {
    const before = mountedRef.current.size;
    [current - 1, current, current + 1].forEach((i) => {
      if (i >= 0 && i < slides.length) mountedRef.current.add(i);
    });
    if (mountedRef.current.size !== before) force((n) => n + 1);
  }, [current, slides.length]);

  const { reset } = useAutoSlide({ next: nextLooping, isPaused: isHovered });

  const handlePrev = useCallback(() => {
    reset();
    prev();
  }, [reset, prev]);

  const handleNext = useCallback(() => {
    reset();
    next();
  }, [reset, next]);

  const handleGoTo = useCallback(
    (index: number) => {
      reset();
      goTo(index);
    },
    [reset, goTo],
  );

  return (
    <section data-nav-theme="dark" className="relative w-full h-[85svh] md:h-[90vh] min-h-160 overflow-hidden select-none" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Filmstrip container */}
      <div ref={containerRef} className="w-full h-full">
        <motion.div
          className="flex h-full"
          style={{
            x,
            width: `${slides.length * 100}%`,
            cursor: "grab",
            willChange: "transform",
          }}
          drag="x"
          dragConstraints={{
            left: -(slides.length - 1) * slideWidth,
            right: 0,
          }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            reset();
            handleDragEnd(e, info);
          }}
          whileDrag={{ cursor: "grabbing" }}
        >
          {slides.map((slide) => (
            <Slide key={slide.id} id={slide.id} bg={slide.bg} image={slide.image} video={slide.video} slideCount={slides.length} isActive={current === slide.id} isVisible={mountedRef.current.has(slide.id)} />
          ))}
        </motion.div>
      </div>

      {/* 3D logo — centered, translucent glass treatment */}
      <HeroLogo3D />

      {/* Mobile: heading at bottom-left, logo centered in the hero */}
      <HeroOverlayText current={current} slides={slides} className="md:hidden absolute z-10 bottom-24 left-8 right-8" />
      <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-50">
        <Image src="/images/Logo/9t7.svg" alt="9TSEVEN" width={2000} height={1283} className="block p-6 w-full h-auto" style={{ width: "100%", height: "auto" }} priority />
      </div>

      {/* Desktop: heading bottom-left, logo centered bottom */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none md:w-25">
        <Image src="/images/Logo/9t7.svg" alt="9TSEVEN" width={2000} height={1283} className="block w-full h-auto" style={{ width: "100%", height: "auto" }} priority />
      </div>
      <HeroOverlayText current={current} slides={slides} className="hidden md:block absolute z-10 md:bottom-16 md:left-8" />

      <SlideIndicator current={current} slides={slides} onPrev={handlePrev} onNext={handleNext} onGoTo={handleGoTo} />
    </section>
  );
}
