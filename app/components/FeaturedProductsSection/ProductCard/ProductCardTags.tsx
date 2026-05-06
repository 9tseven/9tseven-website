import type { Product } from "../types";

interface ProductCardTagsProps {
  product: Product;
}

export default function ProductCardTags({ product }: ProductCardTagsProps) {
  const right = product.isSoldOut ? "Sold Out" : product.isNewArrival ? "New Arrival" : null;

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const left = onSale ? "Sale" : null;

  return (
    <>
      {left && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-ink pointer-events-none">
          <span className="flex text-[9px] tracking-eyebrow uppercase font-medium text-fg">{left}</span>
        </div>
      )}
      {right && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-ink pointer-events-none">
          <span className="flex text-[9px] tracking-eyebrow uppercase font-medium text-fg">{right}</span>
        </div>
      )}
    </>
  );
}
