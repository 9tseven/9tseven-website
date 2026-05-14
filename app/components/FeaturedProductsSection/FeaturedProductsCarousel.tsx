"use client";

import { motion } from "motion/react";
import ProductCard from "./ProductCard";
import ProductCarouselIndicator from "./ProductCarouselIndicator";
import Tagline from "../Tagline";
import { useProductCarousel } from "./hooks/useProductCarousel";
import { CARD_GAP } from "./constants";
import type { Product } from "./types";

export default function FeaturedProductsSection({ products }: { products: Product[] }) {
  const { current, cardWidth, pageCount, containerRef, x, handleDragEnd, dragConstraintsLeft, prev, next, snapTo } = useProductCarousel(products.length);

  return (
    <section data-nav-theme="light" className="w-full bg-white py-14 select-none">
      <header className="flex items-end justify-between gap-6 px-8 mb-10">
        <div className="flex flex-col gap-1.5">
          <Tagline>FEATURED</Tagline>
          <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-ink leading-none">LATEST ARRIVALS</h2>
        </div>
        <Tagline href="/products" tone="ink" className="text-xs whitespace-nowrap">
          VIEW ALL&nbsp;&nbsp;→
        </Tagline>
      </header>

      <div ref={containerRef} className="w-full overflow-hidden">
        <motion.div className="flex" style={{ x, gap: CARD_GAP, cursor: "grab" }} drag="x" dragConstraints={{ left: dragConstraintsLeft(), right: 0 }} dragElastic={0.06} dragMomentum={false} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardWidth={cardWidth} href={`/products/${product.category.toLowerCase()}/${product.handle}`} />
          ))}
        </motion.div>
      </div>

      <ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} onGoTo={snapTo} />
    </section>
  );
}
