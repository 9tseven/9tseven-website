import { notFound } from "next/navigation";
import CategoryMarquee from "../components/CategoryMarquee";
import ProductsGrid from "../components/ProductsGrid";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_PRODUCTS } from "@/app/lib/queries/products";
import { toProduct, type StorefrontProduct } from "@/app/components/FeaturedProductsSection/types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const KNOWN_CATEGORIES = ["apparel", "accessories", "equipment", "new-arrivals"];

function categorySlugToProductType(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const slug = category.toLowerCase();

  const productType = categorySlugToProductType(slug);

  const { data, errors } = await shopifyClient.request(GET_PRODUCTS, {
    variables: { first: 100, query: `product_type:'${productType}'` },
  });

  if (errors) {
    throw new Error(`Shopify GET_PRODUCTS failed: ${JSON.stringify(errors)}`);
  }

  const edges = (data as { products: { edges: { node: StorefrontProduct }[] } } | undefined)?.products.edges ?? [];
  const products = edges.map((e) => toProduct(e.node));

  if (!KNOWN_CATEGORIES.includes(slug) && products.length === 0) {
    notFound();
  }

  const label = category
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");

  return (
    <main data-nav-theme="light" className="min-h-screen pt-16">
      <CategoryMarquee text={label} />

      <div className="bg-white max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
          <button
            type="button"
            className="text-[9px] tracking-[0.2em] uppercase text-black/50 border border-black/20 px-3 py-1.5"
            disabled
          >
            ⇌&nbsp;&nbsp;Filter
          </button>
          <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">
            {products.length} Products
          </span>
        </div>

        <ProductsGrid products={products} />
      </div>
    </main>
  );
}
