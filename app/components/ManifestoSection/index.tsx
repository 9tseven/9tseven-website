"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import ManifestoLine from "./ManifestoLine";
import { LINES, MANIFEST_IMAGES } from "./constants";

const IMAGE_POSITIONS = [
  { top: "5%", left: "28%", rotate: 0.2, zIndex: 1 },
  { top: "28%", left: "47%", rotate: 0, zIndex: 2 },
  { top: "52%", left: "20%", rotate: -0.2, zIndex: 3 },
];

function ManifestImage({ src, alt, position, index }: { src: string; alt: string; position: (typeof IMAGE_POSITIONS)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.2 }}
      style={{
        top: position.top,
        left: position.left,
        rotate: position.rotate,
        zIndex: position.zIndex,
      }}
      className="absolute w-[50%] aspect-4/3 shadow-xl overflow-hidden"
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  );
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.2"],
  });

  return (
    <section ref={sectionRef} data-nav-theme="light" className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Manifesto text */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-16 px-6 md:py-24 md:pl-12 md:pr-16 order-1 md:order-2">
        <div className="max-w-md">
          <p className="text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase text-black/40 mb-2 md:mb-3">9TSEVEN</p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[0.12em] uppercase text-black mb-1">Manifesto</h2>
          <p className="text-xs md:text-sm font-medium text-black/50 italic mb-4 md:mb-6">A guidance of living.</p>
          <div className="w-8 h-px bg-black/20 mb-6 md:mb-8" />
          <div className="flex flex-col gap-3 md:gap-4">
            {LINES.map((line, i) => {
              const start = i * 0.055;
              const end = start + 0.08;
              return <ManifestoLine key={i} text={line} inputRange={[start, end]} scrollYProgress={scrollYProgress} />;
            })}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="w-full md:w-1/2 order-2 md:order-1">
        {/* Desktop: overlapping absolute grid */}
        <div className="hidden md:block relative h-full min-h-150 overflow-hidden">
          {MANIFEST_IMAGES.map((img, i) => (
            <ManifestImage key={i} src={img.src} alt={img.alt} position={IMAGE_POSITIONS[i]} index={i} />
          ))}
        </div>

        {/* Mobile: stacked overlapping grid */}
        <div className="md:hidden relative h-80 mx-auto max-w-sm mb-12 overflow-hidden">
          {MANIFEST_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.2 }}
              className="absolute w-[40%] aspect-3/4 shadow-xl overflow-hidden"
              style={{
                top: `${i * 18}%`,
                left: `${5 + i * 25}%`,
                rotate: IMAGE_POSITIONS[i].rotate,
                zIndex: IMAGE_POSITIONS[i].zIndex,
              }}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
