"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Slide from "./Slide";
import SlideIndicator from "./SlideIndicator";
import HeroOverlayText from "./HeroOverlayText";
import { useSlider } from "./hooks/useSlider";
import { SLIDES } from "./constants";

export default function HeroSection() {
  const { current, slideWidth, containerRef, x, handleDragEnd, prev, next } = useSlider();

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
            <Slide key={slide.id} id={slide.id} bg={slide.bg} accent={slide.accent} image={slide.image} slideCount={SLIDES.length} />
          ))}
        </motion.div>
      </div>

      {/* Logo — centered bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-17 md:w-25">
        <Image src="/Logo/9t7.svg" alt="9TSEVEN" width={500} height={500} className="w-full h-auto" priority />
      </div>

      <HeroOverlayText current={current} />

      <SlideIndicator current={current} onPrev={prev} onNext={next} />
    </section>
  );
}
