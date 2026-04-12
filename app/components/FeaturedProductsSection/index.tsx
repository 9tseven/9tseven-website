"use client";

import { motion } from "motion/react";
import ProductCard from "./ProductCard";
import ProductCarouselIndicator from "./ProductCarouselIndicator";
import { useProductCarousel } from "./hooks/useProductCarousel";
import { PRODUCTS, CARD_GAP } from "./constants";

export default function FeaturedProductsSection() {
  const { current, cardWidth, visibleCards, pageCount, containerRef, x, handleDragEnd, prev, next } = useProductCarousel();

  return (
    <section data-nav-theme="light" className="w-full bg-white pt-4 pb-12 select-none">
      {/* Section label */}
      <p className="text-[9px] tracking-[0.25em] uppercase text-black/40 text-center mb-9">( FEATURED PRODUCTS )</p>

      {/* Carousel viewport — overflow clips the track */}
      <div ref={containerRef} className="w-full overflow-hidden">
        <motion.div
          className="flex"
          style={{
            x,
            gap: CARD_GAP,
            willChange: "transform",
            cursor: "grab",
          }}
          drag="x"
          dragConstraints={{
            left: -(pageCount - 1) * visibleCards * (cardWidth + CARD_GAP),
            right: 0,
          }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: "grabbing" }}
        >
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} cardWidth={cardWidth} />
          ))}
        </motion.div>
      </div>

      {/* Progress indicator */}
      <ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} />

      {/* Footer link */}
      <div className="text-center mt-8">
        <button className="text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors duration-200 border-b border-black/20 pb-px">VIEW ALL PRODUCTS</button>
      </div>
    </section>
  );
}
