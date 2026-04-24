import { shopifyClient } from "@/app/lib/shopify";
import { GET_PRODUCTS } from "@/app/lib/queries/products";
import FeaturedProductsCarousel from "./FeaturedProductsCarousel";
import { toProduct, type StorefrontProduct } from "./types";

export default async function FeaturedProductsSection() {
  const { data, errors } = await shopifyClient.request(GET_PRODUCTS, { variables: { first: 8 } });

  if (errors || !data) {
    throw new Error(`Shopify GET_PRODUCTS failed: ${JSON.stringify(errors)}`);
  }

  const products = data.products.edges.map((e: { node: StorefrontProduct }) => toProduct(e.node));
  return <FeaturedProductsCarousel products={products} />;
}
