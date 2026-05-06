"use client";

import { motion, AnimatePresence } from "motion/react";
import type { Product } from "../types";
import {
  PriceDisplay,
  SizeSelector,
  getAddToCartAriaLabel,
  stopMouseMove,
  stopPointerEvents,
  useProductCardPurchase,
} from "./ProductCardInfoShared";

type ProductCardInfoProps =
  | { product: Product; alwaysVisible: true; hovered?: never; mobileLayout?: never }
  | { product: Product; alwaysVisible?: false; hovered: boolean; mobileLayout?: "overlay" | "stacked" };

const overlayPanelClassName = "absolute bottom-4 left-3.5 right-3.5 px-3 py-3 bg-white/95 border-t border-ink/10 z-20";

function InfoContent({ product }: { product: Product }) {
  const { selectedSize, soldOut, canAddToCart, pending, needsSizeSelection, toggleSize, handleAddToCart } = useProductCardPurchase(product);

  return (
    <div className="flex flex-col gap-2" {...stopPointerEvents}>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <p className="text-[clamp(8px,0.6vw,10px)] tracking-eyebrow uppercase text-ink-subtle leading-none">{product.category}</p>
          <p className="text-[clamp(10px,0.8vw,12px)] font-semibold tracking-widest uppercase text-ink line-clamp-2 leading-tight min-h-[2lh] md:line-clamp-none md:truncate md:leading-none md:min-h-0">{product.name}</p>
        </div>
        {!product.isSoldOut && (
          <button type="button" onClick={handleAddToCart} disabled={!canAddToCart} aria-label={getAddToCartAriaLabel(needsSizeSelection)} className="shrink-0 flex items-center justify-center gap-1 px-3 h-7 bg-ink text-fg hover:bg-bg/80 transition-colors duration-base cursor-pointer disabled:bg-bg/30 disabled:cursor-default">
            <span className="text-[clamp(14px,1vw,16px)] leading-none font-light -translate-y-px">+</span>
            <span className="text-[clamp(8px,0.65vw,10px)] tracking-label uppercase font-medium leading-none">{pending ? "Adding…" : "Add to cart"}</span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <PriceDisplay product={product} className="text-[clamp(9px,0.7vw,11px)] tracking-label font-semibold text-pretty text-ink-muted shrink-0" compareAtClassName="block font-normal line-through text-ink-faint md:inline md:ml-1.5" />
        <SizeSelector sizes={product.sizes} soldOut={soldOut} selectedSize={selectedSize} onToggle={toggleSize} containerClassName="flex flex-nowrap justify-end gap-1 md:flex-wrap" getButtonClassName={({ out, selected }) => `text-[clamp(10px,0.8vw,12px)] tracking-label uppercase font-medium px-2 py-1.5 md:px-2.5 md:py-2 leading-none relative transition-colors duration-fast cursor-pointer ${out ? "text-ink-ghost bg-tint" : selected ? "bg-ink text-fg" : "text-ink-muted bg-tint hover:bg-tint-hover cursor-pointer"}`} />
      </div>
    </div>
  );
}

function StaticPanel({ product }: { product: Product }) {
  return (
    <div className={overlayPanelClassName} {...stopMouseMove}>
      <InfoContent product={product} />
    </div>
  );
}

function HoverPanel({ product, hovered, mobileLayout }: { product: Product; hovered: boolean; mobileLayout: "overlay" | "stacked" }) {
  return (
    <>
      {mobileLayout === "overlay" && (
        <div className={`${overlayPanelClassName} md:hidden`} {...stopMouseMove}>
          <InfoContent product={product} />
        </div>
      )}
      <AnimatePresence>
        {hovered && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: "easeOut" }} className={`${overlayPanelClassName} hidden md:block`} {...stopMouseMove}>
            <InfoContent product={product} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ProductCardInfo(props: ProductCardInfoProps) {
  if (props.alwaysVisible) {
    return <StaticPanel product={props.product} />;
  }
  return <HoverPanel product={props.product} hovered={props.hovered} mobileLayout={props.mobileLayout ?? "overlay"} />;
}
