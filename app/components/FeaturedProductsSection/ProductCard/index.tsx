"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "../constants";
import { useImageSlider } from "./useImageSlider";
import PeekImage from "./PeekImage";
import ProductCardInfo from "./ProductCardInfo";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

export default function ProductCard({ product, cardWidth }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const images = product.images as readonly string[];

  const { imgIndex, hoverIdx, isDragMode, peekIdx, peekDir, dragX, hasMultiple, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel } = useImageSlider({ images, cardWidth });

  return (
    <div
      className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group"
      style={{ width: cardWidth, aspectRatio: "4 / 5", touchAction: "pan-x pan-y" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        handleCardMouseLeave();
      }}
      onMouseMove={handleCardMouseMove}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Drag mode: two manually positioned images */}
      {isDragMode && (
        <>
          <motion.div className="absolute inset-0" style={{ x: dragX }}>
            <Image src={images[imgIndex]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
          <PeekImage src={images[peekIdx]} name={product.name} dragX={dragX} peekDir={peekDir} cardWidth={cardWidth} />
        </>
      )}

      {/* Normal mode: image driven by mouse X position */}
      {!isDragMode && (
        <div className="absolute inset-0">
          <Image src={images[hoverIdx]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
        </div>
      )}

      {/* New Arrival tag */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
        <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
      </div>

      {/* Image progress bar — desktop only */}
      {hasMultiple && hovered && (
        <div className="hidden md:flex w-[90%] justify-self-center absolute bottom-30 left-0 right-0 z-10 gap-px">
          {images.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-white transition-opacity duration-150" style={{ opacity: i === hoverIdx ? 1 : 0.3 }} />
          ))}
        </div>
      )}

      {/* Product info panel */}
      <ProductCardInfo product={product} hovered={hovered} />
    </div>
  );
}
