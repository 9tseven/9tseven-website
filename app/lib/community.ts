import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_COMMUNITY_IMAGES } from "@/app/lib/queries/community";

export type CommunityImage = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
};

type ImageReference = {
  __typename: "MediaImage";
  image: { url: string; altText: string | null; width: number; height: number } | null;
};
type FieldNode = {
  key: string;
  reference: ImageReference | null;
};
type CommunityResponse = {
  metaobjects: { edges: { node: { id: string; fields: FieldNode[] } }[] };
};

function buildImage(id: string, fields: FieldNode[]): CommunityImage | null {
  const imageField = fields.find((f) => f.key === "image");
  const ref = imageField?.reference;
  if (ref?.__typename !== "MediaImage" || !ref.image) return null;

  const { url, altText, width, height } = ref.image;
  return { id, url, alt: altText ?? "", width, height };
}

export const getCommunityImages = cache(async (): Promise<CommunityImage[]> => {
  try {
    const { data, errors } = await shopifyClient.request(GET_COMMUNITY_IMAGES);
    if (errors || !data) throw new Error(`Shopify errors: ${JSON.stringify(errors)}`);

    return (data as CommunityResponse).metaobjects.edges
      .map(({ node }) => buildImage(node.id, node.fields))
      .filter((img): img is CommunityImage => img !== null);
  } catch (err) {
    console.error("[getCommunityImages] Failed to fetch community images:", err);
    return [];
  }
});
