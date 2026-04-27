import { shopifyClient } from "@/app/lib/shopify";
import { GET_NAV_PREVIEWS } from "@/app/lib/queries/navPreviews";
import type { NavPreviews, PreviewItem } from "./types";

const PREVIEW_COUNT = 3;

type PreviewNode = {
  handle: string;
  title: string;
  productType: string;
  featuredImage: { url: string; altText: string | null } | null;
};

type PreviewResponse = {
  newArrivals: { edges: { node: PreviewNode }[] };
  allProducts: { edges: { node: PreviewNode }[] };
};

function toPreviewItem(node: PreviewNode): PreviewItem {
  return {
    handle: node.handle,
    title: node.title,
    productType: node.productType,
    image: node.featuredImage
      ? { url: node.featuredImage.url, altText: node.featuredImage.altText }
      : null,
  };
}

export async function getNavPreviews(): Promise<NavPreviews> {
  try {
    const { data, errors } = await shopifyClient.request(GET_NAV_PREVIEWS, {
      variables: { previewCount: PREVIEW_COUNT },
    });
    if (errors || !data) {
      return { newArrivals: [], allProducts: [] };
    }
    const typed = data as PreviewResponse;
    return {
      newArrivals: typed.newArrivals.edges.map((e) => toPreviewItem(e.node)),
      allProducts: typed.allProducts.edges.map((e) => toPreviewItem(e.node)),
    };
  } catch {
    return { newArrivals: [], allProducts: [] };
  }
}
