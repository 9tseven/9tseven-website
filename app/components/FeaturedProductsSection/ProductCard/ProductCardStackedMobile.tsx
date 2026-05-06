"use client";

import type { Product } from "../types";
import {
  PriceDisplay,
  SizeSelector,
  getAddToCartAriaLabel,
  stopPointerEvents,
  useProductCardPurchase,
} from "./ProductCardInfoShared";

export default function ProductCardStackedMobile({ product }: { product: Product }) {
  const { selectedSize, soldOut, canAddToCart, pending, needsSizeSelection, toggleSize, handleAddToCart } = useProductCardPurchase(product);
  const sizeColumns = Math.max(1, Math.min(product.sizes.length, 5));

  return (
    <div className="md:hidden">
      <div className="flex flex-col px-0.5 pt-3 pb-1" {...stopPointerEvents}>
        <p className="text-[clamp(8px,2vw,9px)] tracking-eyebrow uppercase text-ink-subtle">{product.category}</p>
        <p className="text-[clamp(11px,2.6vw,12px)] font-extralight tracking-widest uppercase text-ink leading-tight mt-1 line-clamp-2 min-h-[2lh]">{product.name}</p>
        <PriceDisplay product={product} className="text-[clamp(11px,2.8vw,13px)] font-medium text-ink-muted mt-1.5" compareAtClassName="ml-1.5 font-normal line-through text-ink-faint" />
        {product.sizes.length > 0 && (
          <SizeSelector sizes={product.sizes} soldOut={soldOut} selectedSize={selectedSize} onToggle={toggleSize} containerClassName="grid gap-0.5 my-2" style={{ gridTemplateColumns: `repeat(${sizeColumns}, minmax(0, 1fr))` }} getButtonClassName={({ out, selected }) => `text-[9px] tracking-label uppercase font-mono font-bold py-1.5 leading-none relative transition-colors duration-fast ${out ? "text-ink-ghost bg-tint" : selected ? "bg-ink text-fg" : "text-ink-muted bg-tint hover:bg-tint-hover"}`} />
        )}
        {product.isSoldOut ? (
          <div aria-hidden className="w-full h-9" />
        ) : (
          <button type="button" onClick={handleAddToCart} disabled={!canAddToCart} aria-label={getAddToCartAriaLabel(needsSizeSelection)} className="w-full flex items-center justify-center gap-2 h-9 bg-ink text-fg hover:bg-bg/80 transition-colors duration-base disabled:bg-bg/75 disabled:text-fg-muted">
            <span className="text-[15px] leading-none font-light">+</span>
            <span className="text-[9px] tracking-eyebrow uppercase font-medium leading-none">{pending ? "Adding…" : needsSizeSelection ? "Select size" : "Add to cart"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
