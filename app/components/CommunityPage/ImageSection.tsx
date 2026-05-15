"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import Image from "next/image";
import { IMAGES } from "./constants";
import CommunityHero from "./CommunityHero";

type ImageItem = (typeof IMAGES)[number];

// vw/vh units scale automatically with viewport — same visual proportion on all screen sizes
const OFFSETS = [
  { x: "19vw", y: "-8vh" },
  { x: "-18vw", y: "-1vh" },
  { x: "20vw", y: "6vh" },
  { x: "-20vw", y: "12vh" },
];

function AnimatedImage({ img, index, order, total, scrollYProgress }: { img: ImageItem; index: number; order: number; total: number; scrollYProgress: MotionValue<number> }) {
  const start = order / total;
  const end = (order + 1) / total;
  const translateY = useTransform(scrollYProgress, [start, end], ["0vh", "-120vh"]);
  const { x, y } = OFFSETS[index % OFFSETS.length] as { x: string; y: string };

  return (
    <motion.div className="absolute" style={{ translateY, x, y, zIndex: total - order }}>
      <Image src={img.src} alt={img.alt} width={320 * 3.6} height={420 * 3.6} sizes={img.sizes} className="object-cover w-[80vw] md:w-[1152px] h-[48vh] md:h-[auto]" />
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
    <section className="md:px-20 bg-white overflow-x-clip" data-nav-theme="light">
      <div ref={wrapperRef} style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 h-[80vh] min-h-136 md:h-screen md:min-h-176 flex items-center justify-center">
          <CommunityHero scrollYProgress={scrollYProgress} />
          {IMAGES.map((img, i) => (
            <AnimatedImage key={img.id} img={img} index={i} order={i} total={N} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
