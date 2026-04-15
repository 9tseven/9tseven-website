"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "../constants";
import { useImageSlider } from "./useImageSlider";
import PeekImage from "./PeekImage";
import ProductCardArrows from "./ProductCardArrows";
import ProductCardInfo from "./ProductCardInfo";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

export default function ProductCard({ product, cardWidth }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const images = product.images as readonly string[];

  const { imgIndex, direction, setIsAnimating, isDragMode, peekIdx, peekDir, dragX, skipEnterAnim, hasMultiple, prevImage, nextImage, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel } = useImageSlider({ images, cardWidth });

  return (
    <div className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group" style={{ width: cardWidth, aspectRatio: "4 / 5", touchAction: "pan-x pan-y" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
      {/* Drag mode: two manually positioned images */}
      {isDragMode && (
        <>
          <motion.div className="absolute inset-0" style={{ x: dragX }}>
            <Image src={images[imgIndex]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
          <PeekImage src={images[peekIdx]} name={product.name} dragX={dragX} peekDir={peekDir} cardWidth={cardWidth} />
        </>
      )}

      {/* Normal mode: AnimatePresence slide */}
      <div className={isDragMode ? "opacity-0 pointer-events-none" : ""}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={imgIndex}
            custom={direction}
            variants={{
              enter: (dir: number) => {
                const skip = skipEnterAnim.current;
                skipEnterAnim.current = false;
                return { x: skip ? 0 : dir * (cardWidth || 300) };
              },
              center: { x: 0 },
              exit: (dir: number) => ({ x: -dir * (cardWidth || 300) }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 36, mass: 0.9 }}
            className="absolute inset-0"
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
          >
            <Image src={images[imgIndex]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* New Arrival tag */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
        <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
      </div>

      {/* Arrow navigation — desktop only */}
      {hasMultiple && <ProductCardArrows onPrev={prevImage} onNext={nextImage} />}

      {/* Product info panel */}
      <ProductCardInfo product={product} hovered={hovered} />
    </div>
  );
}
