# Product Detail Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the product detail page's carousel+side-panel layout with a scrollable image stack, sticky purchase controls (right panel on desktop, bottom bar on mobile), and an accordion block for Description, Material, Sizing, and Shipping.

**Architecture:** Two-column flex layout. Left column (~60% desktop, full-width mobile) holds a vertical stack of all product images; on mobile the sticky bottom bar is a sibling of the image stack so it pins to viewport bottom while images scroll, then docks. Right column (~40% desktop, hidden on mobile) is `sticky top-16` and holds product meta, size selector, Add-to-cart, and the accordion. On mobile the accordion lives in the right-column's flex-child position, which stacks below the image column naturally. State: `selectedSize` hoisted to `ProductDetailView` so mobile-bar and desktop-panel size selectors stay in sync.

**Tech Stack:** Next.js 16.2.3, React 19.2.4, Tailwind CSS 4, TypeScript 5. No unit test framework — verification is `npm run lint`, `npm run build`, and manual browser checks against `/products/apparel/0` and other routes.

**Project caveat:** This repo uses Next.js 16 with breaking changes. When uncertain about a Next API, consult `node_modules/next/dist/docs/` as directed by [AGENTS.md](../../../AGENTS.md). All patterns used below (`"use client"`, `next/image`, `useRouter` from `next/navigation`) already exist in [ProductDetailView.tsx](../../../app/products/components/ProductDetailView.tsx) — follow those conventions.

**Design spec:** [docs/superpowers/specs/2026-04-20-product-detail-redesign-design.md](../specs/2026-04-20-product-detail-redesign-design.md)

---

## Task 1: Create accordion content constants

**Files:**
- Create: `app/products/components/ProductAccordion/shippingContent.tsx`
- Create: `app/products/components/ProductAccordion/fallbackContent.ts`

- [ ] **Step 1: Create the `ProductAccordion` folder with the shipping content file**

Path: `app/products/components/ProductAccordion/shippingContent.tsx`

```tsx
import type { ReactNode } from "react";

export const SHIPPING_CONTENT: ReactNode = (
  <>
    <p className="mb-2">
      Orders are processed within 1–2 business days. Standard shipping to Denmark takes 2–4 business days; other EU destinations 3–7 business days.
    </p>
    <p className="mb-2">
      Free shipping on orders over DKK 800 within the EU.
    </p>
    <p>
      Returns accepted within 30 days of receipt for unworn items with original tags. Contact support@9tseven.com to initiate a return.
    </p>
  </>
);
```

- [ ] **Step 2: Create the fallback content file**

Path: `app/products/components/ProductAccordion/fallbackContent.ts`

```ts
export const MISSING_CONTENT = "Details coming soon.";
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new warnings or errors introduced by the new files.

- [ ] **Step 4: Commit**

```bash
git add app/products/components/ProductAccordion/shippingContent.tsx app/products/components/ProductAccordion/fallbackContent.ts
git commit -m "feat: add product accordion content constants"
```

---

## Task 2: Build the `AccordionItem` primitive

**Files:**
- Create: `app/products/components/ProductAccordion/AccordionItem.tsx`

- [ ] **Step 1: Write the component**

Path: `app/products/components/ProductAccordion/AccordionItem.tsx`

```tsx
"use client";

import type { ReactNode } from "react";
import { useId } from "react";

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  const bodyId = useId();
  const headerId = useId();

  return (
    <div className="border-b border-black/8 last:border-b-0">
      <button
        id={headerId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-black/60">{title}</span>
        <span className="text-[10px] text-black/60" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="text-xs text-black/70 leading-relaxed pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new warnings or errors.

- [ ] **Step 3: Commit**

```bash
git add app/products/components/ProductAccordion/AccordionItem.tsx
git commit -m "feat: add AccordionItem primitive"
```

---

## Task 3: Build the `ProductAccordion` container

**Files:**
- Create: `app/products/components/ProductAccordion/index.tsx`

Note: this task depends on `Product` having the `description`, `material`, and `sizing` fields, but it reads them defensively with `??`. TypeScript will not error if the fields are missing from the type yet because of the nullish fallback on an `undefined` field — the fields we access are treated as `string | undefined` when optional. After Task 4 the fields become required on every product; the fallback remains as defensive code.

- [ ] **Step 1: Write the component**

Path: `app/products/components/ProductAccordion/index.tsx`

```tsx
"use client";

import { useState } from "react";
import type { Product } from "../../../components/FeaturedProductsSection/constants";
import AccordionItem from "./AccordionItem";
import { SHIPPING_CONTENT } from "./shippingContent";
import { MISSING_CONTENT } from "./fallbackContent";

type Section = "description" | "material" | "sizing" | "shipping";

interface ProductAccordionProps {
  product: Product;
}

export default function ProductAccordion({ product }: ProductAccordionProps) {
  const [open, setOpen] = useState<Section | null>(null);

  const toggle = (section: Section) => {
    setOpen((current) => (current === section ? null : section));
  };

  return (
    <div className="border-t border-black/8">
      <AccordionItem
        title="Description"
        isOpen={open === "description"}
        onToggle={() => toggle("description")}
      >
        <p>{product.description ?? MISSING_CONTENT}</p>
      </AccordionItem>

      <AccordionItem
        title="Material"
        isOpen={open === "material"}
        onToggle={() => toggle("material")}
      >
        {product.material ? (
          <p className="whitespace-pre-line">{product.material}</p>
        ) : (
          <p>{MISSING_CONTENT}</p>
        )}
      </AccordionItem>

      <AccordionItem
        title="Sizing"
        isOpen={open === "sizing"}
        onToggle={() => toggle("sizing")}
      >
        <p>{product.sizing ?? MISSING_CONTENT}</p>
      </AccordionItem>

      <AccordionItem
        title="Shipping"
        isOpen={open === "shipping"}
        onToggle={() => toggle("shipping")}
      >
        {SHIPPING_CONTENT}
      </AccordionItem>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new warnings or errors. TypeScript may flag `product.description` etc. as not existing on `Product` — if so, this is resolved by Task 4. If lint blocks the commit, proceed to Task 4 first and commit Task 3 after.

- [ ] **Step 3: Commit (defer if lint blocks on missing `Product` fields)**

```bash
git add app/products/components/ProductAccordion/index.tsx
git commit -m "feat: add ProductAccordion container with single-open state"
```

---

## Task 4: Extend `PRODUCTS` with description, material, sizing

**Files:**
- Modify: `app/components/FeaturedProductsSection/constants.ts`

- [ ] **Step 1: Replace the `PRODUCTS` array contents**

Open [app/components/FeaturedProductsSection/constants.ts](../../../app/components/FeaturedProductsSection/constants.ts) and replace the `PRODUCTS` export so each entry gains `description`, `material`, and `sizing` fields. Everything else stays the same.

Replace the existing `PRODUCTS` declaration with:

```ts
export const PRODUCTS = [
  {
    id: 0,
    category: "Apparel",
    name: "Product Name",
    price: 699,
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOutSizes: ["XS", "XL"],
    images: ["/ProductPlaceholder/p1.webp", "/ProductPlaceholder/p3.webp"],
    description:
      "Engineered for performance, constructed from a lightweight blend designed for breathability, moisture management, and to help you perform at your best.",
    material:
      "88% Polyester / 12% Spandex\nRace-ready fit · Minimal seams for comfort",
    sizing:
      "Model is 181cm and is wearing a size M. The product is true to size.",
  },
  {
    id: 1,
    category: "Apparel",
    name: "Product Name",
    price: 699,
    sizes: ["S", "M", "L"],
    soldOutSizes: ["L"],
    images: ["/ProductPlaceholder/p2.webp", "/ProductPlaceholder/p4.webp"],
    description:
      "A lightweight layer built for long miles. Breathable, fast-drying, and designed to move with you.",
    material:
      "92% Recycled Polyester / 8% Elastane\nRelaxed fit · Flatlock seams",
    sizing:
      "Model is 184cm and is wearing a size M. Runs slightly relaxed — size down for a fitted look.",
  },
  {
    id: 2,
    category: "Accessories",
    name: "Product Name",
    price: 499,
    sizes: ["ONE SIZE"],
    soldOutSizes: [],
    images: ["/ProductPlaceholder/p3.webp", "/ProductPlaceholder/p5.webp"],
    description:
      "A minimal accessory refined for daily use. Lightweight, durable, and built to last through season after season.",
    material:
      "100% Cotton Twill\nAdjustable strap · Embroidered logo",
    sizing: "One size. Fully adjustable.",
  },
  {
    id: 3,
    category: "Accessories",
    name: "Product Name",
    price: 499,
    sizes: ["ONE SIZE"],
    soldOutSizes: [],
    images: ["/ProductPlaceholder/p4.webp", "/ProductPlaceholder/p1.webp"],
    description:
      "Designed for the road and the rest day alike. Quiet utility, soft-touch materials, and considered details.",
    material:
      "80% Nylon / 20% Spandex\nFour-way stretch · Reinforced stitching",
    sizing: "One size. Designed to fit most.",
  },
  {
    id: 4,
    category: "Apparel",
    name: "Product Name",
    price: 699,
    sizes: ["XS", "S", "M"],
    soldOutSizes: ["XS"],
    images: ["/ProductPlaceholder/p5.webp", "/ProductPlaceholder/p2.webp"],
    description:
      "A training staple engineered for high-output days. Wicks moisture fast, dries faster, and stays out of the way.",
    material:
      "100% Recycled Polyester\nAthletic fit · Laser-cut ventilation",
    sizing:
      "Model is 178cm and is wearing a size S. Size up for a standard fit.",
  },
  {
    id: 5,
    category: "Accessories",
    name: "Product Name",
    price: 499,
    sizes: ["ONE SIZE"],
    soldOutSizes: [],
    images: ["/ProductPlaceholder/p2.webp", "/ProductPlaceholder/p5.webp"],
    description:
      "A small object, carefully made. Built from materials chosen for longevity over novelty.",
    material:
      "Full-grain leather · Solid brass hardware",
    sizing: "One size.",
  },
] as const;
```

Keep the unchanged lines below the array:

```ts
export type Product = (typeof PRODUCTS)[number];

/** px gap between cards */
export const CARD_GAP = 16;

/** px of the next card that peeks at the right edge */
export const PEEK_AMOUNT = 40;
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no warnings or errors.

- [ ] **Step 3: If Task 3's commit was deferred, commit it now first**

```bash
git add app/products/components/ProductAccordion/index.tsx
git commit -m "feat: add ProductAccordion container with single-open state"
```

- [ ] **Step 4: Commit the data extension**

```bash
git add app/components/FeaturedProductsSection/constants.ts
git commit -m "feat: add description, material, sizing copy to products"
```

---

## Task 5: Rewrite `ProductDetailView` with stacked images and sticky panels

**Files:**
- Modify (full rewrite): `app/products/components/ProductDetailView.tsx`

This task replaces the whole file. The new layout uses a flex row (column on mobile) with two flex children: left holds the image stack plus the mobile sticky bottom bar, right holds the desktop-only header block and the accordion.

- [ ] **Step 1: Replace the full contents of `ProductDetailView.tsx`**

Path: `app/products/components/ProductDetailView.tsx`

```tsx
// app/products/components/ProductDetailView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "../../components/FeaturedProductsSection/constants";
import ProductAccordion from "./ProductAccordion";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const images = product.images as readonly string[];
  const sizes = product.sizes as readonly string[];

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizeSelector = (
    <div>
      <p className="text-[8px] tracking-[0.2em] uppercase text-black/30 mb-3">Select size</p>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            className={`px-4 py-2 text-[9px] tracking-[0.1em] uppercase border transition-colors duration-150 ${
              selectedSize === size
                ? "border-black bg-black text-white"
                : "border-black/20 text-black/60 hover:border-black hover:text-black"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );

  const addToCartButton = (
    <button
      type="button"
      className="w-full bg-black text-white text-[9px] tracking-[0.25em] uppercase py-4 hover:bg-black/80 transition-colors duration-200"
    >
      Add to cart
    </button>
  );

  const priceLabel = `DKK ${product.price.toLocaleString("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="flex flex-col md:flex-row">
      {/* LEFT / TOP column: image stack + mobile sticky bottom bar */}
      <div className="relative w-full md:w-[60%] flex flex-col">
        {/* Back button (mobile only, overlays first image) */}
        <button
          type="button"
          onClick={() => router.back()}
          className="md:hidden absolute top-4 left-4 z-20 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-[9px] tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors duration-200"
        >
          ← Back
        </button>

        {/* Image stack */}
        <div className="flex flex-col">
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative w-full aspect-[4/5] bg-[#e0e0e0]">
              <Image
                src={src}
                alt={`${product.name} — image ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(min-width: 768px) 60vw, 100vw"
              />
            </div>
          ))}
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="md:hidden sticky bottom-0 z-10 bg-white border-t border-black/8 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-tight text-black truncate">
              {product.name}
            </h2>
            <p className="text-xs text-black/60 shrink-0">{priceLabel}</p>
          </div>
          {sizeSelector}
          {addToCartButton}
        </div>
      </div>

      {/* RIGHT / BOTTOM column: desktop sticky info panel + accordion (accordion shows on mobile too) */}
      <div className="w-full md:w-[40%] md:sticky md:top-16 md:self-start md:max-h-[calc(100vh-64px)] md:overflow-y-auto bg-white">
        {/* Desktop-only header block */}
        <div className="hidden md:flex flex-col gap-6 px-6 md:px-10 py-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="self-start px-3 py-1.5 border border-black/20 text-[9px] tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors duration-200"
          >
            ← Back
          </button>

          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-black/30 mb-1">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-none">
              {product.name}
            </h1>
            <p className="text-sm text-black/50 mt-2">{priceLabel}</p>
          </div>

          <div className="h-px bg-black/8" />

          {sizeSelector}

          {addToCartButton}
        </div>

        {/* Accordion — desktop: inside sticky panel; mobile: below sticky bottom bar */}
        <div className="px-6 md:px-10 pb-8 md:pt-0 pt-2">
          <ProductAccordion product={product} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new warnings or errors.

- [ ] **Step 3: Build to verify TypeScript compiles end-to-end**

Run: `npm run build`
Expected: build succeeds. If it fails, read the error — most likely an import path or a missed type reference. Fix and re-run before continuing.

- [ ] **Step 4: Commit**

```bash
git add app/products/components/ProductDetailView.tsx
git commit -m "feat: redesign product detail with stacked images and sticky panels"
```

---

## Task 6: Manual browser verification

No unit tests exist in this project — verification is manual. Run through every case below and fix any issue you find before marking this task complete.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on http://localhost:3000 (or the next available port).

- [ ] **Step 2: Desktop — image stack and sticky right panel**

Open http://localhost:3000/products/apparel/0 in a browser window ≥ 1024px wide.

Verify:
- Left column shows all `product.images` entries stacked vertically, each `aspect-[4/5]`. Product 0 has 2 images; both appear.
- Right column shows Back button, category label ("APPAREL"), product name, price, divider, size selector, Add-to-cart, accordion.
- Scroll the page down. The right panel remains pinned at `top: 64px` until you've scrolled past the full image stack.
- Click each accordion header in turn. Opening one closes the previously open one (single-open behavior).
- With an accordion section open, content animates smoothly via the grid-rows transition (no snap).

- [ ] **Step 3: Desktop — accordion overflow**

In the same window, shrink the browser height to ~600px. Open the Description accordion, then open Shipping without closing Description — since single-open is enforced, only Shipping stays open. Open all four in sequence and confirm the sticky panel's internal `overflow-y-auto` kicks in if content exceeds `max-h-[calc(100vh-64px)]`.

- [ ] **Step 4: Mobile — sticky bottom bar**

Open DevTools → toggle device toolbar → iPhone 14 Pro (or any viewport <768px).

Verify:
- Images stack full-width.
- Back button overlays the top-left of the first image.
- A white bar pinned to the bottom of the viewport shows the product name on the left, price on the right, then the size selector, then Add-to-cart.
- Scroll the page down through the images. The bar remains pinned to the viewport bottom the entire time.
- Continue scrolling past the end of the image stack. The bar un-pins naturally — it should dock at the bottom of the image stack, with the accordion appearing directly beneath it.
- Scroll further: accordion is interactive. Opening a section works the same as desktop.

- [ ] **Step 5: Mobile — size selection persistence**

On mobile viewport, tap size "M" in the sticky bottom bar. Resize the browser up to desktop width. The desktop panel's size selector should already show "M" as selected (state is hoisted to the parent).

- [ ] **Step 6: Missing content fallback**

In DevTools, temporarily edit one product in memory (or comment out `description` in [constants.ts](../../../app/components/FeaturedProductsSection/constants.ts) for one product) and confirm the Description accordion for that product renders "Details coming soon." rather than breaking. Revert any edits before committing.

- [ ] **Step 7: Accessibility check**

Open DevTools → Accessibility pane. Tab through the info panel. Accordion headers are reachable via keyboard; pressing Enter/Space toggles. `aria-expanded` reflects open state on each header.

- [ ] **Step 8: Lint + build one more time**

Run: `npm run lint`
Run: `npm run build`
Expected: both succeed.

- [ ] **Step 9: Final commit (only if any fixes were made during Steps 2–7)**

If no fixes needed, skip this step. Otherwise:

```bash
git add -A
git commit -m "fix: address product detail redesign verification findings"
```

---

## Self-review (already performed; notes for the implementer)

**Spec coverage:** every section of the spec maps to a task — content constants (T1), accordion component (T2/T3), data model (T4), layout (T5), verification (T6).

**Placeholder-free:** every code block is complete. No "TBD," no "add error handling." The only defensive fallback (`?? MISSING_CONTENT`) is intentional and described in T3.

**Type consistency:** the `Section` union in T3 matches the four accordion rows rendered there. `Product` is imported from the same path in both T3 and T5. Path `../../../components/FeaturedProductsSection/constants` in T3 is correct (three levels up from `app/products/components/ProductAccordion/index.tsx` to `app/`).

**Dependency order risk:** T3 references `product.description` which only becomes a typed field in T4. The plan calls this out in T3 Step 2 and offers a deferred-commit path. Executing T3 → T4 back-to-back avoids any lint/build red period in the history.
