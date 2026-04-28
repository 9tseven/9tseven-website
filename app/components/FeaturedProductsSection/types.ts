export type ProductVariant = {
  id: string;
  size: string | null;
  availableForSale: boolean;
};

export type Product = {
  id: string;
  handle: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  isSoldOut: boolean;
  isNewArrival: boolean;
  sizes: string[];
  soldOutSizes: string[];
  images: string[];
  variants: ProductVariant[];
  descriptionHtml?: string;
};

type StorefrontImage = { url: string; altText: string | null };
type StorefrontVariant = {
  id: string;
  availableForSale: boolean;
  price: { amount: string };
  compareAtPrice: { amount: string } | null;
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

const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];

function sortSizes(values: readonly string[]): string[] {
  return [...values].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toLowerCase());
    const bi = SIZE_ORDER.indexOf(b.toLowerCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b, undefined, { numeric: true });
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function toProduct(node: StorefrontProduct): Product {
  const sizeOption = node.options.find((o) => o.name.toLowerCase() === "size");
  const sizes = sortSizes(sizeOption?.values ?? []);

  const variants = node.variants.edges.map((e) => e.node);

  const soldOutSizes = variants
    .filter((v) => !v.availableForSale)
    .flatMap((v) => v.selectedOptions.filter((o) => o.name.toLowerCase() === "size").map((o) => o.value));

  const imageUrls = node.images.edges.map((e) => e.node.url);
  const images = imageUrls.length > 0 ? imageUrls : node.featuredImage ? [node.featuredImage.url] : [];

  const isSoldOut = variants.length > 0 && variants.every((v) => !v.availableForSale);

  const compareAtPrices = variants
    .map((v) => (v.compareAtPrice ? Number(v.compareAtPrice.amount) : null))
    .filter((n): n is number => n !== null && n > 0);
  const compareAtPrice = compareAtPrices.length > 0 ? Math.max(...compareAtPrices) : null;

  const isNewArrival = node.tags.some((t) => t.toLowerCase() === "new-arrival");

  const productVariants: ProductVariant[] = variants.map((v) => {
    const sizeOpt = v.selectedOptions.find((o) => o.name.toLowerCase() === "size");
    return {
      id: v.id,
      size: sizeOpt ? sizeOpt.value : null,
      availableForSale: v.availableForSale,
    };
  });

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    category: node.productType || node.tags[0] || "",
    price: Number(node.priceRange.minVariantPrice.amount),
    compareAtPrice,
    isSoldOut,
    isNewArrival,
    sizes,
    soldOutSizes,
    images,
    variants: productVariants,
    descriptionHtml: node.descriptionHtml,
  };
}
