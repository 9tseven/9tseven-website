// app/products/components/ProductDetailView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "../../components/FeaturedProductsSection/constants";
import ProductAccordion from "./ProductAccordion";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const images = product.images as readonly string[];
  const sizes = product.sizes as readonly string[];

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const soldOut = new Set(product.soldOutSizes as readonly string[]);

  const sizeSelector = (
    <div>
      <p className="text-[8px] tracking-[0.2em] uppercase text-black/30 mb-3">Select size</p>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((size) => {
          const out = soldOut.has(size);
          const selected = selectedSize === size;
          return (
            <button key={size} type="button" disabled={out} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-[9px] tracking-widest uppercase border transition-colors duration-150 ${out ? "border-black/10 text-black/25 line-through cursor-not-allowed" : selected ? "border-black bg-black text-white" : "border-black/20 text-black/60 hover:border-black hover:text-black"}`}>
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );

  const addToCartButton = (
    <button type="button" className="w-full bg-black text-white text-[9px] tracking-[0.25em] uppercase py-4 hover:bg-black/80 transition-colors duration-200">
      Add to cart
    </button>
  );

  const priceLabel = `DKK ${product.price.toLocaleString("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="flex flex-col md:flex-row">
      {/* LEFT / TOP column: image stack + mobile sticky bottom bar */}
      <div className="relative w-full md:w-[60%] flex flex-col">
        {/* Grid overlay: button scope is shorter than images so sticky stops early */}
        <div className="grid grid-cols-1">
          {/* Button scope — ends 5rem before the images do */}
          <div className="row-start-1 col-start-1 pointer-events-none" style={{ height: "calc(100% - 2rem)" }}>
            <div className="sticky top-10 z-20 px-5 pt-4 pointer-events-none">
              <button type="button" onClick={() => router.back()} className="pointer-events-auto px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-black/20 text-[9px] tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors duration-200">
                ← Back
              </button>
            </div>
          </div>

          {/* Image stack — full height, same grid cell */}
          <div className="row-start-1 col-start-1 flex flex-col">
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="relative w-full aspect-4/5 bg-[#e0e0e0]">
                <Image src={src} alt={`${product.name} — image ${i + 1}`} fill className="object-cover" priority={i === 0} sizes="(min-width: 768px) 60vw, 100vw" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="md:hidden sticky bottom-0 z-10 bg-white border-t border-black/8 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-sm font-black uppercase tracking-tight text-black truncate">{product.name}</h1>
            <p className="text-xs text-black/60 shrink-0">{priceLabel}</p>
          </div>
          {sizeSelector}
          {addToCartButton}
        </div>
      </div>

      {/* RIGHT / BOTTOM column: desktop sticky info panel + accordion (accordion shows on mobile too) */}
      <div className="w-full md:w-[40%] md:sticky md:top-16 md:self-start md:max-h-[calc(100vh-64px)] md:overflow-y-auto bg-white">
        {/* Desktop-only header block */}
        <div className="hidden md:flex flex-col gap-6 px-6 md:px-10 py-8">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-black/30 mb-1">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-none">{product.name}</h1>
            <p className="text-sm text-black/50 mt-2">{priceLabel}</p>
          </div>

          <div className="h-px bg-black/8" />

          {sizeSelector}

          {addToCartButton}
        </div>

        {/* Accordion — desktop: inside sticky panel; mobile: below sticky bottom bar */}
        <div className="px-6 md:px-10 pb-8 md:pt-0 pt-2">
          <ProductAccordion product={product} />
        </div>
      </div>
    </div>
  );
}
