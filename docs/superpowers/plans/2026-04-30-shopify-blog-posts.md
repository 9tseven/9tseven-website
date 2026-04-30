# Shopify-backed Blog Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `BLOG_POSTS` array in `app/components/BlogSection/` with the latest 5 articles fetched from Shopify across all blogs, preserving the existing sticky-stack scroll layout.

**Architecture:** Mirror the existing `FeaturedProductsSection` server/client split. A new async server component in `app/components/BlogSection/index.tsx` fetches articles via the Shopify Storefront API, filters out articles without images, maps them to the existing `BlogPost` shape, and passes them as a prop to a new `BlogStack.tsx` client component that holds the existing Lenis/scroll/peek logic.

**Tech Stack:** Next.js 16 (App Router, Server Components), `@shopify/storefront-api-client`, Lenis, Tailwind. No test framework in this project — verification is type-check (`tsc --noEmit`), lint (`eslint`), and visual confirmation in `next dev` per CLAUDE.md.

**Spec:** [docs/superpowers/specs/2026-04-30-shopify-blog-posts-design.md](../specs/2026-04-30-shopify-blog-posts-design.md)

---

## File Structure

```
app/
├── lib/queries/
│   └── articles.ts                NEW — GET_ARTICLES GraphQL query
└── components/BlogSection/
    ├── index.tsx                  REWRITTEN — async server component, fetches from Shopify
    ├── BlogStack.tsx              NEW — client component, holds existing scroll/peek logic
    ├── BlogPostCard.tsx           UNCHANGED
    └── constants.ts               REWRITTEN — type-only, BLOG_POSTS array removed
```

Each file has a single responsibility:
- `articles.ts` — GraphQL query string only
- `index.tsx` — fetch + filter + map only
- `BlogStack.tsx` — interactive sticky-stack scroll only
- `BlogPostCard.tsx` — single card rendering only
- `constants.ts` — shared type only

---

## Task 1: Add the Shopify articles GraphQL query

**Files:**
- Create: `app/lib/queries/articles.ts`

- [ ] **Step 1: Create the query file**

Create `app/lib/queries/articles.ts` with this exact contents:

```ts
export const GET_ARTICLES = `
query GetArticles($first: Int!) {
  articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
    edges {
      node {
        id
        handle
        title
        excerpt
        image {
          url
          altText
        }
        blog {
          handle
          title
        }
      }
    }
  }
}
`;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors related to `articles.ts` (a query string is valid TS regardless).

- [ ] **Step 3: Commit**

```bash
git add app/lib/queries/articles.ts
git commit -m "feat(blog-section): add Shopify articles GraphQL query"
```

---

## Task 2: Convert `constants.ts` to type-only

**Files:**
- Modify: `app/components/BlogSection/constants.ts` (full rewrite — drop the `BLOG_POSTS` array, change `id` from `number` to `string`)

- [ ] **Step 1: Replace the file contents**

Overwrite `app/components/BlogSection/constants.ts` with:

```ts
// app/components/BlogSection/constants.ts

export type BlogPost = {
  id: string;
  tag: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};
```

Note: `id` changes from `number` to `string` because Shopify Storefront returns GIDs (e.g. `gid://shopify/Article/123`).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: errors in `app/components/BlogSection/index.tsx` because it still imports `BLOG_POSTS` (which no longer exists). This is expected — Tasks 3 and 4 fix it.

- [ ] **Step 3: Do NOT commit yet**

Hold this commit. The codebase is in a broken state until Tasks 3 and 4 are done. Tasks 2–4 will be committed together at the end of Task 4.

---

## Task 3: Create `BlogStack.tsx` client component

**Files:**
- Create: `app/components/BlogSection/BlogStack.tsx`

This file is the existing `index.tsx` contents lifted verbatim, with two changes:
1. Renamed default export from `BlogSection` to `BlogStack`.
2. Accepts `posts: BlogPost[]` as a prop instead of importing `BLOG_POSTS` from `./constants`.

- [ ] **Step 1: Create the file**

Create `app/components/BlogSection/BlogStack.tsx` with this exact contents:

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useLenis } from "lenis/react";
import type { BlogPost } from "./constants";
import BlogPostCard from "./BlogPostCard";

const NAVBAR_H = 60;

interface Props {
  posts: BlogPost[];
}

export default function BlogStack({ posts }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lenis = useLenis();

  const [peekHeights, setPeekHeights] = useState<number[]>(() => new Array(posts.length).fill(72));

  const updatePeek = useCallback((index: number, height: number) => {
    setPeekHeights((prev) => {
      if (prev[index] === height) return prev;
      const next = [...prev];
      next[index] = height;
      return next;
    });
  }, []);

  const tops = posts.map((_, i) => NAVBAR_H + peekHeights.slice(0, i).reduce((a, b) => a + b, 0));

  const handleCardClick = (index: number) => {
    if (!sectionRef.current || !headerRef.current) return;

    const scroll = lenis?.scroll ?? window.scrollY;
    const sectionDocTop = sectionRef.current.getBoundingClientRect().top + scroll;
    const headerH = headerRef.current.offsetHeight;

    let sumPrevCardHeights = 0;
    for (let i = 0; i < index; i++) {
      sumPrevCardHeights += cardRefs.current[i]?.offsetHeight ?? 0;
    }

    const naturalCardTop = sectionDocTop + headerH + sumPrevCardHeights;
    const targetScroll = naturalCardTop - tops[index];

    lenis?.scrollTo(targetScroll, { duration: 1.2 });
  };

  return (
    <section ref={sectionRef} data-nav-theme="light" className="relative bg-white">
      <div ref={headerRef} className="p-5 md:p-0 flex items-start justify-between">
        <div className="hidden md:block md:w-1/2 h-22" />
        <div className="flex flex-col justify-center gap-1 h-22 py-2 md:w-1/2">
          <h2 className="text-2xl font-bold text-black">Journal</h2>
          <p className="text-xl text-black">Recent work, moments, and ongoing process.</p>
        </div>
      </div>

      {posts.map((post, index) => (
        <BlogPostCard
          key={post.id}
          post={post}
          index={index}
          top={tops[index]}
          onPeekHeight={(h) => updatePeek(index, h)}
          articleRef={(el) => {
            cardRefs.current[index] = el;
          }}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Do NOT type-check or commit yet**

`index.tsx` is still importing `BLOG_POSTS` and exporting `BlogSection` as a client component. Task 4 fixes both.

---

## Task 4: Rewrite `index.tsx` as a server component that fetches from Shopify

**Files:**
- Modify: `app/components/BlogSection/index.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Overwrite `app/components/BlogSection/index.tsx` with:

```tsx
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
      body: node.excerpt ?? "",
      image: node.image.url,
      alt: node.image.altText ?? node.title,
    }));

  return <BlogStack posts={posts} />;
}
```

Notes:
- `shopifyClient.request` is generic — typed via `ArticlesResponse` so `data.articles.edges` is fully typed downstream.
- The filter narrows the type so subsequent `.map` can access `node.image.url` without a non-null assertion.
- No try/catch around `request` — `errors || !data` is the only error path, matching `FeaturedProductsSection`.
- The empty-state requirement (header still rendered when posts is empty) is handled inside `BlogStack` because the `<section>` and header always render before the `posts.map`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

If `shopifyClient.request<ArticlesResponse>` is rejected by TypeScript because the SDK's `request` method signature doesn't accept a generic in your installed version, fix this in-place by removing the generic and instead asserting at the call site:

```tsx
const { data, errors } = await shopifyClient.request(GET_ARTICLES, {
  variables: { first: 5 },
});

if (errors || !data) {
  throw new Error(`Shopify GET_ARTICLES failed: ${JSON.stringify(errors)}`);
}

const typed = data as ArticlesResponse;

const posts: BlogPost[] = typed.articles.edges
  // …rest unchanged…
```

Re-run `npx tsc --noEmit` after the adjustment. Expected: clean.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors in `app/components/BlogSection/` or `app/lib/queries/articles.ts`.

- [ ] **Step 4: Commit Tasks 2–4 together**

```bash
git add app/components/BlogSection/constants.ts \
        app/components/BlogSection/BlogStack.tsx \
        app/components/BlogSection/index.tsx
git commit -m "refactor(blog-section): split server/client and source posts from Shopify"
```

---

## Task 5: Visual verification in dev server

**Files:** none (verification only).

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: dev server boots without runtime errors. Open `http://localhost:3000` in a browser.

- [ ] **Step 2: Verify the Journal section renders**

Scroll to the Journal section. Confirm:
- "Journal" header and subtitle render.
- Up to 5 article cards render, newest-first.
- Each card's tag reads `( NEWS )` (or whichever blog handle, uppercased) — not `( LINK )`.
- Each card's title and excerpt match what's in the Shopify admin.
- Each card's image loads (no broken-image icon, no console error from `next/image`).
- Clicking a card still triggers the sticky-stack scroll (existing behavior preserved).

- [ ] **Step 3: Verify edge cases**

- If you have an article in Shopify with no featured image, confirm it does NOT appear.
- If only N < 5 articles have images, confirm exactly N cards render.
- If Shopify has zero articles with images, confirm the "Journal" header still renders with no cards beneath.

- [ ] **Step 4: Stop the dev server**

Stop with Ctrl+C.

- [ ] **Step 5: Final type-check + lint sweep**

Run both:
```bash
npx tsc --noEmit
npm run lint
```
Expected: both clean.

---

## Self-Review Notes

- **Spec coverage**: query (Task 1), data mapping incl. tag formatting and image filter (Task 4), type change (Task 2), client split (Task 3), error handling (Task 4), empty state (Task 4 — header is in `BlogStack`, always renders), visual verification (Task 5). All spec sections covered.
- **Out-of-scope items** (article detail page, pagination, ISR, placeholder images) are not added. ✓
- **Type consistency**: `BlogPost` shape used identically in `index.tsx`, `BlogStack.tsx`, and `BlogPostCard.tsx` (the last unchanged). `id` is `string` in all three.
- **Cross-task references**: `GET_ARTICLES` is defined in Task 1 and consumed in Task 4; `BlogStack` is created in Task 3 and consumed in Task 4; `BlogPost` is defined in Task 2 and consumed in Tasks 3 and 4.
