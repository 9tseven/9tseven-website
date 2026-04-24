export type Product = {
  id: string;
  handle: string;
  name: string;
  category: string;
  price: number;
  sizes: string[];
  soldOutSizes: string[];
  images: string[];
  descriptionHtml?: string;
};

type StorefrontImage = { url: string; altText: string | null };
type StorefrontVariant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
};

export type StorefrontProduct = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml?: string;
  productType: string;
  tags: string[];
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  options: { name: string; values: string[] }[];
  featuredImage: StorefrontImage | null;
  images: { edges: { node: StorefrontImage }[] };
  variants: { edges: { node: StorefrontVariant }[] };
};

export function toProduct(node: StorefrontProduct): Product {
  const sizeOption = node.options.find((o) => o.name.toLowerCase() === "size");
  const sizes = sizeOption?.values ?? [];

  const soldOutSizes = node.variants.edges
    .map((e) => e.node)
    .filter((v) => !v.availableForSale)
    .flatMap((v) => v.selectedOptions.filter((o) => o.name.toLowerCase() === "size").map((o) => o.value));

  const imageUrls = node.images.edges.map((e) => e.node.url);
  const images = imageUrls.length > 0 ? imageUrls : node.featuredImage ? [node.featuredImage.url] : [];

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    category: node.productType || node.tags[0] || "",
    price: Number(node.priceRange.minVariantPrice.amount),
    sizes,
    soldOutSizes,
    images,
    descriptionHtml: node.descriptionHtml,
  };
}
