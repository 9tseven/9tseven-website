# Product Tags & Sold-Out Treatment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Sale, Few Left, Sold Out, and (real) New Arrival tags to product cards, plus a grey-out treatment for sold-out products.

**Architecture:** Extend the Shopify GraphQL query and the `Product` type with `compareAtPrice`, `totalInventory`, `isSoldOut`, and `isNewArrival`. Add a single `ProductCardTags` component that picks at most one tag per side based on a fixed priority. In `ProductCard`, replace the hardcoded "New Arrival" `<div>` with the new component, apply opacity+grayscale when sold out, and hide the "Add to cart" button in `ProductCardInfo` when sold out.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, `@shopify/storefront-api-client`, TypeScript.

**Spec:** [docs/superpowers/specs/2026-04-26-product-tags-and-sold-out-design.md](../specs/2026-04-26-product-tags-and-sold-out-design.md)

**No test framework is installed in this project.** Verification per task = `npm run build` and visual check in the browser. Do not introduce a test framework.

---

## File Map

**Modify:**
- `app/lib/queries/products.ts` — extend variant subselection
- `app/components/FeaturedProductsSection/types.ts` — extend `StorefrontVariant` & `Product`, update `toProduct()`
- `app/components/FeaturedProductsSection/constants.ts` — remove unused `PRODUCTS` mock array (it would fail to type-check after `Product` gains required fields, and nothing imports it)
- `app/components/FeaturedProductsSection/ProductCard/index.tsx` — replace hardcoded "New Arrival" badges, apply grey-out
- `app/components/FeaturedProductsSection/ProductCard/ProductCardInfo.tsx` — hide "Add to cart" when sold out

**Create:**
- `app/components/FeaturedProductsSection/ProductCard/ProductCardTags.tsx` — tag-picking component

---

### Task 1: Extend GraphQL variant fragment

**Files:**
- Modify: `app/lib/queries/products.ts:30-41` (variants block inside `PRODUCT_FIELDS`)

- [ ] **Step 1: Add price, compareAtPrice, and quantityAvailable to the variant subselection**

Replace the `variants` block in `PRODUCT_FIELDS` so it reads:

```graphql
variants(first: 50) {
  edges {
    node {
      id
      availableForSale
      quantityAvailable
      price {
        amount
      }
      compareAtPrice {
        amount
      }
      selectedOptions {
        name
        value
      }
    }
  }
}
```

The complete updated file:

```ts
const PRODUCT_FIELDS = `
  id
  handle
  title
  descriptionHtml
  productType
  tags
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  options {
    name
    values
  }
  featuredImage {
    url
    altText
  }
  images(first: 5) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 50) {
    edges {
      node {
        id
        availableForSale
        quantityAvailable
        price {
          amount
        }
        compareAtPrice {
          amount
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const GET_PRODUCTS = `
query GetProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      node {
        ${PRODUCT_FIELDS}
      }
    }
  }
}
`;

export const GET_PRODUCT_BY_HANDLE = `
query GetProductByHandle($handle: String!) {
  product(handle: $handle) {
    ${PRODUCT_FIELDS}
  }
}
`;
```

- [ ] **Step 2: Verify the query is syntactically valid by building**

Run: `npm run build`
Expected: Build succeeds. (TypeScript won't catch GraphQL syntax errors but build will run; we'll catch runtime issues during the visual check at the end.)

- [ ] **Step 3: Commit**

```bash
git add app/lib/queries/products.ts
git commit -m "feat(products): query compareAtPrice, quantityAvailable, and price per variant"
```

---

### Task 2: Extend types and `toProduct()` derivations

**Files:**
- Modify: `app/components/FeaturedProductsSection/types.ts`

- [ ] **Step 1: Extend `StorefrontVariant` with new fields**

Replace the `StorefrontVariant` type definition (lines 14-18 of the current file) with:

```ts
type StorefrontVariant = {
  id: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: { amount: string };
  compareAtPrice: { amount: string } | null;
  selectedOptions: { name: string; value: string }[];
};
```

- [ ] **Step 2: Extend the `Product` type with the four new derived fields**

Replace the `Product` type definition (lines 1-11) with:

```ts
export type Product = {
  id: string;
  handle: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  totalInventory: number | null;
  isSoldOut: boolean;
  isNewArrival: boolean;
  sizes: string[];
  soldOutSizes: string[];
  images: string[];
  descriptionHtml?: string;
};
```

- [ ] **Step 3: Update `toProduct()` to compute the new fields**

Replace the entire `toProduct` function (lines 47-70) with:

```ts
export function toProduct(node: StorefrontProduct): Product {
  const sizeOption = node.options.find((o) => o.name.toLowerCase() === "size");
  const sizes = sortSizes(sizeOption?.values ?? []);

  const variants = node.variants.edges.map((e) => e.node);

  const soldOutSizes = variants
    .filter((v) => !v.availableForSale)
    .flatMap((v) => v.selectedOptions.filter((o) => o.name.toLowerCase() === "size").map((o) => o.value));

  const imageUrls = node.images.edges.map((e) => e.node.url);
  const images = imageUrls.length > 0 ? imageUrls : node.featuredImage ? [node.featuredImage.url] : [];

  const isSoldOut = variants.length > 0 && variants.every((v) => !v.availableForSale);

  const compareAtPrices = variants
    .map((v) => (v.compareAtPrice ? Number(v.compareAtPrice.amount) : null))
    .filter((n): n is number => n !== null && n > 0);
  const compareAtPrice = compareAtPrices.length > 0 ? Math.max(...compareAtPrices) : null;

  const quantities = variants.map((v) => v.quantityAvailable);
  const totalInventory = quantities.some((q) => q === null)
    ? null
    : quantities.reduce<number>((sum, q) => sum + (q ?? 0), 0);

  const isNewArrival = node.tags.some((t) => t.toLowerCase() === "new-arrival");

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    category: node.productType || node.tags[0] || "",
    price: Number(node.priceRange.minVariantPrice.amount),
    compareAtPrice,
    totalInventory,
    isSoldOut,
    isNewArrival,
    sizes,
    soldOutSizes,
    images,
    descriptionHtml: node.descriptionHtml,
  };
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build will likely **fail** — `app/components/FeaturedProductsSection/constants.ts` declares `Product` literals missing the four new required fields. That file is fixed in Task 3. If the only errors are in `constants.ts`, that's expected; proceed.

- [ ] **Step 5: Commit**

```bash
git add app/components/FeaturedProductsSection/types.ts
git commit -m "feat(products): derive isSoldOut, isNewArrival, compareAtPrice, totalInventory in toProduct"
```

---

### Task 3: Remove unused mock `PRODUCTS` array

**Files:**
- Modify: `app/components/FeaturedProductsSection/constants.ts`

**Why:** `PRODUCTS` is exported but not imported anywhere (verified by grep — only `CARD_GAP` and `PEEK_AMOUNT` are imported). With the new required fields on `Product`, the mock literals would fail to type-check. Removing dead code is preferred over backfilling values that are never used.

- [ ] **Step 1: Replace the file with the trimmed version**

Overwrite `app/components/FeaturedProductsSection/constants.ts` with exactly:

```ts
/** px gap between cards */
export const CARD_GAP = 16;

/** px of the next card that peeks at the right edge */
export const PEEK_AMOUNT = 40;
```

This deletes: the `BaseProduct` import, the `Product` type re-export, and the `PRODUCTS` array. It keeps `CARD_GAP = 16` and `PEEK_AMOUNT = 40` (the only two exports actually imported elsewhere — verified by grep against `app/components/FeaturedProductsSection/FeaturedProductsCarousel.tsx` and `app/components/FeaturedProductsSection/hooks/useProductCarousel.ts`).

- [ ] **Step 2: Confirm no caller broke**

Run: `grep -rn "PRODUCTS\b\|from.*FeaturedProductsSection/constants" app/ --include="*.ts" --include="*.tsx"`
Expected: only `CARD_GAP` / `PEEK_AMOUNT` imports show up; no reference to `PRODUCTS`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds. (Tasks 1-3 together leave the project in a buildable state.)

- [ ] **Step 4: Commit**

```bash
git add app/components/FeaturedProductsSection/constants.ts
git commit -m "chore(products): remove unused PRODUCTS mock array"
```

---

### Task 4: Create `ProductCardTags` component

**Files:**
- Create: `app/components/FeaturedProductsSection/ProductCard/ProductCardTags.tsx`

- [ ] **Step 1: Create the component file**

Write the file with exactly this content:

```tsx
import type { Product } from "../types";

interface ProductCardTagsProps {
  product: Product;
}

export default function ProductCardTags({ product }: ProductCardTagsProps) {
  const right = product.isSoldOut ? "Sold Out" : product.isNewArrival ? "New Arrival" : null;

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const fewLeft =
    !product.isSoldOut &&
    !onSale &&
    product.totalInventory !== null &&
    product.totalInventory <= 3;
  const left = onSale ? "Sale" : fewLeft ? "Few Left" : null;

  return (
    <>
      {left && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-black pointer-events-none">
          <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">{left}</span>
        </div>
      )}
      {right && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black pointer-events-none">
          <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">{right}</span>
        </div>
      )}
    </>
  );
}
```

Notes:
- Styling matches the existing badge in [ProductCard/index.tsx:62-64](../../app/components/FeaturedProductsSection/ProductCard/index.tsx) exactly (`px-3 py-1.5 bg-black`, text `text-[9px] tracking-[0.18em] uppercase font-medium text-white`).
- `pointer-events-none` so the tags don't intercept the card-level click.
- The component renders nothing if no tag applies on either side — no empty wrapper, no extra DOM.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard/ProductCardTags.tsx
git commit -m "feat(products): add ProductCardTags component for Sale/Few Left/Sold Out/New Arrival"
```

---

### Task 5: Wire `ProductCardTags` into `ProductCard` and apply grey-out

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard/index.tsx`

- [ ] **Step 1: Import `ProductCardTags`**

At the top of the file, alongside the existing imports, add:

```tsx
import ProductCardTags from "./ProductCardTags";
```

- [ ] **Step 2: Replace the desktop hardcoded badge**

Find the existing block (currently lines 62-64):

```tsx
<div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black">
  <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
</div>
```

Replace it with:

```tsx
<ProductCardTags product={product} />
```

- [ ] **Step 3: Replace the mobile-carousel hardcoded badge**

Find the existing block (currently lines 104-106):

```tsx
<div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black pointer-events-none">
  <span className="flex text-[9px] tracking-[0.18em] uppercase font-medium text-white">New Arrival</span>
</div>
```

Replace it with:

```tsx
<ProductCardTags product={product} />
```

- [ ] **Step 4: Apply grey-out to the desktop image container**

Find the desktop image container `<div>` (currently line ~46-57). Its className is:

```tsx
className={`${useMobileCarousel ? "hidden md:block" : ""} relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden group`}
```

Change it to append the grey-out classes when sold out:

```tsx
className={`${useMobileCarousel ? "hidden md:block" : ""} relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden group${product.isSoldOut ? " opacity-60 grayscale" : ""}`}
```

- [ ] **Step 5: Apply grey-out to the mobile-carousel image container**

Find the mobile-carousel image container (currently line ~80). Its className is:

```tsx
className="md:hidden relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden"
```

Change it to:

```tsx
className={`md:hidden relative w-full bg-[#e0e0e0] rounded-sm overflow-hidden${product.isSoldOut ? " opacity-60 grayscale" : ""}`}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard/index.tsx
git commit -m "feat(products): render ProductCardTags and grey out sold-out cards"
```

---

### Task 6: Hide "Add to cart" button when sold out

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard/ProductCardInfo.tsx`

- [ ] **Step 1: Hide the desktop/overlay "Add to cart" button**

In `InfoContent` (the desktop+overlay layout), wrap the button (currently lines 24-27) in a conditional:

Find:

```tsx
<button type="button" onPointerDown={(e) => e.stopPropagation()} className="shrink-0 flex items-center justify-center gap-1.5 px-3 h-7 bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
  <span className="text-[15px] leading-none font-light">+</span>
  <span className="text-[8px] tracking-[0.12em] uppercase font-medium leading-none">Add to cart</span>
</button>
```

Replace with:

```tsx
{!product.isSoldOut && (
  <button type="button" onPointerDown={(e) => e.stopPropagation()} className="shrink-0 flex items-center justify-center gap-1.5 px-3 h-7 bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
    <span className="text-[15px] leading-none font-light">+</span>
    <span className="text-[8px] tracking-[0.12em] uppercase font-medium leading-none">Add to cart</span>
  </button>
)}
```

- [ ] **Step 2: Hide the stacked-mobile "Add to cart" button**

In `StackedMobileContent`, wrap the button (currently lines 82-85) in a conditional:

Find:

```tsx
<button type="button" onPointerDown={(e) => e.stopPropagation()} className="mt-3 w-full flex items-center justify-center gap-2 h-9 bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
  <span className="text-[15px] leading-none font-light">+</span>
  <span className="text-[9px] tracking-[0.15em] uppercase font-medium leading-none">Add to cart</span>
</button>
```

Replace with:

```tsx
{!product.isSoldOut && (
  <button type="button" onPointerDown={(e) => e.stopPropagation()} className="mt-3 w-full flex items-center justify-center gap-2 h-9 bg-black text-white hover:bg-black/80 transition-colors duration-200" aria-label="Add to cart">
    <span className="text-[15px] leading-none font-light">+</span>
    <span className="text-[9px] tracking-[0.15em] uppercase font-medium leading-none">Add to cart</span>
  </button>
)}
```

Notes:
- Card-level click navigation in `ProductCard/index.tsx` is intentionally **not** changed — sold-out cards still navigate to the detail page (Spec, section "Sold-Out Treatment", item 3).
- Size buttons are not changed: when every size is in `soldOutSizes`, the existing strikethrough in `ProductCardInfo` already handles the visual.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard/ProductCardInfo.tsx
git commit -m "feat(products): hide add-to-cart button on sold-out cards"
```

---

### Task 7: Visual smoke test

**Files:** none

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Next.js boots on `http://localhost:3000` (or another port if 3000 is in use).

- [ ] **Step 2: Verify each tag state in the browser**

Navigate to `http://localhost:3000/products` and visually confirm against the Shopify catalog:

- A normal product (not sold out, not on sale, not "new-arrival" tagged, plenty of stock): no tag on either side.
- A product tagged `new-arrival` in Shopify: "NEW ARRIVAL" badge on the **top-right**.
- A product with at least one variant where `compareAtPrice > price`: "SALE" badge on the **top-left**.
- A product with `≤ 3` total inventory across variants and not on sale: "FEW LEFT" badge on the **top-left**.
- A product where every variant is `availableForSale: false`: "SOLD OUT" badge on the **top-right**, image is `opacity-60 grayscale`, no "Add to cart" button on hover (desktop) or stacked layout (mobile), but clicking the card still navigates to the detail page.
- A product that qualifies for both "Sale" and "Few Left": only "SALE" shows (Sale wins).
- A product that qualifies for both "Sold Out" and "New Arrival": only "SOLD OUT" shows (Sold Out wins).

If your live Shopify catalog doesn't currently have a product in each state, temporarily flip variants/tags/inventory in the Shopify admin to test (and restore afterwards).

- [ ] **Step 3: Verify the homepage carousel**

Navigate to `http://localhost:3000/` and scroll to the Featured Products section. Verify the same tag rules and grey-out behavior apply there. (`FeaturedProductsSection` shares the same `ProductCard`, so this is a regression check.)

- [ ] **Step 4: Verify the category and detail pages still work**

- Navigate to `http://localhost:3000/products/apparel`. Cards render correctly, sold-out greys out, tags display.
- Click into any product. Detail page loads (sold-out cards must still be clickable).

- [ ] **Step 5: Stop the dev server and run a final build**

Run: `npm run build`
Expected: Build succeeds, no warnings about the modified files.

- [ ] **Step 6: No commit — this task is verification only**

If the smoke test surfaces any issue, fix it in a new commit referencing the failing case.

---

## Verification Checklist (post-implementation)

- [ ] `npm run build` succeeds.
- [ ] All four tag states render in the right slots with correct priority.
- [ ] Sold-out cards: opacity 60% + grayscale, no Add-to-cart button, click-through still works.
- [ ] No regressions on the homepage carousel, category pages, or product detail pages.
- [ ] No new dependencies added to `package.json`.
