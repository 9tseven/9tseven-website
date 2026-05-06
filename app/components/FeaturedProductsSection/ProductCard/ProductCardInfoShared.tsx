"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Product } from "../types";
import { useCart } from "@/app/context/CartContext";

function resolveVariant(product: Product, selectedSize: string | null) {
  if (product.sizes.length > 0) {
    return product.variants.find((v) => v.size === selectedSize) ?? null;
  }
  return product.variants[0] ?? null;
}

function formatPrice(value: number) {
  return value.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const stopPointerEvents = {
  onClick: (e: React.SyntheticEvent) => e.stopPropagation(),
  onPointerDown: (e: React.SyntheticEvent) => e.stopPropagation(),
} as const;

export const stopMouseMove = {
  onMouseMove: (e: React.SyntheticEvent) => e.stopPropagation(),
} as const;

export function getAddToCartAriaLabel(needsSizeSelection: boolean) {
  return needsSizeSelection ? "Select a size to add to cart" : "Add to cart";
}

export function useProductCardPurchase(product: Product) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addLine, openCart, pending } = useCart();
  const soldOut = useMemo(() => new Set(product.soldOutSizes as readonly string[]), [product.soldOutSizes]);

  const selectedVariant = resolveVariant(product, selectedSize);
  const canAddToCart = selectedVariant !== null && selectedVariant.availableForSale && !pending;
  const needsSizeSelection = product.sizes.length > 0 && selectedSize === null;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addLine(selectedVariant.id, 1);
    openCart();
  };

  const toggleSize = (size: string) => {
    setSelectedSize((currentSize) => (currentSize === size ? null : size));
  };

  return {
    canAddToCart,
    handleAddToCart,
    needsSizeSelection,
    pending,
    selectedSize,
    soldOut,
    toggleSize,
  };
}

export function PriceDisplay({ product, className, compareAtClassName }: { product: Product; className: string; compareAtClassName: string }) {
  const { compareAtPrice, price } = product;
  const onSale = compareAtPrice !== null && compareAtPrice > price;

  return (
    <p className={className}>
      DKK {formatPrice(price)}
      {onSale && <span className={compareAtClassName}>DKK {formatPrice(compareAtPrice)}</span>}
    </p>
  );
}

function SizeOptionButton({ size, out, onToggle, className }: { size: string; out: boolean; onToggle: () => void; className: string }) {
  return (
    <button type="button" disabled={out} onClick={onToggle} className={className}>
      {size}
      {out && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden preserveAspectRatio="none">
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--color-ink-faint)" strokeWidth="1" />
        </svg>
      )}
    </button>
  );
}

export function SizeSelector({ sizes, soldOut, selectedSize, onToggle, containerClassName, style, getButtonClassName }: { sizes: readonly string[]; soldOut: ReadonlySet<string>; selectedSize: string | null; onToggle: (size: string) => void; containerClassName: string; style?: CSSProperties; getButtonClassName: (options: { out: boolean; selected: boolean }) => string }) {
  return (
    <div className={containerClassName} style={style}>
      {sizes.map((size) => {
        const out = soldOut.has(size);
        const selected = selectedSize === size;

        return <SizeOptionButton key={size} size={size} out={out} onToggle={() => onToggle(size)} className={getButtonClassName({ out, selected })} />;
      })}
    </div>
  );
}
