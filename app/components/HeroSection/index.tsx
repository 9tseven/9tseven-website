"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Slide from "./Slide";
import SlideIndicator from "./SlideIndicator";
import HeroOverlayText from "./HeroOverlayText";
import HeroLogo3D from "./HeroLogo3D";
import { useSlider } from "./hooks/useSlider";
import { useAutoSlide } from "./hooks/useAutoSlide";
import { SLIDES } from "./constants";

export default function HeroSection() {
  const { current, slideWidth, containerRef, x, handleDragEnd, prev, next, nextLooping, goTo } = useSlider();
  const [isHovered, setIsHovered] = useState(false);

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
    <section data-nav-theme="dark" className="relative w-full h-[85svh] md:h-screen overflow-hidden select-none" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
          onDragEnd={(e, info) => {
            reset();
            handleDragEnd(e, info);
          }}
          whileDrag={{ cursor: "grabbing" }}
        >
          {SLIDES.map((slide) => (
            <Slide key={slide.id} id={slide.id} bg={slide.bg} accent={slide.accent} image={slide.image} video={"video" in slide ? slide.video : undefined} slideCount={SLIDES.length} />
          ))}
        </motion.div>
      </div>

      {/* 3D logo — centered, translucent glass treatment */}
      <HeroLogo3D />

      {/* Logo — centered bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-17 md:w-25">
        <Image src="/Logo/9t7.svg" alt="9TSEVEN" width={500} height={500} className="w-full h-auto" style={{ width: "100%", height: "auto" }} priority />
      </div>

      <HeroOverlayText current={current} />

      <SlideIndicator current={current} onPrev={handlePrev} onNext={handleNext} onGoTo={handleGoTo} />
    </section>
  );
}
