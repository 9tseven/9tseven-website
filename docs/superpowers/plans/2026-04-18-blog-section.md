# Blog Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Journal" blog section below `BrandStatementSection` on the homepage, with three stacking blog post cards that pin via `position: sticky` as the user scrolls.

**Architecture:** Three files in `app/components/BlogSection/` — a `constants.ts` for post data, a `BlogPostCard.tsx` for each individual card, and `index.tsx` as the section shell. The stacking scroll effect is pure CSS (`sticky top-0` + incrementing `z-index`) — no client-side JS needed. The section is a Server Component.

**Tech Stack:** Next.js 16 App Router (Server Components), TypeScript, Tailwind CSS v4, Next.js `<Image />` for images.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/components/BlogSection/constants.ts` | Create | `BlogPost` type + `BLOG_POSTS` data array |
| `app/components/BlogSection/BlogPostCard.tsx` | Create | Single card — sticky positioning, tag/title/body/image layout |
| `app/components/BlogSection/index.tsx` | Create | Section shell — header + maps over posts |
| `app/page.tsx` | Modify | Add `<BlogSection />` after `<BrandStatementSection />` |

---

## Task 1: Create `constants.ts`

**Files:**
- Create: `app/components/BlogSection/constants.ts`

- [ ] **Step 1: Create the file with the `BlogPost` type and data**

```ts
// app/components/BlogSection/constants.ts

export type BlogPost = {
  id: number;
  tag: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    tag: "( LINK )",
    title: "NEW COLLECTION - PREVIEW",
    body: "A new collection is on the way.\nBuilt for movement.\n\nDesigned for everyday pace.\nLightweight layers.\nTechnical details.\nA more refined direction.\nThis is a first look.\n\nMore soon.",
    image: "/PhotoSection/photo-section1.jpg",
    alt: "New collection preview",
  },
  {
    id: 2,
    tag: "( LINK )",
    title: "9T7 x NEW BALANCE\nMORE THAN RUNNING",
    body: "A new documentary.\nMore than running.\n\nNot about pace.\nNot about performance.\nAbout the people around it.\nAnd what holds it together.\nA shared routine.\nA reason to show up.\nAnd what happens when that's taken away.\nWhen running is no longer an option.\nAnd everything around it starts to shift.\nBecause it was never just the run.\n\nWatch MORE THAN RUNNING on YouTube.",
    image: "/PhotoSection/photo-section2.jpg",
    alt: "9T7 x New Balance — More Than Running documentary",
  },
  {
    id: 3,
    tag: "( LINK )",
    title: "9TSEVEN & NEW BALANCE 1080v15 CPHFW CELEBRATION",
    body: "As part of Copenhagen Fashion Week, 9TSEVEN and New Balance brought together running, food, art, music and performance to introduce the new NB 1080v15.\n\nThroughout the night, Jonas Erbo ran a full marathon on a treadmill as part of his performance "Gyldne Tider" - 12 marathons in 12 months.\n\nAn intimate night where running stepped off the road and into the room.",
    image: "/PhotoSection/photo-section3.jpg",
    alt: "9TSEVEN & New Balance 1080v15 CPHFW celebration event",
  },
];
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/BlogSection/constants.ts
git commit -m "feat: add BlogSection data constants"
```

---

## Task 2: Create `BlogPostCard.tsx`

**Files:**
- Create: `app/components/BlogSection/BlogPostCard.tsx`

- [ ] **Step 1: Create the card component**

```tsx
// app/components/BlogSection/BlogPostCard.tsx
import Image from "next/image";
import type { BlogPost } from "./constants";

export default function BlogPostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <article
      className="sticky top-0 bg-white border-t border-black flex flex-col md:flex-row"
      style={{ zIndex: (index + 1) * 10 }}
    >
      {/* Left: text content */}
      <div className="flex gap-5 p-5 md:w-1/2 shrink-0">
        <span className="font-mono text-sm tracking-[-0.05em] text-black shrink-0 w-36">
          {post.tag}
        </span>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-mono font-semibold text-xl tracking-[-0.05em] text-black whitespace-pre-wrap">
            {post.title}
          </h3>
          <p className="font-mono text-base tracking-[-0.05em] text-black whitespace-pre-wrap leading-relaxed">
            {post.body}
          </p>
        </div>
      </div>

      {/* Right: image */}
      <div className="relative h-64 md:h-auto md:flex-1">
        <Image
          src={post.image}
          alt={post.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/BlogSection/BlogPostCard.tsx
git commit -m "feat: add BlogPostCard component with sticky stacking layout"
```

---

## Task 3: Create `BlogSection/index.tsx`

**Files:**
- Create: `app/components/BlogSection/index.tsx`

- [ ] **Step 1: Create the section shell**

```tsx
// app/components/BlogSection/index.tsx
import { BLOG_POSTS } from "./constants";
import BlogPostCard from "./BlogPostCard";

export default function BlogSection() {
  return (
    <section data-nav-theme="light" className="bg-white">
      {/* Section header — title pinned to the right half, matching Figma offset layout */}
      <div className="flex items-end justify-between px-5 pt-12 pb-0">
        <div className="hidden md:block md:w-1/2" />
        <div className="flex flex-col gap-2.5 px-5 pb-5">
          <h2 className="font-mono text-[2rem] tracking-[-0.05em] text-black">Journal</h2>
          <p className="font-mono text-xl tracking-[-0.05em] text-black/70">
            Recent work, moments, and ongoing process.
          </p>
        </div>
      </div>

      {/* Stacking blog post cards */}
      {BLOG_POSTS.map((post, index) => (
        <BlogPostCard key={post.id} post={post} index={index} />
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/BlogSection/index.tsx
git commit -m "feat: add BlogSection shell with Journal header"
```

---

## Task 4: Register in `page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import and component**

Current `app/page.tsx`:
```tsx
// app/page.tsx
import HeroSection from "./components/HeroSection";
import MantraSection from "./components/MantraSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";
import InspoSection from "./components/InspoSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProductsSection />
      <MantraSection />
      <HomeImageSection />
      <BrandStatementSection />
    </main>
  );
}
```

Replace with:
```tsx
// app/page.tsx
import HeroSection from "./components/HeroSection";
import MantraSection from "./components/MantraSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";
import BlogSection from "./components/BlogSection";
import InspoSection from "./components/InspoSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProductsSection />
      <MantraSection />
      <HomeImageSection />
      <BrandStatementSection />
      <BlogSection />
    </main>
  );
}
```

- [ ] **Step 2: Start the dev server and visually verify**

Run: `npm run dev`

Open `http://localhost:3000` and scroll to the bottom. Verify:
- [ ] "Journal" heading and subtitle appear right-aligned on desktop
- [ ] Three blog post cards render below `BrandStatementSection`
- [ ] Each card has tag on far left, title + body in the middle, image on the right
- [ ] `border-t border-black` divider appears above each card
- [ ] Scrolling through the section causes cards to stack on top of each other (card 2 slides over card 1, card 3 slides over card 2)
- [ ] On mobile, image stacks below text content

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add BlogSection to homepage below BrandStatementSection"
```
