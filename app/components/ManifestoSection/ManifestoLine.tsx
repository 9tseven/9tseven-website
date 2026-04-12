"use client";

import { motion, useTransform, useMotionValue, useMotionValueEvent, MotionValue } from "motion/react";

interface ManifestoLineProps {
  text: string;
  inputRange: [number, number];
  scrollYProgress: MotionValue<number>;
}

export default function ManifestoLine({ text, inputRange, scrollYProgress }: ManifestoLineProps) {
  const targetOpacity = useTransform(scrollYProgress, inputRange, [0.12, 1]);
  const opacity = useMotionValue(0.12);

  useMotionValueEvent(targetOpacity, "change", (latest) => {
    if (latest > opacity.get()) {
      opacity.set(latest);
    }
  });

  return (
    <motion.p style={{ opacity }} className="text-sm md:text-base font-semibold leading-relaxed text-black">
      {text}
    </motion.p>
  );
}
