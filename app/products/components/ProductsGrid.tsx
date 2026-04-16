// app/products/components/ProductsGrid.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "../../components/FeaturedProductsSection/ProductCard";
import type { Product } from "../../components/FeaturedProductsSection/constants";

interface ProductsGridProps {
  products: readonly Product[];
}

const GAP = 8; // px gap between cards

export default function ProductsGrid({ products }: ProductsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const w = container.offsetWidth;
      // md breakpoint = 768px: 3 cols; below: 2 cols
      const cols = w >= 768 ? 3 : 2;
      setCardWidth(Math.floor((w - GAP * (cols - 1)) / cols));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  if (products.length === 0) {
    return (
      <p className="text-center text-black/40 text-xs tracking-[0.2em] uppercase py-20">
        No products found
      </p>
    );
  }

  return (
    <div ref={containerRef} className="w-full px-3 py-3">
      <div
        className="grid grid-cols-2 md:grid-cols-3"
        style={{ gap: GAP }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cardWidth={cardWidth}
            href={`/products/${product.category.toLowerCase()}/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
}
