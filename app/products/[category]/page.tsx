import { notFound } from "next/navigation";
import CategoryMarquee from "../components/CategoryMarquee";
import ProductsListing from "../components/ProductsListing";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_PRODUCTS } from "@/app/lib/queries/products";
import { toProduct, type StorefrontProduct } from "@/app/components/FeaturedProductsSection/types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ tag?: string }>;
}

const KNOWN_CATEGORIES = ["apparel", "accessories", "equipment", "new-arrivals"];

function categorySlugToProductType(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildShopifyQuery(slug: string, tag: string | undefined): string | undefined {
  const baseFilter = slug === "new-arrivals" ? `tag:'new-arrival'` : `product_type:'${categorySlugToProductType(slug)}'`;
  if (!tag) return baseFilter;
  return `${baseFilter} AND tag:'${tag}'`;
}

function sanitizeTag(tag: string | undefined): string | undefined {
  if (!tag) return undefined;
  return /^[a-z0-9-]+$/.test(tag) ? tag : undefined;
}

function marqueeLabel(slug: string, tag: string | undefined): string {
  if (tag) return tag.toUpperCase().replace(/-/g, " ");
  return slug
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const { tag: rawTag } = await searchParams;
  const tag = sanitizeTag(rawTag);
  const slug = category.toLowerCase();

  const query = buildShopifyQuery(slug, tag);

  const { data, errors } = await shopifyClient.request(GET_PRODUCTS, {
    variables: { first: 100, query },
  });

  if (errors) {
    throw new Error(`Shopify GET_PRODUCTS failed: ${JSON.stringify(errors)}`);
  }

  const edges = (data as { products: { edges: { node: StorefrontProduct }[] } } | undefined)?.products.edges ?? [];
  const products = edges.map((e) => toProduct(e.node));

  if (!KNOWN_CATEGORIES.includes(slug) && products.length === 0) {
    notFound();
  }

  const label = marqueeLabel(slug, tag);

  return (
    <main data-nav-theme="light" className="bg-white min-h-screen pt-16">
      <CategoryMarquee text={label} />

      <div className="mx-auto">
        <ProductsListing products={products} />
      </div>
    </main>
  );
}
