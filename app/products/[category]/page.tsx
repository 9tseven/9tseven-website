// app/products/[category]/page.tsx
import { notFound } from "next/navigation";
import CategoryMarquee from "../components/CategoryMarquee";
import ProductsGrid from "../components/ProductsGrid";
import { PRODUCTS } from "../../components/FeaturedProductsSection/constants";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const filtered = PRODUCTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  // Unknown category (not a known slug and no products) → 404
  const knownCategories = ["apparel", "accessories", "equipment", "new-arrivals"];
  if (!knownCategories.includes(category.toLowerCase()) && filtered.length === 0) {
    notFound();
  }

  const label = category
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");

  return (
    <main data-nav-theme="light" className="bg-white min-h-screen pt-16">
      <CategoryMarquee text={label} />

      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
        <button
          type="button"
          className="text-[9px] tracking-[0.2em] uppercase text-black/50 border border-black/20 px-3 py-1.5"
          disabled
        >
          ⇌&nbsp;&nbsp;Filter
        </button>
        <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">
          {filtered.length} Products
        </span>
      </div>

      <ProductsGrid products={filtered} />
    </main>
  );
}
