"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "../types";
import { useImageSlider } from "./useImageSlider";
import ProductCardInfo, { ProductCardStackedMobile } from "./ProductCardInfo";

interface ProductCardProps {
  product: Product;
  cardWidth?: number;
  href?: string;
  mobileLayout?: "overlay" | "stacked";
}

export default function ProductCard({ product, cardWidth, href, mobileLayout = "overlay" }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const images = product.images;

  const { hoverIdx, hasMultiple, hasDragged, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove } = useImageSlider({ images });

  const handleClick = () => {
    if (href && !hasDragged.current) router.push(href);
  };

  return (
    <div
      className={`cursor-pointer ${cardWidth === undefined ? "w-full" : "shrink-0"}`}
      style={cardWidth === undefined ? undefined : { width: cardWidth }}
      onClick={handleClick}
    >
      <div
        className="relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden group"
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

        {/* New Arrival tag */}
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
          <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
        </div>

        {/* Image progress bar — desktop only */}
        {hasMultiple && hovered && (
          <div className="hidden md:flex w-[90%] justify-self-center absolute bottom-30 left-0 right-0 z-10 gap-px">
            {images.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 bg-white transition-opacity duration-150" style={{ opacity: i === hoverIdx ? 1 : 0.3 }} />
            ))}
          </div>
        )}

        {/* Product info panel (desktop hover overlay + mobile overlay when layout="overlay") */}
        <ProductCardInfo product={product} hovered={hovered} mobileLayout={mobileLayout} />
      </div>

      {/* Stacked mobile info — rendered below image when opted in */}
      {mobileLayout === "stacked" && <ProductCardStackedMobile product={product} />}
    </div>
  );
}
