// app/products/page.tsx
import CategoryMarquee from "./components/CategoryMarquee";
import ProductsGrid from "./components/ProductsGrid";
import { PRODUCTS } from "../components/FeaturedProductsSection/constants";

export default function ProductsPage() {
  return (
    <main data-nav-theme="light" className="bg-white min-h-screen pt-16">
      <CategoryMarquee text="ALL PRODUCTS" />

      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
        <button
          type="button"
          className="text-[9px] tracking-[0.2em] uppercase text-black/50 border border-black/20 px-3 py-1.5"
          disabled
        >
          ⇌&nbsp;&nbsp;Filter
        </button>
        <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">
          {PRODUCTS.length} Products
        </span>
      </div>

      <ProductsGrid products={PRODUCTS} />
    </main>
  );
}
