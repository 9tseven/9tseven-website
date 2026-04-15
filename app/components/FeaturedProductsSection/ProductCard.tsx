"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "./constants";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
}

function PeekImage({ src, name, dragX, peekDir, cardWidth }: { src: string; name: string; dragX: MotionValue<number>; peekDir: 1 | -1; cardWidth: number }) {
  const x = useTransform(dragX, (v) => v + peekDir * cardWidth);
  return (
    <motion.div className="absolute inset-0" style={{ x }}>
      <Image src={src} alt={name} fill className="object-cover pointer-events-none" draggable={false} />
    </motion.div>
  );
}

export default function ProductCard({ product, cardWidth }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Drag state
  const [isDragMode, setIsDragMode] = useState(false);
  const [peekIdx, setPeekIdx] = useState(0);
  const [peekDir, setPeekDir] = useState<1 | -1>(1);
  const dragX = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const skipEnterAnim = useRef(false);
  // Mirrors isDragMode as a ref to avoid stale-closure reads inside handlePointerMove.
  const isDragModeRef = useRef(false);

  const images = product.images as readonly string[];
  const hasMultiple = images.length > 1;

  const prevImage = (e: React.MouseEvent) => {
    if (isAnimating || isDragMode) return;
    e.stopPropagation();
    setDirection(-1);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    if (isAnimating || isDragMode) return;
    e.stopPropagation();
    setDirection(1);
    setImgIndex((i) => (i + 1) % images.length);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!hasMultiple || isAnimating || isDragMode) return;
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    dragX.set(delta);

    if (!isDragModeRef.current && Math.abs(delta) > 4) {
      const dir = delta < 0 ? 1 : -1;
      const peek = dir === 1 ? (imgIndex + 1) % images.length : (imgIndex - 1 + images.length) % images.length;
      setPeekDir(dir as 1 | -1);
      setPeekIdx(peek);
      isDragModeRef.current = true;
      setIsDragMode(true);
    }

    e.stopPropagation();
  };

  const commitDrag = (dir: 1 | -1) => {
    const newIndex = dir === 1 ? (imgIndex + 1) % images.length : (imgIndex - 1 + images.length) % images.length;

    animate(dragX, dir * -cardWidth, {
      type: "spring",
      stiffness: 320,
      damping: 36,
      mass: 0.9,
      onComplete: () => {
        skipEnterAnim.current = true;
        dragX.set(0);
        setDirection(dir);
        setImgIndex(newIndex);
        isDragModeRef.current = false;
        setIsDragMode(false);
      },
    });
  };

  const snapBack = () => {
    animate(dragX, 0, {
      type: "spring",
      stiffness: 320,
      damping: 36,
      mass: 0.9,
      onComplete: () => {
        dragX.set(0);
        isDragModeRef.current = false;
        setIsDragMode(false);
      },
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    e.stopPropagation();

    const delta = dragX.get();
    if (Math.abs(delta) >= 40) {
      commitDrag(delta < 0 ? 1 : -1);
    } else {
      snapBack();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // browser already released pointer capture on cancel — do not call releasePointerCapture
    e.stopPropagation();
    snapBack();
  };

  return (
    <div className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group" style={{ width: cardWidth, aspectRatio: "4 / 5", touchAction: "pan-y" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
      {/* ── Drag mode: two manually positioned images ── */}
      {isDragMode && (
        <>
          <motion.div className="absolute inset-0" style={{ x: dragX }}>
            <Image src={images[imgIndex]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} />
          </motion.div>
          <PeekImage src={images[peekIdx]} name={product.name} dragX={dragX} peekDir={peekDir} cardWidth={cardWidth} />
        </>
      )}

      {/* ── Normal mode: AnimatePresence slide ── */}
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
            onAnimationStart={() => {
              setIsAnimating(true);
            }}
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

      {/* Full-height overlay arrow panels
          Mobile:  always visible at bg-black/10 (no hover needed)
          Desktop: hidden until the card (group) is hovered; panel hover darkens to bg-black/10 */}
      {hasMultiple && (
        <>
          <button
            type="button"
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
            type="button"
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
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden flex items-center gap-2">
        {/* Left: category + name + price */}
        <div className="flex-1 min-w-0">
          <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight truncate">{product.name}</p>
          <p className="text-[9px] text-black/60 mt-1">DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        {/* Center: sizes */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <p className="text-[6px] tracking-[0.2em] uppercase text-black/30">Sizes</p>
          <div className="flex gap-1 flex-wrap justify-center">
            {(product.sizes as readonly string[]).map((s) => (
              <span key={s} className="text-[7px] tracking-[0.06em] uppercase text-black/55 font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
        {/* Right: add to cart */}
        <button type="button" onPointerDown={(e) => e.stopPropagation()} className="shrink-0 w-7 h-7 flex items-center justify-center bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
          <span className="text-[15px] leading-none font-light">+</span>
        </button>
      </div>

      {/* Desktop: price panel — animated on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="hidden md:flex absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 items-center gap-2">
            {/* Left: category + name + price */}
            <div className="flex-1 min-w-0">
              <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
              <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight truncate">{product.name}</p>
              <p className="text-[9px] text-black/60 mt-1">DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            {/* Center: sizes */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <p className="text-[6px] tracking-[0.2em] uppercase text-black/30">Sizes</p>
              <div className="flex gap-1 flex-wrap justify-center">
                {(product.sizes as readonly string[]).map((s) => (
                  <span key={s} className="text-[7px] tracking-[0.06em] uppercase text-black/55 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {/* Right: add to cart */}
            <button type="button" onPointerDown={(e) => e.stopPropagation()} className="shrink-0 w-7 h-7 flex items-center justify-center bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
              <span className="text-[16px] leading-none font-light">+</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
