// app/products/components/ProductDetailView.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "../../components/FeaturedProductsSection/constants";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const images = product.images as readonly string[];
  const sizes = product.sizes as readonly string[];

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Swipe on mobile
  const dragStart = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const delta = e.clientX - dragStart.current;
    if (delta < -50 && activeIdx < images.length - 1) {
      setActiveIdx((i) => i + 1);
    } else if (delta > 50 && activeIdx > 0) {
      setActiveIdx((i) => i - 1);
    }
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* Image panel */}
      <div className="relative w-full md:w-[55%] aspect-[4/5] bg-[#e0e0e0] select-none flex-shrink-0 cursor-grab active:cursor-grabbing" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} style={{ touchAction: "pan-y" }}>
        {/* Back button — overlays image */}
        <button type="button" onClick={() => router.back()} onPointerDown={(e) => e.stopPropagation()} className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-[9px] tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors duration-200">
          ← Back
        </button>

        <Image src={images[activeIdx]} alt={product.name} fill className="object-cover pointer-events-none" draggable={false} priority />

        {/* Image progress dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={() => setActiveIdx(i)}
                className="w-5 h-[2px] transition-opacity duration-150"
                style={{
                  background: "#fff",
                  opacity: i === activeIdx ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="flex-1 flex flex-col gap-6 px-6 md:px-10 py-8 bg-white">
        {/* Product meta */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-black/30 mb-1">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-none">{product.name}</h1>
          <p className="text-sm text-black/50 mt-2">DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="h-px bg-black/8" />

        {/* Size selector */}
        <div>
          <p className="text-[8px] tracking-[0.2em] uppercase text-black/30 mb-3">Select size</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-[9px] tracking-[0.1em] uppercase border transition-colors duration-150 ${selectedSize === size ? "border-black bg-black text-white" : "border-black/20 text-black/60 hover:border-black hover:text-black"}`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to cart — placeholder */}
        <button type="button" className="mt-auto w-full bg-black text-white text-[9px] tracking-[0.25em] uppercase py-4 hover:bg-black/80 transition-colors duration-200">
          Add to cart
        </button>
      </div>
    </div>
  );
}
