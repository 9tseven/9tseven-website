// app/products/[category]/[id]/page.tsx
import { notFound } from "next/navigation";
import { PRODUCTS } from "../../../components/FeaturedProductsSection/constants";
import ProductDetailView from "../../components/ProductDetailView";

interface ProductDetailPageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const product = PRODUCTS.find((p) => String(p.id) === id);

  if (!product) {
    notFound();
  }

  return (
    <main data-nav-theme="light" className="bg-white min-h-screen pt-16">
      <ProductDetailView product={product} />
    </main>
  );
}
