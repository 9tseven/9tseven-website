"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";

interface CommunityHeroProps {
  scrollYProgress?: MotionValue<number>;
}

export default function CommunityHero({ scrollYProgress: external }: CommunityHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: internal } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const progress = external ?? internal;
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const initialInsetX = isMobile ? 10 : 25;
  const initialInsetY = isMobile ? 30 : 25;
  const finalInsetX = isMobile ? -8 : 0;
  const finalInsetY = 0;

  const clipStartX = useTransform(progress, [0, 1], [initialInsetX, finalInsetX]);
  const clipStartY = useTransform(progress, [0, 1], [initialInsetY, finalInsetY]);
  const clipEndX = useTransform(progress, [0, 1], [100 - initialInsetX, 100 - finalInsetX]);
  const clipEndY = useTransform(progress, [0, 1], [100 - initialInsetY, 100 - finalInsetY]);
  const clipPath = useMotionTemplate`polygon(${clipStartX}% ${clipStartY}%, ${clipEndX}% ${clipStartY}%, ${clipEndX}% ${clipEndY}%, ${clipStartX}% ${clipEndY}%)`;
  const scale = useTransform(progress, [0, 1], [1.4, 1]);

  return (
    <section ref={sectionRef} data-nav-theme="light" className="relative w-screen h-[75vh] min-h-128 md:h-screen md:min-h-176 flex items-center justify-center overflow-hidden">
      <motion.div className="absolute -inset-x-[8%] inset-y-0 md:inset-0" style={prefersReducedMotion ? undefined : { clipPath, willChange: "clip-path" }}>
        <motion.div className="absolute inset-0" style={prefersReducedMotion ? undefined : { scale, willChange: "transform" }}>
          <Image src="/images/PhotoSection/photo-section6.webp" alt="Community Hero" fill priority sizes="100vw" quality={65} className="object-cover object-[center_60%]" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-5xl font-bold leading-none tracking-tight text-white md:text-6xl lg:text-[10rem]">Community</h1>
      </div>
      <div className="absolute inset-x-0 bottom-25 flex flex-col items-center pointer-events-none">
        <p className="text-md font-mono tracking-tight text-white uppercase">— More Than Running —</p>
      </div>
      <div className="absolute inset-x-0 top-25 flex flex-col items-center pointer-events-none">
        <p className="text-md font-mono tracking-tight text-white uppercase">— 9TSEVEN — 2026 —</p>
      </div>
    </section>
  );
}
