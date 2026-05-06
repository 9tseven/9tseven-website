import { notFound } from "next/navigation";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_PRODUCT_BY_HANDLE } from "@/app/lib/queries/products";
import { toProduct, type StorefrontProduct } from "@/app/components/FeaturedProductsSection/types";
import ProductDetailView from "../../components/ProductDetailView";

interface ProductDetailPageProps {
  params: Promise<{ category: string; handle: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { category, handle } = await params;

  const { data, errors } = await shopifyClient.request(GET_PRODUCT_BY_HANDLE, {
    variables: { handle },
  });

  if (errors) {
    throw new Error(`Shopify GET_PRODUCT_BY_HANDLE failed: ${JSON.stringify(errors)}`);
  }

  const node = (data as { product: StorefrontProduct | null } | undefined)?.product;
  if (!node) notFound();

  const product = toProduct(node);

  if (product.category.toLowerCase() !== category.toLowerCase()) {
    notFound();
  }

  return (
    <main data-nav-theme="light" className="bg-white min-h-screen pt-16">
      <div className="px-4 mx-auto">
        <ProductDetailView product={product} />
      </div>
    </main>
  );
}
