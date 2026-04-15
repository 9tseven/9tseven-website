"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "./constants";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

export default function ProductCard({ product, cardWidth }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const images = product.images as readonly string[];
  const hasMultiple = images.length > 1;

  const prevImage = (e: React.MouseEvent) => {
    if (isAnimating) return;
    e.stopPropagation();
    setDirection(-1);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    if (isAnimating) return;
    e.stopPropagation();
    setDirection(1);
    setImgIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group" style={{ width: cardWidth, aspectRatio: "4 / 5" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Image with slide animation */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={imgIndex}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: dir * (cardWidth || 300) }),
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

      {/* New Arrival tag */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
        <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
      </div>

      {/* Full-height overlay arrow panels
          Mobile:  always visible at bg-black/10 (no hover needed)
          Desktop: hidden until the card (group) is hovered; panel hover darkens to bg-black/20 */}
      {hasMultiple && (
        <>
          <button
            className="absolute left-0 top-0 bottom-0 w-[15%] z-10
                       flex items-center justify-center
                       bg-black/10
                       md:bg-transparent md:opacity-0
                       md:group-hover:opacity-100 md:hover:bg-black/10
                       focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:-outline-offset-2
                       transition-all duration-200"
            onClick={prevImage}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Previous image"
          >
            <ChevronLeft size={18} strokeWidth={1.25} className="text-white drop-shadow" />
          </button>
          <button
            className="absolute right-0 top-0 bottom-0 w-[15%] z-10
                       flex items-center justify-center
                       bg-black/10
                       md:bg-transparent md:opacity-0
                       md:group-hover:opacity-100 md:hover:bg-black/10
                       focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:-outline-offset-2
                       transition-all duration-200"
            onClick={nextImage}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Next image"
          >
            <ChevronRight size={18} strokeWidth={1.25} className="text-white drop-shadow" />
          </button>
        </>
      )}

      {/* Mobile: price panel — always visible */}
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden">
        <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
        <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">{product.name}</p>
        <p className="text-[9px] text-black/60 mt-1">
          DKK{" "}
          {product.price.toLocaleString("da-DK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Desktop: price panel — animated on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="hidden md:block absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20">
            <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight">{product.name}</p>
            <p className="text-[9px] text-black/60 mt-1">
              DKK{" "}
              {product.price.toLocaleString("da-DK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
