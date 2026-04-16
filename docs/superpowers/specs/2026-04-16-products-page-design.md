# Products Page Design

**Date:** 2026-04-16
**Branch:** feat-add-products-page

---

## Overview

Add a products listing page and a minimal product detail page to the 9TSEVEN website. The listing page features an infinite marquee banner displaying the current category name, a placeholder filter bar, and a responsive product grid using the existing `ProductCard` component. Clicking a card navigates to the product detail page.

---

## Routes

| URL | File | Description |
|-----|------|-------------|
| `/products` | `app/products/page.tsx` | All products, marquee shows "ALL PRODUCTS" |
| `/products/[category]` | `app/products/[category]/page.tsx` | Filtered by category, marquee shows category name |
| `/products/[category]/[id]` | `app/products/[category]/[id]/page.tsx` | Product detail page |

Category values match the existing nav: `apparel`, `accessories`, `equipment`, `new-arrivals`.

---

## 1. Products Listing Page (`/products` and `/products/[category]`)

### Marquee Banner
- Full-width infinite scrolling marquee at the top of the page.
- Text: the category name in uppercase (e.g. `APPAREL`, `ACCESSORIES`). For `/products`, text is `ALL PRODUCTS`.
- Font: large, heavy weight, slow scroll (~18s per cycle).
- Seamless loop: two identical copies of the text string translated so the reset is invisible.
- `user-select: none` so the text cannot be highlighted.
- White background, black text — matches the white section aesthetic.

### Filter Bar
- Sits below the marquee, above the grid.
- Left: a `⇌ FILTER` button (non-functional placeholder, no click handler).
- Right: product count label (e.g. `6 PRODUCTS`).
- Thin border bottom separating it from the grid.

### Product Grid
- Uses the existing `ProductCard` component unchanged — preserves all existing hover/drag/image-slider behaviour.
- Layout: `2` columns on mobile, `3` columns on desktop (≥ `md` breakpoint).
- Gap between cards: consistent with the existing `CARD_GAP` constant.
- Cards link to `/products/[category]/[id]` — wrap each `ProductCard` in a `<Link>` (Next.js).
- The info panel on each card floats inset from the bottom and side edges, exactly as on the home page carousel (matching `bottom-4 left-3.5 right-3.5` positioning).

### Filtering logic
- `/products` renders all entries from `PRODUCTS` constant.
- `/products/[category]` filters `PRODUCTS` by `product.category.toLowerCase()` matching the route segment.
- If a category has no products, render an empty state message.

---

## 2. Product Detail Page (`/products/[category]/[id]`)

### Layout — Desktop
- Two-column split: image panel (55% width) on the left, info panel on the right.
- Image panel: displays the active product image, full height, `object-cover`.
- Image indicator dots at the bottom of the image panel (one dot per image, active dot highlighted).
- Clicking a dot switches the active image (client state, no animation required).

### Layout — Mobile
- Stacks vertically: image on top (`aspect-ratio: 4/5`, full width), info below.
- Swiping left/right on the image cycles through product images (pointer event drag, same pattern as `useImageSlider` but implemented as a self-contained hook on this page — not a reuse of the carousel's `useProductCarousel`).

### Info Panel
- Back link: `← Back to [Category]` — uses `router.back()` or links to `/products/[category]`.
- Category label (small, uppercase, muted).
- Product name (large, bold, uppercase).
- Price (formatted as `DKK 699,00`).
- Divider line.
- Size selector: renders each size as a bordered button. Clicking selects it (local state). No cart integration needed.
- "Add to cart" button — non-functional placeholder (no click handler beyond visual feedback).

### Data
- Product is looked up from the `PRODUCTS` constant by `id`.
- If the product is not found (invalid id), render a simple "Product not found" message with a link back to `/products`.

---

## 3. Shared Components

### `CategoryMarquee`
A new client component that accepts a `text: string` prop and renders the infinite scrolling marquee. Used by both the listing pages. Encapsulates the CSS animation and `user-select: none`.

---

## 4. Navigation Wiring

- The existing `ProductCard` on the home page `FeaturedProductsSection` does **not** need to be changed for navigation — that is a separate concern.
- On the new listing page, each card is wrapped in a `<Link href={/products/${category}/${product.id}}>`.
- The "VIEW ALL PRODUCTS" button on the home page `FeaturedProductsSection` should link to `/products` (currently a non-functional `<button>` — update to a `<Link>`).

---

## 5. Out of Scope

- Filter functionality (drawer, panel, or query params).
- Cart integration.
- Subcategory routes (`/products/apparel/01`, etc.) — these are already defined in the nav but not built.
- Animations between listing and detail page transitions.
- SEO / metadata per product.
