import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_BANNER } from "@/app/lib/queries/banner";

export type BannerImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type Banner = {
  title: string;
  body: string;
  image: BannerImage;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

type FieldNode = {
  key: string;
  value: string | null;
  reference?: {
    __typename: string;
    image?: ShopifyImage | null;
  } | null;
};

type BannerResponse = {
  metaobjects: { edges: { node: { fields: FieldNode[] } }[] };
};

function fieldMap(fields: FieldNode[]): Partial<Record<string, FieldNode>> {
  return Object.fromEntries(fields.map((f) => [f.key, f]));
}

export const getBanner = cache(async (): Promise<Banner | null> => {
  try {
    const { data, errors } = await shopifyClient.request(GET_BANNER);
    if (errors || !data) throw new Error(`Shopify errors: ${JSON.stringify(errors)}`);

    const node = (data as BannerResponse).metaobjects.edges[0]?.node;
    if (!node) return null;

    const f = fieldMap(node.fields);
    const title = f.heading?.value;
    const body = f.body?.value;
    const ref = f.image?.reference;
    const img = ref?.__typename === "MediaImage" ? ref.image : null;
    if (!title || !body || !img) return null;

    return {
      title,
      body,
      image: { url: img.url, alt: img.altText ?? "", width: img.width, height: img.height },
    };
  } catch (err) {
    console.error("[getBanner] Failed to load banner:", err);
    return null;
  }
});
