"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "../constants";

interface ProductCardInfoProps {
  product: Product;
  hovered: boolean;
}

function InfoContent({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const soldOut = new Set(product.soldOutSizes as readonly string[]);

  return (
    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight truncate">{product.name}</p>
        </div>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} className="shrink-0 flex items-center justify-center gap-1.5 px-3 h-7 bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
          <span className="text-[15px] leading-none font-light">+</span>
          <span className="text-[8px] tracking-[0.12em] uppercase font-medium leading-none">Add to cart</span>
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] text-black/60 shrink-0">DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className="flex gap-1">
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

export default function ProductCardInfo({ product, hovered }: ProductCardInfoProps) {
  return (
    <>
      {/* Mobile: always visible */}
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden">
        <InfoContent product={product} />
      </div>

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
