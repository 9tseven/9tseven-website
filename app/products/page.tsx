import CategoryMarquee from "./components/CategoryMarquee";
import ProductsGrid from "./components/ProductsGrid";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_PRODUCTS } from "@/app/lib/queries/products";
import { toProduct, type StorefrontProduct } from "@/app/components/FeaturedProductsSection/types";

export default async function ProductsPage() {
  const { data, errors } = await shopifyClient.request(GET_PRODUCTS, {
    variables: { first: 100 },
  });

  if (errors) {
    throw new Error(`Shopify GET_PRODUCTS failed: ${JSON.stringify(errors)}`);
  }

  const edges = (data as { products: { edges: { node: StorefrontProduct }[] } } | undefined)?.products.edges ?? [];
  const products = edges.map((e) => toProduct(e.node));

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
          {products.length} Products
        </span>
      </div>

      <ProductsGrid products={products} />
    </main>
  );
}
