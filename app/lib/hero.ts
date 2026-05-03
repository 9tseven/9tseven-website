import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_HERO_SLIDES } from "@/app/lib/queries/hero";
import { SLIDES } from "@/app/components/HeroSection/constants";
import type { HeroSlide } from "@/app/components/HeroSection/types";

type ImageReference = {
  __typename: "MediaImage";
  image: { url: string } | null;
};
type VideoSource = { url: string; mimeType: string };
type VideoReference = {
  __typename: "Video";
  sources: VideoSource[];
};
type FieldNode = {
  key: string;
  value: string | null;
  reference: ImageReference | VideoReference | null;
};
type HeroResponse = {
  metaobjects: { edges: { node: { id: string; fields: FieldNode[] } }[] };
};

function pickPlayableVideoUrl(sources: VideoSource[]): string | undefined {
  return sources.find((s) => s.mimeType === "video/mp4")?.url ?? sources[0]?.url;
}

function toStorefrontPath(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.host !== process.env.SHOPIFY_STORE_DOMAIN) return url;
    return parsed.pathname;
  } catch {
    return url;
  }
}

function fieldMap(fields: FieldNode[]): Partial<Record<string, FieldNode>> {
  return Object.fromEntries(fields.map((f) => [f.key, f]));
}

function buildSlide(fields: FieldNode[], id: number): HeroSlide | null {
  const f = fieldMap(fields);

  const heading = f.heading?.value;
  const subheading = f.subheading?.value;
  const linkUrlRaw = f.link_url?.value;
  const bg = f.bg?.value;

  const imageRef = f.hero_image?.reference;
  const image = imageRef?.__typename === "MediaImage" ? imageRef.image?.url : undefined;

  const videoRef = f.video?.reference;
  const video = videoRef?.__typename === "Video" ? pickPlayableVideoUrl(videoRef.sources) : undefined;

  if (!heading || !subheading || !linkUrlRaw || !bg || !image) return null;

  return { id, bg, image, video, heading, subheading, href: toStorefrontPath(linkUrlRaw) };
}

export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  try {
    const { data, errors } = await shopifyClient.request(GET_HERO_SLIDES);
    if (errors || !data) throw new Error(`Shopify errors: ${JSON.stringify(errors)}`);

    const slides = (data as HeroResponse).metaobjects.edges
      .map(({ node }, i) => buildSlide(node.fields, i))
      .filter((s): s is HeroSlide => s !== null);

    if (slides.length === 0) throw new Error("No valid hero slides returned from Shopify");
    return slides;
  } catch (err) {
    console.error("[getHeroSlides] Falling back to local SLIDES:", err);
    return SLIDES;
  }
});
