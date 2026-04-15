"use client";

import { motion, AnimatePresence } from "motion/react";
import type { Product } from "../constants";

interface ProductCardInfoProps {
  product: Product;
  hovered: boolean;
}

function InfoContent({ product, plusSize }: { product: Product; plusSize: string }) {
  return (
    <>
      <div className="flex-1 min-w-0">
        <p className="text-[8px] tracking-[0.15em] uppercase text-black/40 mb-0.5">{product.category}</p>
        <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-black leading-tight truncate">{product.name}</p>
        <p className="text-[9px] text-black/60 mt-1">DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
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
      <button type="button" onPointerDown={(e) => e.stopPropagation()} className="shrink-0 w-7 h-7 flex items-center justify-center bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
        <span className={`${plusSize} leading-none font-light`}>+</span>
      </button>
    </>
  );
}

export default function ProductCardInfo({ product, hovered }: ProductCardInfoProps) {
  return (
    <>
      {/* Mobile: always visible */}
      <div className="absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 md:hidden flex items-center gap-2">
        <InfoContent product={product} plusSize="text-[15px]" />
      </div>

      {/* Desktop: animated on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className="hidden md:flex absolute bottom-4 left-3.5 right-3.5 px-3 py-2.5 bg-white/95 border-t border-black/8 z-20 items-center gap-2">
            <InfoContent product={product} plusSize="text-[16px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
