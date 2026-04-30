import { shopifyClient } from "@/app/lib/shopify";
import { GET_ARTICLES } from "@/app/lib/queries/articles";
import BlogStack from "./BlogStack";
import type { BlogPost } from "./constants";

type ShopifyArticle = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  image: { url: string; altText: string | null } | null;
  blog: { handle: string; title: string };
};

type ArticlesResponse = {
  articles: {
    edges: { node: ShopifyArticle }[];
  };
};

export default async function BlogSection() {
  const { data, errors } = await shopifyClient.request(GET_ARTICLES, {
    variables: { first: 5 },
  });

  if (errors || !data) {
    throw new Error(`Shopify GET_ARTICLES failed: ${JSON.stringify(errors)}`);
  }

  const typed = data as ArticlesResponse;

  const posts: BlogPost[] = typed.articles.edges
    .map((e) => e.node)
    .filter((node): node is ShopifyArticle & { image: { url: string; altText: string | null } } => node.image !== null)
    .map((node) => ({
      id: node.id,
      tag: `( ${node.blog.handle.toUpperCase()} )`,
      title: node.title,
      body: node.excerpt ?? "",
      image: node.image.url,
      alt: node.image.altText ?? node.title,
    }));

  return <BlogStack posts={posts} />;
}
