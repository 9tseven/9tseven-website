import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_BANNER } from "@/app/lib/queries/banner";

export type Banner = {
  text: string;
  closeButton: boolean;
};

type FieldNode = { key: string; value: string | null };
type BannerResponse = {
  metaobjects: { edges: { node: { id: string; fields: FieldNode[] } }[] };
};

function parseBoolean(value: string | null | undefined): boolean {
  return value === "true";
}

export const getBanner = cache(async (): Promise<Banner | null> => {
  try {
    const { data, errors } = await shopifyClient.request(GET_BANNER);
    if (errors || !data) throw new Error(`Shopify errors: ${JSON.stringify(errors)}`);

    const node = (data as BannerResponse).metaobjects.edges[0]?.node;
    if (!node) return null;

    const fields = Object.fromEntries(node.fields.map((f) => [f.key, f.value]));
    const text = fields.banner_text;
    if (!text) return null;

    return { text, closeButton: parseBoolean(fields.close_button) };
  } catch (err) {
    console.error("[getBanner] Failed to load banner:", err);
    return null;
  }
});
