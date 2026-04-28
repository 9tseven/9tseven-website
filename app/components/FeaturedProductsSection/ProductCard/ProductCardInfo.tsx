"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "../types";
import { useCart } from "@/app/context/CartContext";

interface ProductCardInfoProps {
  product: Product;
  hovered: boolean;
  mobileLayout?: "overlay" | "stacked";
}

function resolveVariant(product: Product, selectedSize: string | null) {
  if (product.sizes.length > 0) {
    return product.variants.find((v) => v.size === selectedSize) ?? null;
  }
  return product.variants[0] ?? null;
}

function InfoContent({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addLine, openCart, pending } = useCart();
  const soldOut = new Set(product.soldOutSizes as readonly string[]);
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  const selectedVariant = resolveVariant(product, selectedSize);
  const canAddToCart = selectedVariant !== null && selectedVariant.availableForSale && !pending;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addLine(selectedVariant.id, 1);
    openCart();
  };

  return (
    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight truncate">{product.name}</p>
        </div>
        {!product.isSoldOut && (
          <button type="button" onClick={handleAddToCart} onPointerDown={(e) => e.stopPropagation()} disabled={!canAddToCart} aria-label={product.sizes.length > 0 && !selectedSize ? "Select a size to add to cart" : "Add to cart"} className="shrink-0 flex items-center justify-center gap-1.5 px-3 h-7 bg-black text-white hover:bg-black/80 transition-colors duration-200 disabled:bg-black/30 disabled:cursor-not-allowed">
            <span className="text-[15px] leading-none font-light">+</span>
            <span className="text-[8px] tracking-[0.12em] uppercase font-medium leading-none">{pending ? "Adding…" : "Add to cart"}</span>
          </button>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] text-black/60 shrink-0">
          DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {onSale && <span className="ml-1.5 line-through text-black/30">DKK {product.compareAtPrice!.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
        </p>
        <div className="flex flex-wrap justify-end gap-1">
          {(product.sizes as readonly string[]).map((s) => {
            const out = soldOut.has(s);
            const selected = selectedSize === s;
            return (
              <button key={s} type="button" disabled={out} onClick={() => setSelectedSize(selected ? null : s)} className={`text-[9px] tracking-[0.05em] uppercase font-medium px-1.5 py-1 leading-none relative transition-colors duration-150 ${out ? "text-black/25 bg-black/5 cursor-not-allowed" : selected ? "bg-black text-white" : "text-black/70 bg-black/8 hover:bg-black/15"}`}>
                {s}
                {out && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden preserveAspectRatio="none">
                    <line x1="0" y1="100%" x2="100%" y2="0" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StackedMobileContent({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addLine, openCart, pending } = useCart();
  const soldOut = new Set(product.soldOutSizes as readonly string[]);
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  const selectedVariant = resolveVariant(product, selectedSize);
  const canAddToCart = selectedVariant !== null && selectedVariant.availableForSale && !pending;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addLine(selectedVariant.id, 1);
    openCart();
  };

  return (
    <div className="flex flex-col px-0.5 pt-3 pb-1" style={{ minHeight: "clamp(200px, 28vw, 260px)" }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <p className="text-[9px] tracking-[0.18em] uppercase text-black/45">{product.category}</p>
      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-black leading-tight mt-1 line-clamp-2 min-h-[2lh]">{product.name}</p>
      <p className="text-[10px] text-black/70 mt-1.5">
        DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        {onSale && <span className="ml-1.5 line-through text-black/30">DKK {product.compareAtPrice!.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {(product.sizes as readonly string[]).map((s) => {
          const out = soldOut.has(s);
          const selected = selectedSize === s;
          return (
            <button key={s} type="button" disabled={out} onClick={() => setSelectedSize(selected ? null : s)} className={`text-[9px] tracking-[0.05em] uppercase font-medium px-2 py-1 leading-none relative transition-colors duration-150 ${out ? "text-black/25 bg-black/5 cursor-not-allowed" : selected ? "bg-black text-white" : "text-black/70 bg-black/8 hover:bg-black/15"}`}>
              {s}
              {out && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden preserveAspectRatio="none">
                  <line x1="0" y1="100%" x2="100%" y2="0" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {!product.isSoldOut && (
        <button type="button" onClick={handleAddToCart} onPointerDown={(e) => e.stopPropagation()} disabled={!canAddToCart} aria-label={product.sizes.length > 0 && !selectedSize ? "Select a size to add to cart" : "Add to cart"} className="mt-3 w-full flex items-center justify-center gap-2 h-9 bg-black text-white hover:bg-black/80 transition-colors duration-200 disabled:bg-black/30 disabled:cursor-not-allowed">
          <span className="text-[15px] leading-none font-light">+</span>
          <span className="text-[9px] tracking-[0.15em] uppercase font-medium leading-none">{pending ? "Adding…" : product.sizes.length > 0 && !selectedSize ? "Select size" : "Add to cart"}</span>
        </button>
      )}
    </div>
  );
}

export function ProductCardStackedMobile({ product }: { product: Product }) {
  return (
    <div className="md:hidden">
      <StackedMobileContent product={product} />
    </div>
  );
}

export default function ProductCardInfo({ product, hovered, mobileLayout = "overlay" }: ProductCardInfoProps) {
  return (
    <>
      {/* Mobile overlay (opt-out via mobileLayout="stacked") */}
      {mobileLayout === "overlay" && (
        <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden">
          <InfoContent product={product} />
        </div>
      )}

      {/* Desktop: animated on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="hidden md:block absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20">
            <InfoContent product={product} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
