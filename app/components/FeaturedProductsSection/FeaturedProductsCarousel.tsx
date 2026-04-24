"use client";

import Link from "next/link";
import { motion } from "motion/react";
import ProductCard from "./ProductCard";
import ProductCarouselIndicator from "./ProductCarouselIndicator";
import { useProductCarousel } from "./hooks/useProductCarousel";
import { CARD_GAP } from "./constants";
import type { Product } from "./types";

export default function FeaturedProductsSection({ products }: { products: Product[] }) {
  const { current, cardWidth, pageCount, containerRef, x, handleDragEnd, dragConstraintsLeft, prev, next, snapTo } = useProductCarousel(products.length);

  return (
    <section data-nav-theme="light" className="w-full bg-white py-8 select-none">
      <p className="font-mono text-xs tracking-[0.25em] uppercase text-black text-center mb-9">( FEATURED PRODUCTS )</p>

      <div ref={containerRef} className="w-full overflow-hidden">
        <motion.div className="flex" style={{ x, gap: CARD_GAP, cursor: "grab" }} drag="x" dragConstraints={{ left: dragConstraintsLeft(), right: 0 }} dragElastic={0.06} dragMomentum={false} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardWidth={cardWidth} />
          ))}
        </motion.div>
      </div>

      <ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} onGoTo={snapTo} />

      <div className="text-center mt-8">
        <Link href="/products" className="font-mono text-sm tracking-[-0.05em] text-black underline underline-offset-4 transition-opacity hover:opacity-50">
          VIEW ALL PRODUCTS
        </Link>
      </div>
    </section>
  );
}
