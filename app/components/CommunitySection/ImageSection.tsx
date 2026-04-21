"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import Image from "next/image";
import { IMAGES } from "./constants";
import AsciiRun from "./AsciiRun";

type ImageItem = (typeof IMAGES)[number];

// vw/vh units scale automatically with viewport — same visual proportion on all screen sizes
const OFFSETS = [
  { x: "14vw", y: "-5vh" },
  { x: "-7vw", y: "-1vh" },
  { x: "15vw", y: "5vh" },
  { x: "-16vw", y: "10vh" },
];

function AnimatedImage({ img, index, order, total, scrollYProgress }: { img: ImageItem; index: number; order: number; total: number; scrollYProgress: MotionValue<number> }) {
  const start = order / total;
  const end = (order + 1) / total;
  const translateY = useTransform(scrollYProgress, [start, end], ["0vh", "-120vh"]);
  const { x, y } = OFFSETS[index % OFFSETS.length] as { x: string; y: string };

  return (
    <motion.div className="absolute" style={{ translateY, x, y, zIndex: total - order }}>
      <Image src={img.src} alt={img.alt} width={320 * 3.2} height={420 * 3.2} sizes={img.sizes} className="object-cover" />
    </motion.div>
  );
}

export default function ImageSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const N = IMAGES.length;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="px-20 md:p-20 bg-white" data-nav-theme="light">
      <div ref={wrapperRef} style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          {IMAGES.map((img, i) => (
            <AnimatedImage key={img.id} img={img} index={i} order={i} total={N} scrollYProgress={scrollYProgress} />
          ))}
          <AsciiRun></AsciiRun>
        </div>
      </div>
    </section>
  );
}
