# Shopify-backed Blog Section — Design

## Goal

Replace the hardcoded `BLOG_POSTS` array in `app/components/BlogSection/constants.ts` with the latest blog posts authored in the Shopify content panel. Visual layout and scroll behavior stay unchanged.

## Scope

- Fetch the latest 5 articles from Shopify across all blogs.
- Map each Shopify article to the existing `BlogPost` shape so the existing `BlogPostCard` and stack-scroll logic render unchanged.
- The `tag` field shows the article's blog category, formatted as `( CATEGORY )` (e.g. `( NEWS )`).
- Articles without a featured image are skipped — fewer than 5 cards may render.
- Card click behavior (in-section sticky-stack scroll) is unchanged. No new article route, no Shopify-hosted link-out.
- If zero articles render, the "Journal" header is still shown with no cards beneath.

## Approach

Mirror the existing `FeaturedProductsSection` pattern: a server component fetches from Shopify and passes data as props to a client component that holds the interactive scroll/peek logic.

## File changes

```
app/
├── lib/queries/
│   └── articles.ts                NEW
└── components/BlogSection/
    ├── index.tsx                  CHANGED — async server component, fetches articles
    ├── BlogStack.tsx              NEW — client component (current index.tsx contents)
    ├── BlogPostCard.tsx           UNCHANGED
    └── constants.ts               CHANGED — type only, BLOG_POSTS array removed
```

## Shopify query

`app/lib/queries/articles.ts`:

```graphql
query GetArticles($first: Int!) {
  articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
    edges {
      node {
        id
        handle
        title
        excerpt
        image { url altText }
        blog { handle title }
      }
    }
  }
}
```

The Storefront API top-level `articles` field returns articles across all blogs. `sortKey: PUBLISHED_AT, reverse: true` gives newest-first. The query is invoked with `first: 5`.

## Data mapping

In `app/components/BlogSection/index.tsx` (server component):

1. Call `shopifyClient.request(GET_ARTICLES, { variables: { first: 5 } })`.
2. On `errors || !data`, throw `Error("Shopify GET_ARTICLES failed: ...")` — same pattern as `FeaturedProductsSection`.
3. Filter out edges where `node.image` is null/undefined.
4. Map each remaining edge to a `BlogPost`:
   - `id` → `node.id` (string GID)
   - `tag` → `` `( ${node.blog.handle.toUpperCase()} )` ``
   - `title` → `node.title`
   - `body` → `node.excerpt ?? ""`
   - `image` → `node.image.url`
   - `alt` → `node.image.altText ?? node.title`
5. Render `<BlogStack posts={posts} />`.

## Type changes

`app/components/BlogSection/constants.ts` becomes type-only:

```ts
export type BlogPost = {
  id: string;
  tag: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};
```

`id` changes from `number` to `string` because Shopify returns GIDs (e.g. `gid://shopify/Article/123`).

## Client component

`app/components/BlogSection/BlogStack.tsx` is the current `index.tsx` contents with two changes:

- `"use client"` directive stays at the top.
- Accepts `posts: BlogPost[]` as a prop instead of importing `BLOG_POSTS`.

All scroll, peek-height, and Lenis logic is copied verbatim. The image domain in `next.config.ts` may need an entry for the Shopify CDN host (`cdn.shopify.com`) for `next/image` to load article images — this is verified during implementation.

## Empty / error states

- **Zero articles returned, or all 5 lacked images:** the `<section>` and "Journal" header render; the map over `posts` produces no cards. Page rhythm preserved.
- **Shopify error:** thrown from the server component; Next's nearest error boundary handles it (consistent with `FeaturedProductsSection`).

## Out of scope

- Full article detail page / route.
- Pagination or "load more".
- Filtering by blog/category in the UI.
- Caching/ISR strategy beyond Next.js defaults — can be added later if needed.
- Placeholder images for articles missing a featured image.
