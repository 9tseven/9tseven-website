"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "../types";
import { useImageSlider } from "./useImageSlider";
import ProductCardInfo, { ProductCardStackedMobile } from "./ProductCardInfo";
import ProductCardTags from "./ProductCardTags";

interface ProductCardProps {
  product: Product;
  cardWidth?: number;
  href?: string;
  mobileLayout?: "overlay" | "stacked";
}

export default function ProductCard({ product, cardWidth, href, mobileLayout = "overlay" }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mobileIdx, setMobileIdx] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const images = product.images;

  const { hoverIdx, hasMultiple, hasDragged, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove } = useImageSlider({ images });

  const handleClick = () => {
    if (href && !hasDragged.current) router.push(href);
  };

  const handleMobileScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== mobileIdx) setMobileIdx(Math.max(0, Math.min(images.length - 1, idx)));
  };

  const useMobileCarousel = mobileLayout === "stacked";

  return (
    <div
      className={`cursor-pointer ${cardWidth === undefined ? "w-full" : "shrink-0"}`}
      style={cardWidth === undefined ? undefined : { width: cardWidth }}
      onClick={handleClick}
    >
      {/* Desktop image (also used on mobile when layout="overlay") */}
      <div
        className={`${useMobileCarousel ? "hidden md:block" : ""} relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden group${product.isSoldOut ? " opacity-60 grayscale" : ""}`}
        style={{ aspectRatio: "4 / 5" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          handleCardMouseLeave();
        }}
        onMouseMove={handleCardMouseMove}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="absolute inset-0">
          <Image src={images[hoverIdx]} alt={product.name} fill className="object-cover pointer-events-none" sizes="(max-width: 768px) 50vw, 25vw" draggable={false} />
        </div>

        <ProductCardTags product={product} />

        {hasMultiple && hovered && (
          <div className="hidden md:flex w-[90%] justify-self-center absolute bottom-30 left-0 right-0 z-10 gap-px">
            {images.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 bg-white transition-opacity duration-150" style={{ opacity: i === hoverIdx ? 1 : 0.3 }} />
            ))}
          </div>
        )}

        <ProductCardInfo product={product} hovered={hovered} mobileLayout={mobileLayout} />
      </div>

      {/* Mobile scroll-snap carousel (only when stacked layout) */}
      {useMobileCarousel && (
        <div
          className={`md:hidden relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden${product.isSoldOut ? " opacity-60 grayscale" : ""}`}
          style={{ aspectRatio: "4 / 5" }}
        >
          <div
            ref={scrollerRef}
            onScroll={handleMobileScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x" } as React.CSSProperties}
          >
            {images.map((src, i) => (
              <div key={i} className="relative shrink-0 w-full h-full snap-center">
                <Image
                  src={src}
                  alt={product.name}
                  fill
                  className="object-cover pointer-events-none select-none"
                  sizes="50vw"
                  draggable={false}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <ProductCardTags product={product} />

          {hasMultiple && (
            <div className="flex w-[90%] justify-self-center absolute bottom-3 left-0 right-0 z-10 gap-px pointer-events-none">
              {images.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 bg-white transition-opacity duration-150" style={{ opacity: i === mobileIdx ? 1 : 0.3 }} />
              ))}
            </div>
          )}
        </div>
      )}

      {mobileLayout === "stacked" && <ProductCardStackedMobile product={product} />}
    </div>
  );
}
