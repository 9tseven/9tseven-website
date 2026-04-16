# Products Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a products listing page (`/products`, `/products/[category]`) and a minimal product detail page (`/products/[category]/[id]`) with an infinite marquee banner, responsive product grid, and image-swipe detail view.

**Architecture:** Server components handle routing and data lookup from the `PRODUCTS` constant. Client components (`CategoryMarquee`, `ProductsGrid`, `ProductDetailView`) handle interactivity. The existing `ProductCard` is extended with an optional `href` prop so it can navigate on tap without breaking the home-page carousel.

**Tech Stack:** Next.js 16 App Router (params is a `Promise` — must be awaited), React 19, Tailwind CSS v4, Framer Motion (`motion/react`), TypeScript.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/products/components/CategoryMarquee.tsx` | Infinite seamless marquee, non-selectable |
| Create | `app/products/components/ProductsGrid.tsx` | Responsive 2/3-col grid, measures card width, wraps cards |
| Create | `app/products/components/ProductDetailView.tsx` | Image switcher + size selector client UI |
| Create | `app/products/page.tsx` | All-products listing (server) |
| Create | `app/products/[category]/page.tsx` | Category listing (server) |
| Create | `app/products/[category]/[id]/page.tsx` | Product detail (server) |
| Modify | `app/components/FeaturedProductsSection/ProductCard/useImageSlider.ts` | Expose `hasDragged` ref |
| Modify | `app/components/FeaturedProductsSection/ProductCard/index.tsx` | Add `href` prop, navigate on tap |
| Modify | `app/components/FeaturedProductsSection/index.tsx` | "VIEW ALL PRODUCTS" → `<Link>` |

---

## Task 1: CategoryMarquee component

**Files:**
- Create: `app/products/components/CategoryMarquee.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/products/components/CategoryMarquee.tsx
"use client";

interface CategoryMarqueeProps {
  text: string;
}

export default function CategoryMarquee({ text }: CategoryMarqueeProps) {
  // Two identical copies side-by-side. The animation translates -50% so the
  // second copy slides into view exactly where the first ended — zero gap.
  const repeated = Array(12).fill(text).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

  return (
    <div
      className="w-full overflow-hidden bg-white border-b border-black/8 py-4 select-none"
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: "marquee-scroll 20s linear infinite",
          willChange: "transform",
        }}
      >
        {/* Two copies — second picks up where first ends */}
        <span className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black shrink-0 pr-24">
          {repeated}
        </span>
        <span className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black shrink-0 pr-24" aria-hidden="true">
          {repeated}
        </span>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: no TypeScript errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add app/products/components/CategoryMarquee.tsx
git commit -m "feat: add CategoryMarquee component"
```

---

## Task 2: Expose `hasDragged` from `useImageSlider`

The card needs to distinguish a drag gesture from a tap so it can navigate on tap without triggering on drag.

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard/useImageSlider.ts`

- [ ] **Step 1: Add `hasDragged` ref**

Add `const hasDragged = useRef(false);` after the existing refs.

```ts
// After: const isDragModeRef = useRef(false);
const hasDragged = useRef(false);
```

- [ ] **Step 2: Reset on pointer down**

In `handlePointerDown`, add one line after the early-return guards:

```ts
const handlePointerDown = (e: React.PointerEvent) => {
  if (e.pointerType === "touch") return;
  if (!hasMultiple || isDragMode) return;
  hasDragged.current = false; // ← add this line
  e.preventDefault();
  isDragging.current = true;
  dragStartX.current = e.clientX;
  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
};
```

- [ ] **Step 3: Mark as dragged on meaningful movement**

In `handlePointerMove`, after `const delta = e.clientX - dragStartX.current;`:

```ts
const handlePointerMove = (e: React.PointerEvent) => {
  if (!isDragging.current) return;
  const delta = e.clientX - dragStartX.current;
  if (Math.abs(delta) > 8) hasDragged.current = true; // ← add this line
  dragX.set(delta);
  // ...rest unchanged
};
```

- [ ] **Step 4: Export `hasDragged` from the return value**

In the `return` statement at the bottom of the hook, add `hasDragged`:

```ts
return {
  imgIndex,
  hoverIdx,
  isDragMode,
  peekIdx,
  peekDir,
  dragX,
  hasMultiple,
  hasDragged,       // ← add this
  handleCardMouseMove,
  handleCardMouseLeave,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerCancel,
};
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard/useImageSlider.ts
git commit -m "feat: expose hasDragged ref from useImageSlider"
```

---

## Task 3: Add navigation to ProductCard

**Files:**
- Modify: `app/components/FeaturedProductsSection/ProductCard/index.tsx`

- [ ] **Step 1: Add `href` prop and router import**

Add `useRouter` import and extend the props interface:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ← add
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "../constants";
import { useImageSlider } from "./useImageSlider";
import PeekImage from "./PeekImage";
import ProductCardInfo from "./ProductCardInfo";

interface ProductCardProps {
  product: Product;
  cardWidth: number;
  href?: string; // ← add
}
```

- [ ] **Step 2: Wire up navigation on tap**

Destructure `hasDragged` and `href` and add an `onClick` handler to the outer div. Replace the function signature and the opening `<div`:

```tsx
export default function ProductCard({ product, cardWidth, href }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter(); // ← add
  const images = product.images as readonly string[];

  const { imgIndex, hoverIdx, isDragMode, peekIdx, peekDir, dragX, hasMultiple, hasDragged, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel } = useImageSlider({ images, cardWidth });

  return (
    <div
      className="relative shrink-0 bg-[#e0e0e0] rounded-sm overflow-hidden cursor-pointer group"
      style={{ width: cardWidth, aspectRatio: "4 / 5", touchAction: "pan-x pan-y" }}
      onClick={() => {                                       // ← add
        if (href && !hasDragged.current) router.push(href); // ← add
      }}                                                     // ← add
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        handleCardMouseLeave();
      }}
      onMouseMove={handleCardMouseMove}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
```

The rest of the component body is unchanged.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/components/FeaturedProductsSection/ProductCard/index.tsx
git commit -m "feat: add optional href navigation to ProductCard"
```

---

## Task 4: ProductsGrid component

Measures the container width, computes `cardWidth` for the grid columns, and renders `ProductCard` instances with navigation hrefs.

**Files:**
- Create: `app/products/components/ProductsGrid.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/products/components/ProductsGrid.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "../../components/FeaturedProductsSection/ProductCard";
import type { Product } from "../../components/FeaturedProductsSection/constants";

interface ProductsGridProps {
  products: readonly Product[];
}

const GAP = 8; // px gap between cards

export default function ProductsGrid({ products }: ProductsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const w = container.offsetWidth;
      // md breakpoint = 768px: 3 cols; below: 2 cols
      const cols = w >= 768 ? 3 : 2;
      setCardWidth(Math.floor((w - GAP * (cols - 1)) / cols));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  if (products.length === 0) {
    return (
      <p className="text-center text-black/40 text-xs tracking-[0.2em] uppercase py-20">
        No products found
      </p>
    );
  }

  return (
    <div ref={containerRef} className="w-full px-3 py-3">
      <div
        className="grid grid-cols-2 md:grid-cols-3"
        style={{ gap: GAP }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cardWidth={cardWidth}
            href={`/products/${product.category.toLowerCase()}/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/products/components/ProductsGrid.tsx
git commit -m "feat: add ProductsGrid component"
```

---

## Task 5: All-products listing page

**Files:**
- Create: `app/products/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/products/page.tsx
import CategoryMarquee from "./components/CategoryMarquee";
import ProductsGrid from "./components/ProductsGrid";
import { PRODUCTS } from "../components/FeaturedProductsSection/constants";

export default function ProductsPage() {
  return (
    <main className="bg-white min-h-screen pt-16">
      <CategoryMarquee text="ALL PRODUCTS" />

      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
        <button
          type="button"
          className="text-[9px] tracking-[0.2em] uppercase text-black/50 border border-black/20 px-3 py-1.5"
          disabled
        >
          ⇌&nbsp;&nbsp;Filter
        </button>
        <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">
          {PRODUCTS.length} Products
        </span>
      </div>

      <ProductsGrid products={PRODUCTS} />
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/products/page.tsx
git commit -m "feat: add all-products listing page"
```

---

## Task 6: Category listing page

**Files:**
- Create: `app/products/[category]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/products/[category]/page.tsx
import { notFound } from "next/navigation";
import CategoryMarquee from "../components/CategoryMarquee";
import ProductsGrid from "../components/ProductsGrid";
import { PRODUCTS } from "../../components/FeaturedProductsSection/constants";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const filtered = PRODUCTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  // Unknown category (not a known slug and no products) → 404
  const knownCategories = ["apparel", "accessories", "equipment", "new-arrivals"];
  if (!knownCategories.includes(category.toLowerCase()) && filtered.length === 0) {
    notFound();
  }

  const label = category
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");

  return (
    <main className="bg-white min-h-screen pt-16">
      <CategoryMarquee text={label} />

      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
        <button
          type="button"
          className="text-[9px] tracking-[0.2em] uppercase text-black/50 border border-black/20 px-3 py-1.5"
          disabled
        >
          ⇌&nbsp;&nbsp;Filter
        </button>
        <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">
          {filtered.length} Products
        </span>
      </div>

      <ProductsGrid products={filtered} />
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "app/products/[category]/page.tsx"
git commit -m "feat: add category listing page"
```

---

## Task 7: ProductDetailView component

Client component handling image switching (dots + swipe) and size selection.

**Files:**
- Create: `app/products/components/ProductDetailView.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/products/components/ProductDetailView.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "../../components/FeaturedProductsSection/constants";

interface ProductDetailViewProps {
  product: Product;
  backHref: string;
  backLabel: string;
}

export default function ProductDetailView({ product, backHref, backLabel }: ProductDetailViewProps) {
  const router = useRouter();
  const images = product.images as readonly string[];
  const sizes = product.sizes as readonly string[];

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Swipe on mobile
  const dragStart = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const delta = e.clientX - dragStart.current;
    if (delta < -50 && activeIdx < images.length - 1) {
      setActiveIdx((i) => i + 1);
    } else if (delta > 50 && activeIdx > 0) {
      setActiveIdx((i) => i - 1);
    }
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* Image panel */}
      <div
        className="relative w-full md:w-[55%] aspect-[4/5] bg-[#e0e0e0] select-none flex-shrink-0 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <Image
          src={images[activeIdx]}
          alt={product.name}
          fill
          className="object-cover pointer-events-none"
          draggable={false}
          priority
        />

        {/* Image progress dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={() => setActiveIdx(i)}
                className="w-5 h-[2px] transition-opacity duration-150"
                style={{
                  background: "#fff",
                  opacity: i === activeIdx ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="flex-1 flex flex-col gap-6 px-6 md:px-10 py-8 bg-white">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="self-start text-[9px] tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors duration-200"
        >
          ← {backLabel}
        </button>

        {/* Product meta */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-black/30 mb-1">
            {product.category}
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-none">
            {product.name}
          </h1>
          <p className="text-sm text-black/50 mt-2">
            DKK {product.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="h-px bg-black/8" />

        {/* Size selector */}
        <div>
          <p className="text-[8px] tracking-[0.2em] uppercase text-black/30 mb-3">
            Select size
          </p>
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

        {/* Add to cart — placeholder */}
        <button
          type="button"
          className="mt-auto w-full bg-black text-white text-[9px] tracking-[0.25em] uppercase py-4 hover:bg-black/80 transition-colors duration-200"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/products/components/ProductDetailView.tsx
git commit -m "feat: add ProductDetailView component"
```

---

## Task 8: Product detail page

**Files:**
- Create: `app/products/[category]/[id]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/products/[category]/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS } from "../../../components/FeaturedProductsSection/constants";
import ProductDetailView from "../../components/ProductDetailView";

interface ProductDetailPageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { category, id } = await params;

  const product = PRODUCTS.find((p) => String(p.id) === id);

  if (!product) {
    notFound();
  }

  const categoryLabel = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <main className="bg-white min-h-screen pt-16">
      <ProductDetailView
        product={product}
        backHref={`/products/${category}`}
        backLabel={`Back to ${categoryLabel}`}
      />
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "app/products/[category]/[id]/page.tsx"
git commit -m "feat: add product detail page"
```

---

## Task 9: Wire up "VIEW ALL PRODUCTS" on home page

**Files:**
- Modify: `app/components/FeaturedProductsSection/index.tsx`

- [ ] **Step 1: Replace the button with a Link**

Add `import Link from "next/link";` at the top of the file, then replace:

```tsx
// REMOVE this:
<button className="text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors duration-200 border-b border-black/20 pb-px">VIEW ALL PRODUCTS</button>

// REPLACE with:
<Link href="/products" className="text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors duration-200 border-b border-black/20 pb-px">
  VIEW ALL PRODUCTS
</Link>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/FeaturedProductsSection/index.tsx
git commit -m "feat: link VIEW ALL PRODUCTS to /products"
```

---

## Task 10: Manual smoke test

- [ ] **Start dev server**

```bash
npm run dev
```

- [ ] **Check listing pages**

1. Open `http://localhost:3000/products` — marquee shows "ALL PRODUCTS", all 6 cards visible in 3-col grid on desktop / 2-col on mobile, product info panel floats inset from edges.
2. Open `http://localhost:3000/products/apparel` — marquee shows "APPAREL", only apparel products shown.
3. Open `http://localhost:3000/products/accessories` — marquee shows "ACCESSORIES".
4. Open `http://localhost:3000/products/equipment` — marquee shows "EQUIPMENT", 0 products / empty state.
5. Open `http://localhost:3000/products/unknown-slug` — returns 404 page.

- [ ] **Check navigation from grid**

Click a product card on the listing page — should navigate to `/products/[category]/[id]`.

- [ ] **Check detail page**

1. Product name, category, price visible.
2. Size buttons are clickable and highlight the selected size.
3. Image dots switch the active image on click.
4. On mobile, swipe left/right on the image changes the image.
5. "← Back to [Category]" navigates back to the listing page.

- [ ] **Check home page**

"VIEW ALL PRODUCTS" link at bottom of featured products section navigates to `/products`.

- [ ] **Check home carousel unchanged**

Existing featured products section still works — drag/hover image switching, no navigation triggered on drag.

- [ ] **Final commit if any fixes needed, then done.**
