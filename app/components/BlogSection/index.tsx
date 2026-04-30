import { shopifyClient } from "@/app/lib/shopify";
import { GET_ARTICLES } from "@/app/lib/queries/articles";
import BlogStack from "./BlogStack";
import type { BlogPost } from "./constants";

type ShopifyArticle = {
  id: string;
  title: string;
  excerptHtml: string | null;
  image: { url: string; altText: string | null } | null;
  blog: { handle: string };
};

type ArticlesResponse = {
  articles: {
    edges: { node: ShopifyArticle }[];
  };
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m.toLowerCase()] ?? m)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default async function BlogSection() {
  const { data, errors } = await shopifyClient.request<ArticlesResponse>(GET_ARTICLES, {
    variables: { first: 5 },
  });

  if (errors || !data) {
    throw new Error(`Shopify GET_ARTICLES failed: ${JSON.stringify(errors)}`);
  }

  const posts: BlogPost[] = data.articles.edges
    .map((e) => e.node)
    .filter((node): node is ShopifyArticle & { image: { url: string; altText: string | null } } => node.image !== null)
    .map((node) => ({
      id: node.id,
      tag: `( ${node.blog.handle.toUpperCase()} )`,
      title: node.title,
      body: htmlToText(node.excerptHtml ?? ""),
      image: node.image.url,
      alt: node.image.altText ?? node.title,
    }));

  return <BlogStack posts={posts} />;
}
