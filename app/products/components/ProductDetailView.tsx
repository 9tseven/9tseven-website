// app/products/components/ProductDetailView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "../../components/FeaturedProductsSection/types";
import { useCart } from "@/app/context/CartContext";
import ProductAccordion from "./ProductAccordion";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { addLine, openCart, pending } = useCart();
  const images = product.images;
  const sizes = product.sizes;
  const hasSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const soldOut = new Set(product.soldOutSizes);

  const selectedVariant = hasSizes ? (product.variants.find((v) => v.size === selectedSize) ?? null) : (product.variants[0] ?? null);
  const canAddToCart = selectedVariant !== null && selectedVariant.availableForSale && !pending;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addLine(selectedVariant.id, 1);
    openCart();
  };

  const sizeSelector = (
    <div>
      <p className="text-[8px] tracking-eyebrow uppercase text-ink-faint mb-3">Select size</p>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((size) => {
          const out = soldOut.has(size);
          const selected = selectedSize === size;
          return (
            <button key={size} type="button" disabled={out} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-[9px] font-mono tracking-eyebrow uppercase border transition-colors duration-fast ${out ? "border-ink/10 text-ink-faint line-through cursor-not-allowed" : selected ? "border-ink bg-ink text-fg" : "border-ink/20 text-ink-subtle hover:border-ink hover:text-ink"}`}>
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );

  const addToCartButton = (
    <button type="button" onClick={handleAddToCart} disabled={!canAddToCart} className="w-full bg-ink text-fg text-[9px] tracking-eyebrow uppercase py-4 hover:bg-bg/80 transition-colors duration-base disabled:bg-bg/60 disabled:cursor-not-allowed">
      {pending ? "Adding…" : hasSizes && !selectedSize ? "Select size" : product.isSoldOut ? "Sold out" : "Add to cart"}
    </button>
  );

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const formatPrice = (n: number) => n.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const priceLabel = (
    <>
      DKK {formatPrice(product.price)}
      {onSale && <span className="ml-2 line-through text-ink-faint">DKK {formatPrice(product.compareAtPrice!)}</span>}
    </>
  );

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative w-full md:w-[60%] flex flex-col">
        <div className="grid grid-cols-1">
          <div className="row-start-1 col-start-1 pointer-events-none" style={{ height: "calc(100% - 2rem)" }}>
            <div className="sticky top-10 z-20 px-5 pt-4 pointer-events-none">
              <button type="button" onClick={() => router.back()} className="pointer-events-auto px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-ink/20 text-[9px] tracking-eyebrow uppercase text-ink-subtle hover:text-ink transition-colors duration-base">
                ← Back
              </button>
            </div>
          </div>

          <div className="row-start-1 col-start-1 flex flex-col">
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="relative w-full aspect-4/5 bg-light-grey">
                <Image src={src} alt={`${product.name} — image ${i + 1}`} fill className="object-cover" priority={i === 0} sizes="(min-width: 768px) 60vw, 100vw" />
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden sticky bottom-0 z-10 bg-white border-t border-ink/10 shadow-[0_-4px_16px_rgb(0_0_0/0.06)] px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-sm font-black uppercase tracking-tight text-ink truncate">{product.name}</h1>
            <p className="text-xs text-ink-subtle shrink-0">{priceLabel}</p>
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
            <p className="text-[9px] tracking-eyebrow uppercase text-ink-faint mb-1">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-ink leading-none">{product.name}</h1>
            <p className="text-sm text-ink-subtle mt-2">{priceLabel}</p>
          </div>

          <div className="h-px bg-tint" />

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
