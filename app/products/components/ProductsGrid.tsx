// app/products/components/ProductsGrid.tsx
import ProductCard from "../../components/FeaturedProductsSection/ProductCard";
import type { Product } from "../../components/FeaturedProductsSection/types";

interface ProductsGridProps {
  products: readonly Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-center text-black/40 text-xs tracking-[0.2em] uppercase py-20">
        No products found
      </p>
    );
  }

  return (
    <div className="w-full px-3 py-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            href={`/products/${product.category.toLowerCase()}/${product.handle}`}
            mobileLayout="stacked"
          />
        ))}
      </div>
    </div>
  );
}
