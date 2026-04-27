# Navbar Shop Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder Shop dropdown with real category routing and live product image previews fetched at server-render.

**Architecture:** Convert `Navbar/index.tsx` from a client component into an async server component that fetches a tiny "nav previews" payload from Shopify and passes it down through a new `NavbarClient` wrapper to `ShopDropdown`. Subcategory links use `?tag=<slug>` query params to filter the existing category page without colliding with the `[category]/[handle]` product detail route.

**Tech Stack:** Next.js (App Router, "this is not the Next.js you know" per `AGENTS.md`), TypeScript, Tailwind, motion/react, `@shopify/storefront-api-client`, `next/image`.

**Spec:** `docs/superpowers/specs/2026-04-27-navbar-shop-dropdown-design.md`

**Verification approach:** No tests exist in this repo. Each task ends with `npx tsc --noEmit` and `npm run lint`. The final task adds manual UI verification in the dev server.

---

## File Structure

**Create**

- `app/lib/queries/navPreviews.ts` — GraphQL query string for the lightweight preview payload (handle, title, productType, featuredImage). One responsibility: define the query.
- `app/components/Navbar/getNavPreviews.ts` — Server-side helper. Calls `shopifyClient.request`, returns `NavPreviews`. Returns empty arrays on Shopify error so the navbar always renders.
- `app/components/Navbar/NavbarClient.tsx` — Client wrapper holding state previously in `Navbar/index.tsx` (`mobileOpen`, `useNavTheme`). Receives `previews` from the server parent and passes them into `DesktopNav`.

**Modify**

- `app/components/Navbar/constants.ts` — New subcategory entries (Tops/Bottoms/Activewear, Socks, Water Bottle), subcategory `href` values use `?tag=<slug>`.
- `app/components/Navbar/types.ts` — Add `PreviewItem` and `NavPreviews`.
- `app/components/Navbar/index.tsx` — Becomes async server component. Fetches previews and renders `<NavbarClient previews={...} />`.
- `app/components/Navbar/DesktopNav.tsx` — Accepts `previews` prop, forwards to `ShopDropdown`.
- `app/components/Navbar/ShopDropdown.tsx` — Renders real `<Image>` tiles for `type: "products"` panels using the previews. Empty array falls back to the existing dashed placeholders. Each tile links to `/products/<category-slug>/<handle>`.
- `app/products/[category]/page.tsx` — Accepts `searchParams: Promise<{ tag?: string }>`. Fixes `new-arrivals` to query by tag instead of `product_type`. Appends `AND tag:'<slug>'` when a tag is present. Marquee text uses tag label when filtering.

**Not modified**

- `app/products/page.tsx` (All Products), `app/products/[category]/[handle]/page.tsx` (product detail), `MobileMenu.tsx` (no images, only consumes `SHOP_MENU` labels/hrefs which remain valid).

---

### Task 1: Update SHOP_MENU constants

**Files:**
- Modify: `app/components/Navbar/constants.ts`

- [ ] **Step 1: Replace constants file content**

Write the new categories. The labels/hrefs in `subcategories` use `?tag=<slug>` query strings.

```ts
import type { ShopCategory } from "./types";

export const SHOP_MENU: ShopCategory[] = [
  {
    label: "New Arrivals",
    href: "/products/new-arrivals",
    type: "products",
  },
  {
    label: "Apparel",
    href: "/products/apparel",
    type: "subcategories",
    subcategories: [
      { label: "Tops", href: "/products/apparel?tag=tops" },
      { label: "Bottoms", href: "/products/apparel?tag=bottoms" },
      { label: "Activewear", href: "/products/apparel?tag=running" },
    ],
  },
  {
    label: "Accessories",
    href: "/products/accessories",
    type: "subcategories",
    subcategories: [
      { label: "Socks", href: "/products/accessories?tag=socks" },
    ],
  },
  {
    label: "Equipment",
    href: "/products/equipment",
    type: "subcategories",
    subcategories: [
      { label: "Water Bottle", href: "/products/equipment?tag=water-bottle" },
    ],
  },
  {
    label: "All Products",
    href: "/products",
    type: "products",
  },
];
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (Existing `ShopCategory` type already supports both shapes.)

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/constants.ts
git commit -m "feat(navbar): wire shop dropdown subcategories to tag-filtered routes"
```

---

### Task 2: Add preview types

**Files:**
- Modify: `app/components/Navbar/types.ts`

- [ ] **Step 1: Append preview types**

Add to the bottom of `app/components/Navbar/types.ts`:

```ts
export type PreviewItem = {
  handle: string;
  title: string;
  productType: string;
  image: { url: string; altText: string | null } | null;
};

export type NavPreviews = {
  newArrivals: PreviewItem[];
  allProducts: PreviewItem[];
};
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/types.ts
git commit -m "feat(navbar): add NavPreviews types for dropdown product tiles"
```

---

### Task 3: Add GraphQL query for nav previews

**Files:**
- Create: `app/lib/queries/navPreviews.ts`

- [ ] **Step 1: Create the query module**

Two aliased `products` selections in one request — keeps it to a single Shopify round trip. Sort `newArrivals` by `CREATED_AT` desc with the `new-arrival` tag filter. `allProducts` uses no filter.

```ts
export const GET_NAV_PREVIEWS = `
query GetNavPreviews($previewCount: Int!) {
  newArrivals: products(
    first: $previewCount
    sortKey: CREATED_AT
    reverse: true
    query: "tag:'new-arrival'"
  ) {
    edges {
      node {
        handle
        title
        productType
        featuredImage {
          url
          altText
        }
      }
    }
  }
  allProducts: products(first: $previewCount) {
    edges {
      node {
        handle
        title
        productType
        featuredImage {
          url
          altText
        }
      }
    }
  }
}
`;
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/lib/queries/navPreviews.ts
git commit -m "feat(shopify): add GET_NAV_PREVIEWS query for navbar dropdown tiles"
```

---

### Task 4: Add server-side preview fetch helper

**Files:**
- Create: `app/components/Navbar/getNavPreviews.ts`

- [ ] **Step 1: Implement the helper**

The helper swallows Shopify errors and returns empty arrays so the navbar always renders. Uses three previews (matching the dropdown's three-tile layout).

```ts
import { shopifyClient } from "@/app/lib/shopify";
import { GET_NAV_PREVIEWS } from "@/app/lib/queries/navPreviews";
import type { NavPreviews, PreviewItem } from "./types";

const PREVIEW_COUNT = 3;

type PreviewNode = {
  handle: string;
  title: string;
  productType: string;
  featuredImage: { url: string; altText: string | null } | null;
};

type PreviewResponse = {
  newArrivals: { edges: { node: PreviewNode }[] };
  allProducts: { edges: { node: PreviewNode }[] };
};

function toPreviewItem(node: PreviewNode): PreviewItem {
  return {
    handle: node.handle,
    title: node.title,
    productType: node.productType,
    image: node.featuredImage
      ? { url: node.featuredImage.url, altText: node.featuredImage.altText }
      : null,
  };
}

export async function getNavPreviews(): Promise<NavPreviews> {
  try {
    const { data, errors } = await shopifyClient.request(GET_NAV_PREVIEWS, {
      variables: { previewCount: PREVIEW_COUNT },
    });
    if (errors || !data) {
      return { newArrivals: [], allProducts: [] };
    }
    const typed = data as PreviewResponse;
    return {
      newArrivals: typed.newArrivals.edges.map((e) => toPreviewItem(e.node)),
      allProducts: typed.allProducts.edges.map((e) => toPreviewItem(e.node)),
    };
  } catch {
    return { newArrivals: [], allProducts: [] };
  }
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/getNavPreviews.ts
git commit -m "feat(navbar): add server-side getNavPreviews helper"
```

---

### Task 5: Split Navbar into server shell + client wrapper

`Navbar/index.tsx` is currently a client component. To `await getNavPreviews()` we need it to become an async server component. Move the existing client logic into a new `NavbarClient.tsx`.

**Files:**
- Create: `app/components/Navbar/NavbarClient.tsx`
- Modify: `app/components/Navbar/index.tsx`

- [ ] **Step 1: Create `NavbarClient.tsx`**

This is a verbatim move of what `index.tsx` does today, plus a new `previews` prop forwarded to `DesktopNav`.

```tsx
"use client";

import { useState } from "react";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import NavActions from "./NavActions";
import MobileMenu from "./MobileMenu";
import CartDrawer from "../Cart/CartDrawer";
import { useNavTheme } from "./hooks/useNavTheme";
import type { NavPreviews } from "./types";

interface NavbarClientProps {
  previews: NavPreviews;
}

export default function NavbarClient({ previews }: NavbarClientProps) {
  const theme = useNavTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>
        <div className="flex items-center h-16 px-6 md:px-10">
          <div className="flex-1 flex items-center">
            <Logo />
          </div>
          <DesktopNav previews={previews} />
          <div className="flex-1 flex items-center justify-end">
            <NavActions onMenuOpen={() => setMobileOpen(true)} />
          </div>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 2: Replace `Navbar/index.tsx` with the server shell**

Overwrite the full file (no `"use client"` directive — must be a server component to `await`):

```tsx
import NavbarClient from "./NavbarClient";
import { getNavPreviews } from "./getNavPreviews";

export default async function Navbar() {
  const previews = await getNavPreviews();
  return <NavbarClient previews={previews} />;
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: `DesktopNav` will fail type-check because it doesn't yet accept a `previews` prop. That's expected — Task 6 fixes it. Move on.

- [ ] **Step 4: Do NOT commit yet**

This task leaves the build broken on purpose. Commit happens at the end of Task 6 once the prop chain is complete.

---

### Task 6: Forward previews through DesktopNav

**Files:**
- Modify: `app/components/Navbar/DesktopNav.tsx`

- [ ] **Step 1: Update the component signature**

Change the export at `app/components/Navbar/DesktopNav.tsx:12` from:

```tsx
export default function DesktopNav() {
```

to:

```tsx
export default function DesktopNav({ previews }: { previews: NavPreviews }) {
```

- [ ] **Step 2: Add the type import**

At the top of the file, alongside the existing `import type { PillStyle } from "./types";`, change to:

```tsx
import type { PillStyle, NavPreviews } from "./types";
```

- [ ] **Step 3: Forward previews to ShopDropdown**

Change the `<ShopDropdown ...>` usage near the bottom of the file from:

```tsx
<ShopDropdown
  shopOpen={shopOpen}
  onShopLinkClick={() => {
    setShopOpen(false);
    setHoveredIndex(null);
  }}
/>
```

to:

```tsx
<ShopDropdown
  shopOpen={shopOpen}
  previews={previews}
  onShopLinkClick={() => {
    setShopOpen(false);
    setHoveredIndex(null);
  }}
/>
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: `ShopDropdown` will now fail type-check because it doesn't yet accept `previews`. That's expected — Task 7 fixes it.

- [ ] **Step 5: Do NOT commit yet**

Commit happens at the end of Task 7.

---

### Task 7: Render real preview tiles in ShopDropdown

**Files:**
- Modify: `app/components/Navbar/ShopDropdown.tsx`

- [ ] **Step 1: Replace the file content**

This rewrites the whole component. Key changes vs. the existing version:

- Adds `previews` prop.
- For each `type: "products"` entry, picks the right preview list (`newArrivals` for the New Arrivals entry, `allProducts` for All Products) by matching on `category.href`.
- Renders real `<Image>` tiles when previews are available; falls back to the existing dashed placeholders when the list is empty.
- Each tile links to `/products/<category-slug>/<handle>` where `category-slug` is the lowercased product type with spaces replaced by hyphens.

```tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SHOP_MENU } from "./constants";
import type { NavPreviews, PreviewItem } from "./types";

interface ShopDropdownProps {
  shopOpen: boolean;
  previews: NavPreviews;
  onShopLinkClick: () => void;
}

function categorySlug(productType: string): string {
  return productType.toLowerCase().replace(/\s+/g, "-");
}

function previewsForHref(href: string, previews: NavPreviews): PreviewItem[] {
  if (href === "/products/new-arrivals") return previews.newArrivals;
  if (href === "/products") return previews.allProducts;
  return [];
}

export default function ShopDropdown({ shopOpen, previews, onShopLinkClick }: ShopDropdownProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const category = SHOP_MENU[activeCategory];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!shopOpen) setActiveCategory(0);
  }, [shopOpen]);

  return (
    <AnimatePresence>
      {shopOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.97, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -4 }} transition={{ duration: 0.15, ease: "easeOut" }} className="absolute p-4 top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex bg-[rgba(18,18,18,0.7)] backdrop-blur-md rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.35)]" style={{ transformOrigin: "top center" }}>
          {/* Left column — categories */}
          <div className="py-3 border-r border-white/[0.07]" style={{ minWidth: "170px" }}>
            {SHOP_MENU.map((item, i) => (
              <div key={item.href} className="relative mx-1.5">
                {activeCategory === i && <motion.div layoutId="dropdown-pill" className="absolute inset-0 rounded-[10px] bg-white/9" transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }} />}
                <Link href={item.href} onClick={onShopLinkClick} onMouseEnter={() => setActiveCategory(i)} className="relative block px-4 py-2.5 text-[0.68rem] tracking-[0.16em] uppercase text-white/45 hover:text-white transition-colors duration-150 z-10">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right column — subcategories or product previews */}
          <div className="overflow-hidden" style={{ width: "380px", minHeight: "228px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeCategory} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.12 }}>
                {category.type === "subcategories" ? (
                  <div className="py-3">
                    <p className="px-5 py-2.5 text-[0.6rem] tracking-[0.18em] uppercase text-white/20">{category.label}</p>
                    {category.subcategories.map((sub) => (
                      <Link key={sub.href} href={sub.href} onClick={onShopLinkClick} className="block mx-1.5 px-4 py-2.5 text-[0.68rem] tracking-[0.14em] uppercase text-white/55 hover:text-white hover:bg-white/[0.07] rounded-[10px] transition-colors duration-150">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <ProductPreviewPanel
                    category={category}
                    items={previewsForHref(category.href, previews)}
                    onShopLinkClick={onShopLinkClick}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ProductPreviewPanelProps {
  category: { label: string; href: string; type: "products" };
  items: PreviewItem[];
  onShopLinkClick: () => void;
}

function ProductPreviewPanel({ category, items, onShopLinkClick }: ProductPreviewPanelProps) {
  const hasItems = items.length > 0;

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        {hasItems
          ? items.slice(0, 3).map((item) => {
              const href = `/products/${categorySlug(item.productType)}/${item.handle}`;
              return (
                <Link key={item.handle} href={href} onClick={onShopLinkClick} className="flex-1 flex flex-col gap-1.5 group">
                  <div className="w-full aspect-3/4 rounded-lg bg-white/6 overflow-hidden relative group-hover:bg-white/10 transition-colors duration-150">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText ?? item.title}
                        fill
                        sizes="116px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">▣</span>
                    )}
                  </div>
                  <span className="text-[0.6rem] tracking-widest uppercase text-white/35 text-center group-hover:text-white/60 transition-colors duration-150 truncate">
                    {item.title}
                  </span>
                </Link>
              );
            })
          : [1, 2, 3].map((n) => (
              <div key={n} className="flex-1 flex flex-col gap-1.5">
                <div className="w-full aspect-3/4 rounded-lg bg-white/6 border border-dashed border-white/15 flex items-center justify-center">
                  <span className="text-white/20 text-xs">▣</span>
                </div>
                <span className="text-[0.6rem] tracking-widest uppercase text-white/35 text-center">Product_0{n}</span>
              </div>
            ))}
      </div>
      <Link href={category.href} onClick={onShopLinkClick} className="self-end text-[0.62rem] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors duration-150">
        See all →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. The full prop chain (Navbar → NavbarClient → DesktopNav → ShopDropdown) now type-checks.

- [ ] **Step 3: Commit Tasks 5–7 together**

```bash
git add app/components/Navbar/index.tsx app/components/Navbar/NavbarClient.tsx app/components/Navbar/DesktopNav.tsx app/components/Navbar/ShopDropdown.tsx
git commit -m "feat(navbar): fetch live product previews server-side for shop dropdown"
```

---

### Task 8: Fix new-arrivals + add tag filter to category page

**Files:**
- Modify: `app/products/[category]/page.tsx`

- [ ] **Step 1: Replace the file content**

The new file:
- Switches `new-arrivals` to query by tag instead of `product_type`.
- Reads `searchParams.tag` (Next.js promise-style per `AGENTS.md`) and appends `AND tag:'<slug>'` to the Shopify query.
- Marquee text shows the tag label (uppercased, hyphens → spaces) when filtering.

```tsx
import { notFound } from "next/navigation";
import CategoryMarquee from "../components/CategoryMarquee";
import ProductsGrid from "../components/ProductsGrid";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_PRODUCTS } from "@/app/lib/queries/products";
import { toProduct, type StorefrontProduct } from "@/app/components/FeaturedProductsSection/types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ tag?: string }>;
}

const KNOWN_CATEGORIES = ["apparel", "accessories", "equipment", "new-arrivals"];

function categorySlugToProductType(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildShopifyQuery(slug: string, tag: string | undefined): string | undefined {
  const baseFilter =
    slug === "new-arrivals"
      ? `tag:'new-arrival'`
      : `product_type:'${categorySlugToProductType(slug)}'`;
  if (!tag) return baseFilter;
  return `${baseFilter} AND tag:'${tag}'`;
}

function marqueeLabel(slug: string, tag: string | undefined): string {
  if (tag) return tag.toUpperCase().replace(/-/g, " ");
  return slug
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const { tag } = await searchParams;
  const slug = category.toLowerCase();

  const query = buildShopifyQuery(slug, tag);

  const { data, errors } = await shopifyClient.request(GET_PRODUCTS, {
    variables: { first: 100, query },
  });

  if (errors) {
    throw new Error(`Shopify GET_PRODUCTS failed: ${JSON.stringify(errors)}`);
  }

  const edges = (data as { products: { edges: { node: StorefrontProduct }[] } } | undefined)?.products.edges ?? [];
  const products = edges.map((e) => toProduct(e.node));

  if (!KNOWN_CATEGORIES.includes(slug) && products.length === 0) {
    notFound();
  }

  const label = marqueeLabel(slug, tag);

  return (
    <main data-nav-theme="light" className="bg-white min-h-screen pt-16">
      <CategoryMarquee text={label} />

      <div className="mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
          <button type="button" className="text-[9px] tracking-[0.2em] uppercase text-black/50 border border-black/20 px-3 py-1.5" disabled>
            ⇌&nbsp;&nbsp;Filter
          </button>
          <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">{products.length} Products</span>
        </div>

        <ProductsGrid products={products} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/products/[category]/page.tsx
git commit -m "feat(products): support tag filter and fix new-arrivals query"
```

---

### Task 9: Manual UI verification

No tests exist; verify in the browser.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open `http://localhost:3000`.

- [ ] **Step 2: Verify dropdown previews**

Hover the Shop trigger.

- Hover **New Arrivals** — right pane shows three real product images with titles. Each links to `/products/<cat>/<handle>` and lands on a real product detail page.
- Hover **All Products** — same: three real product images.
- Hover **Apparel** — right pane shows `Tops`, `Bottoms`, `Activewear`.
- Hover **Accessories** — right pane shows `Socks`.
- Hover **Equipment** — right pane shows `Water Bottle`.

If a preview list is empty (e.g. no products tagged `new-arrival` yet), tiles fall back to the dashed placeholders without a runtime error.

- [ ] **Step 3: Verify routing**

Click each entry / sub-entry from the dropdown and confirm the resulting page:

| URL                                       | Expected                                              |
|-------------------------------------------|-------------------------------------------------------|
| `/products/new-arrivals`                  | Marquee `NEW ARRIVALS`. Grid shows products tagged `new-arrival`. |
| `/products/apparel`                       | Marquee `APPAREL`. All apparel products.              |
| `/products/apparel?tag=tops`              | Marquee `TOPS`. Apparel filtered to `tag:tops`.       |
| `/products/apparel?tag=bottoms`           | Marquee `BOTTOMS`.                                    |
| `/products/apparel?tag=running`           | Marquee `RUNNING`.                                    |
| `/products/accessories?tag=socks`         | Marquee `SOCKS`.                                      |
| `/products/equipment?tag=water-bottle`    | Marquee `WATER BOTTLE`.                               |
| `/products`                               | All products. Unchanged.                              |
| `/products/<cat>/<handle>` (any product)  | Product detail page renders. Confirms no route collision. |

- [ ] **Step 4: No new commit**

This task only verifies. Implementation commits happen in Tasks 1–8.

---

## Self-Review

**Spec coverage:**
- Subcategory data model & tags → Task 1.
- Routing including `?tag=` filter and new-arrivals fix → Task 8.
- `PreviewItem` / `NavPreviews` types → Task 2.
- `GET_NAV_PREVIEWS` query + `getNavPreviews` helper → Tasks 3, 4.
- Server-side fetch pulled through Navbar → DesktopNav → ShopDropdown → Tasks 5, 6, 7.
- ShopDropdown real tiles + dashed-placeholder fallback → Task 7.
- Marquee label change for tag-filtered pages → Task 8.
- Acceptance criteria checks → Task 9.

**Out-of-scope confirmations:** No tests added, no caching tuning, no MobileMenu changes, no tag allowlist — matches spec.

**Type consistency:** `PreviewItem`, `NavPreviews`, `categorySlug`, `previewsForHref` reference the same fields throughout. `ProductPreviewPanel` accepts `category: { label; href; type: "products" }` — matches the discriminated union variant in `types.ts`.

**Placeholder scan:** All steps contain actual code or actual commands. No "TBD", "TODO", or hand-waving.
