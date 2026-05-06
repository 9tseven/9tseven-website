"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "../types";
import { useCart } from "@/app/context/CartContext";

interface ProductCardInfoProps {
  product: Product;
  hovered: boolean;
  mobileLayout?: "overlay" | "stacked";
  alwaysVisible?: boolean;
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
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <p className="text-[clamp(8px,0.6vw,10px)] tracking-eyebrow uppercase text-ink-subtle leading-none">{product.category}</p>
          <p className="text-[clamp(10px,0.8vw,12px)] font-semibold tracking-eyebrow uppercase text-ink line-clamp-2 leading-tight min-h-[2lh] md:line-clamp-none md:truncate md:leading-none md:min-h-0">{product.name}</p>
        </div>
        {!product.isSoldOut && (
          <button type="button" onClick={handleAddToCart} onPointerDown={(e) => e.stopPropagation()} disabled={!canAddToCart} aria-label={product.sizes.length > 0 && !selectedSize ? "Select a size to add to cart" : "Add to cart"} className="shrink-0 flex items-center justify-center gap-1 px-3 h-7 bg-ink text-fg hover:bg-bg/80 transition-colors duration-base cursor-pointer disabled:bg-bg/30 disabled:cursor-default">
            <span className="text-[clamp(14px,1vw,16px)] leading-none font-light -translate-y-px">+</span>
            <span className="text-[clamp(8px,0.65vw,10px)] tracking-label uppercase font-medium leading-none">{pending ? "Adding…" : "Add to cart"}</span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[clamp(9px,0.7vw,11px)] tracking-label font-semibold text-pretty text-ink-muted shrink-0">
          DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {onSale && <span className="block font-normal line-through text-ink-faint md:inline md:ml-1.5">DKK {product.compareAtPrice!.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
        </p>
        <div className="flex flex-nowrap justify-end gap-1 md:flex-wrap">
          {(product.sizes as readonly string[]).map((s) => {
            const out = soldOut.has(s);
            const selected = selectedSize === s;
            return (
              <button key={s} type="button" disabled={out} onClick={() => setSelectedSize(selected ? null : s)} className={`text-[clamp(10px,0.8vw,12px)] tracking-label uppercase font-medium px-2 py-1.5 md:px-2.5 md:py-2 leading-none relative transition-colors duration-fast cursor-pointer ${out ? "text-ink-ghost bg-tint" : selected ? "bg-ink text-fg" : "text-ink-muted bg-tint hover:bg-tint-hover cursor-pointer"}`}>
                {s}
                {out && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden preserveAspectRatio="none">
                    <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--color-ink-faint)" strokeWidth="1" />
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
    <div className="flex flex-col px-0.5 pt-3 pb-1" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <p className="text-[clamp(8px,2vw,9px)] tracking-eyebrow uppercase text-ink-subtle">{product.category}</p>
      <p className="text-[clamp(11px,2.6vw,12px)] font-extralight tracking-label uppercase text-ink leading-tight mt-1 line-clamp-2 min-h-[2lh]">{product.name}</p>
      <p className="text-[clamp(11px,2.8vw,13px)] font-medium text-ink-muted mt-1.5">
        DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        {onSale && <span className="ml-1.5 font-normal line-through text-ink-faint">DKK {product.compareAtPrice!.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
      </p>
      <div className="grid gap-0.5 my-2" style={{ gridTemplateColumns: `repeat(${Math.min(product.sizes.length, 5)}, minmax(0, 1fr))` }}>
        {(product.sizes as readonly string[]).map((s) => {
          const out = soldOut.has(s);
          const selected = selectedSize === s;
          return (
            <button key={s} type="button" disabled={out} onClick={() => setSelectedSize(selected ? null : s)} className={`text-[9px] tracking-label uppercase font-mono font-bold py-1.5 leading-none relative transition-colors duration-fast ${out ? "text-ink-ghost bg-tint" : selected ? "bg-ink text-fg" : "text-ink-muted bg-tint hover:bg-tint-hover"}`}>
              {s}
              {out && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden preserveAspectRatio="none">
                  <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--color-ink-faint)" strokeWidth="1" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {product.isSoldOut ? (
        <div aria-hidden className="mt-auto w-full h-9" />
      ) : (
        <button type="button" onClick={handleAddToCart} onPointerDown={(e) => e.stopPropagation()} disabled={!canAddToCart} aria-label={product.sizes.length > 0 && !selectedSize ? "Select a size to add to cart" : "Add to cart"} className="mt-auto w-full flex items-center justify-center gap-2 h-9 bg-ink text-fg hover:bg-bg/80 transition-colors duration-base disabled:bg-bg/75 disabled:text-fg-muted">
          <span className="text-[15px] leading-none font-light">+</span>
          <span className="text-[9px] tracking-eyebrow uppercase font-medium leading-none">{pending ? "Adding…" : product.sizes.length > 0 && !selectedSize ? "Select size" : "Add to cart"}</span>
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

export default function ProductCardInfo({ product, hovered, mobileLayout = "overlay", alwaysVisible = false }: ProductCardInfoProps) {
  if (alwaysVisible) {
    return (
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-3 bg-white/95 border-t border-ink/10 z-20" onMouseMove={(e) => e.stopPropagation()}>
        <InfoContent product={product} />
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileLayout === "overlay" && (
        <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-3 bg-white/95 border-t border-ink/10 z-20 md:hidden" onMouseMove={(e) => e.stopPropagation()}>
          <InfoContent product={product} />
        </div>
      )}

      {/* Desktop: animated on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="hidden md:block absolute bottom-4 left-3.5 right-3.5 px-3 py-3 bg-white/95 border-t border-ink/10 z-20" onMouseMove={(e) => e.stopPropagation()}>
            <InfoContent product={product} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
