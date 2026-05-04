import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_BLOG_POSTS } from "@/app/lib/queries/blogPosts";
import type { BlogPost } from "@/app/components/BlogSection/constants";

type ImageReference = {
  __typename: "MediaImage";
  image: { url: string; altText: string | null } | null;
};
type FieldNode = {
  key: string;
  value: string | null;
  reference: ImageReference | null;
};
type BlogPostsResponse = {
  metaobjects: { edges: { node: { id: string; fields: FieldNode[] } }[] };
};

function fieldMap(fields: FieldNode[]): Partial<Record<string, FieldNode>> {
  return Object.fromEntries(fields.map((f) => [f.key, f]));
}

function parseLink(value: string | null | undefined): { text: string; url: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed?.url === "string" && typeof parsed?.text === "string") {
      return { text: parsed.text, url: parsed.url };
    }
  } catch {
    // value isn't JSON — ignore
  }
  return null;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  // Shopify date fields return YYYY-MM-DD; date_time returns ISO 8601.
  const ymd = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!ymd) return null;
  return `${ymd[3]}.${ymd[2]}.${ymd[1]}`;
}

function buildPost(id: string, fields: FieldNode[]): BlogPost | null {
  const f = fieldMap(fields);

  const heading = f.heading?.value;
  const body = f.body?.value;
  const tag = f.tag?.value;

  const imageRef = f.image?.reference;
  const image = imageRef?.__typename === "MediaImage" ? imageRef.image : null;

  if (!heading || !body || !tag || !image?.url) return null;

  return {
    id,
    tag: `( ${tag.toUpperCase()} )`,
    title: heading,
    body,
    image: image.url,
    alt: image.altText ?? heading,
    link: parseLink(f.link?.value),
    date: formatDate(f.date?.value),
  };
}

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const { data, errors } = await shopifyClient.request(GET_BLOG_POSTS);
  if (errors || !data) {
    throw new Error(`Shopify GET_BLOG_POSTS failed: ${JSON.stringify(errors)}`);
  }

  return (data as BlogPostsResponse).metaobjects.edges
    .map(({ node }) => buildPost(node.id, node.fields))
    .filter((p): p is BlogPost => p !== null);
});
