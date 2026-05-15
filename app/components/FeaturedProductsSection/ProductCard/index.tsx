"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "../types";
import { useImageSlider } from "./useImageSlider";
import ProductCardInfo from "./ProductCardInfo";
import ProductCardStackedMobile from "./ProductCardStackedMobile";
import ProductCardTags from "./ProductCardTags";

interface ProductCardProps {
  product: Product;
  cardWidth?: number;
  href?: string;
  mobileLayout?: "overlay" | "stacked";
  desktopInfo?: "hover" | "static";
  isFirstCard?: boolean;
}

export default function ProductCard({ product, cardWidth, href, mobileLayout = "overlay", desktopInfo = "hover", isFirstCard = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mobileIdx, setMobileIdx] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const images = product.images;

  const { hoverIdx, slidePosition, hasMultiple, hasDragged, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove } = useImageSlider({ images });

  const handleClick = () => {
    if (href && !hasDragged.current) router.push(href);
  };

  const handleMobileScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== mobileIdx) setMobileIdx(Math.max(0, Math.min(images.length - 1, idx)));
  };

  const staticInfo = desktopInfo === "static";
  const useMobileCarousel = mobileLayout === "stacked";

  return (
    <div className={`cursor-pointer ${cardWidth === undefined ? "w-full" : "shrink-0"}`} style={cardWidth === undefined ? undefined : { width: cardWidth }} onClick={handleClick}>
      <div
        className={`${useMobileCarousel ? "hidden md:block" : ""} relative w-full bg-light-grey rounded-sm overflow-hidden group${product.isSoldOut ? " opacity-60 grayscale" : ""}`}
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
        <div className="absolute inset-0 flex will-change-transform" style={{ transform: `translate3d(-${slidePosition * 100}%, 0, 0)` }}>
          {images.map((src, i) => (
            <div key={i} className="relative shrink-0 w-full h-full">
              <Image src={src} alt={product.name} fill className="object-cover pointer-events-none" sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw" quality={65} draggable={false} priority={isFirstCard && i === 0} loading={isFirstCard && i === 0 ? undefined : "lazy"} />
            </div>
          ))}
        </div>

        <ProductCardTags product={product} />

        {hasMultiple && hovered && (
          <div className="hidden md:flex w-[90%] justify-self-center absolute bottom-30 left-0 right-0 z-10 gap-px items-end">
            {images.map((_, i) => {
              const active = i === hoverIdx;
              return <div key={i} className={`flex-1 bg-white [transition:height_200ms_ease,opacity_150ms_ease] ${active ? "h-1 opacity-100" : "h-0.5 opacity-30"}`} />;
            })}
          </div>
        )}

        {staticInfo ? (
          <ProductCardInfo product={product} alwaysVisible />
        ) : (
          <ProductCardInfo product={product} hovered={hovered} mobileLayout={mobileLayout} />
        )}
      </div>

      {/* Mobile scroll-snap carousel */}
      {useMobileCarousel && (
        <div className={`md:hidden relative w-full bg-light-grey rounded-sm overflow-hidden${product.isSoldOut ? " opacity-60 grayscale" : ""}`} style={{ aspectRatio: "4 / 5" }}>
          <div ref={scrollerRef} onScroll={handleMobileScroll} className="flex h-full w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x" } as React.CSSProperties}>
            {images.map((src, i) => (
              <div key={i} className="relative shrink-0 w-full h-full snap-center">
                <Image src={src} alt={product.name} fill className="object-cover pointer-events-none select-none" sizes="50vw" quality={65} draggable={false} priority={isFirstCard && i === 0} loading={isFirstCard && i === 0 ? undefined : "lazy"} />
              </div>
            ))}
          </div>

          <ProductCardTags product={product} />

          {hasMultiple && (
            <div className="flex w-[90%] justify-self-center absolute bottom-3 left-0 right-0 z-10 gap-px items-end pointer-events-none">
              {images.map((_, i) => {
                const active = i === mobileIdx;
                return <div key={i} className={`flex-1 bg-white [transition:height_200ms_ease,opacity_150ms_ease] ${active ? "h-1 opacity-100" : "h-0.5 opacity-30"}`} />;
              })}
            </div>
          )}
        </div>
      )}

      {mobileLayout === "stacked" && <ProductCardStackedMobile product={product} />}
    </div>
  );
}
