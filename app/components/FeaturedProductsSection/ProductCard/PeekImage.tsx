import Image from "next/image";
import { motion, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";

interface PeekImageProps {
  src: string;
  name: string;
  dragX: MotionValue<number>;
  peekDir: 1 | -1;
  cardWidth: number;
}

export default function PeekImage({ src, name, dragX, peekDir, cardWidth }: PeekImageProps) {
  const x = useTransform(dragX, (v) => v + peekDir * cardWidth);
  return (
    <motion.div className="absolute inset-0" style={{ x }}>
      <Image src={src} alt={name} fill quality={65} sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw" className="object-cover pointer-events-none" draggable={false} />
    </motion.div>
  );
}
