# Blog Section Design Spec
**Date:** 2026-04-18

## Overview

A "Journal" blog section placed directly below `BrandStatementSection` on the homepage. Three blog post cards displayed in a stacking scroll effect: each card pins in place as the next one slides up over it, creating a stacked-deck feel as the user scrolls.

---

## File Structure

```
app/components/BlogSection/
  index.tsx        — section shell with header and sticky scroll container
  BlogPostCard.tsx — individual card (sticky positioning + z-index)
  constants.ts     — hardcoded post data array (CMS-ready shape)
```

Added to `app/page.tsx` after `<BrandStatementSection />`.

---

## Data Shape (`constants.ts`)

```ts
type BlogPost = {
  id: number;
  tag: string;
  title: string;
  body: string;
  image: string; // path relative to /public
};
```

Three posts matching Figma content:
1. **NEW COLLECTION - PREVIEW** — `/PhotoSection/photo-section1.jpg`
2. **9T7 x NEW BALANCE — MORE THAN RUNNING** — `/PhotoSection/photo-section2.jpg`
3. **9TSEVEN & NEW BALANCE 1080v15 CPHFW CELEBRATION** — `/PhotoSection/photo-section3.jpg`

Tag for all posts: `( LINK )` (placeholder until CMS is wired up).

---

## Layout

- **Background:** white (`bg-white`)
- **Nav theme:** `data-nav-theme="light"`
- **Section header:** right-aligned (matches Figma offset grid) — label `Journal` (32px, tracking tight) + subtitle `Recent work, moments, and ongoing process.` (20px)
- **Post row:** two columns — left half (tag + title + body), right half (full-bleed image via Next.js `<Image />`)
- **Divider:** `border-t border-black` between each post row
- **Typography:** Adapter Mono PE Variable (monospace) for all text, matching existing project font usage

---

## Stacking Scroll Effect

**Approach:** CSS `position: sticky` — no JS scroll listeners, fully compatible with Lenis.

Each `BlogPostCard`:
- `position: sticky`, `top: 0`
- `z-index` increments per card: card 1 = `z-10`, card 2 = `z-20`, card 3 = `z-30`
- White background (`bg-white`) so each card fully covers the one beneath
- Section wrapper has enough height to allow pinning: approximately `100vh` per card (achieved by letting each card have its own natural height and the section container being tall enough to scroll through all three)

The outer section wrapper uses `overflow: visible` so sticky children can pin correctly relative to the viewport.

---

## Component Boundaries

**`BlogSection/index.tsx`**
- Renders the section header
- Maps over `BLOG_POSTS` from `constants.ts`, rendering one `BlogPostCard` per entry
- No scroll logic — purely structural

**`BlogPostCard.tsx`**
- Accepts a `BlogPost` prop
- Handles its own sticky positioning and z-index via a prop-driven inline style or Tailwind class
- Renders tag, title, body, and image

**`constants.ts`**
- Exports `BLOG_POSTS: BlogPost[]`
- Structured for easy replacement by a CMS fetch later

---

## Constraints & Decisions

- Images use Next.js `<Image />` with `fill` + `object-cover` inside a relative container
- No new dependencies required — effect is pure CSS
- Data is hardcoded now; the `BlogPost` type is intentionally flat and CMS-friendly
- `( LINK )` tag is a placeholder — clicking it does nothing yet
