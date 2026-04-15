"use client";

import ProductCard from "./ProductCard";
import ProductCarouselIndicator from "./ProductCarouselIndicator";
import { useProductCarousel } from "./hooks/useProductCarousel";
import { PRODUCTS, CARD_GAP } from "./constants";

export default function FeaturedProductsSection() {
  const { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next, snapTo } = useProductCarousel();

  return (
    <section data-nav-theme="light" className="w-full bg-white py-8 select-none">
      {/* Section label */}
      <p className="text-[9px] tracking-[0.25em] uppercase text-black/40 text-center mb-9">( FEATURED PRODUCTS )</p>

      {/* Padding wrapper — shrinks the card area away from viewport edges */}
      <div className="w-full">
        {/* Native scroll container */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={
            {
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
            } as React.CSSProperties
          }
          onScroll={handleScroll}
        >
          <div className="flex" style={{ gap: CARD_GAP }}>
            {PRODUCTS.map((product, i) => (
              <div key={product.id} style={{ scrollSnapAlign: i % visibleCards === 0 ? "start" : "none", flexShrink: 0 }}>
                <ProductCard product={product} cardWidth={cardWidth} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <ProductCarouselIndicator current={current} pageCount={pageCount} onPrev={prev} onNext={next} onGoTo={snapTo} />

      {/* Footer link */}
      <div className="text-center mt-8">
        <button className="text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors duration-200 border-b border-black/20 pb-px">VIEW ALL PRODUCTS</button>
      </div>
    </section>
  );
}
