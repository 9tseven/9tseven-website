import CategoryMarquee from "./components/CategoryMarquee";
import ProductsListing from "./components/ProductsListing";
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
    <main data-nav-theme="light" className="bg-paper min-h-screen pt-16">
      <CategoryMarquee text="ALL PRODUCTS" />

      <ProductsListing products={products} />
    </main>
  );
}
