# Navbar Island Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop navbar with a centered dark "dynamic island" pill containing all nav links and the cart icon, and rewrite the shop dropdown as a two-column floating panel with animated subcategory/product-preview right column.

**Architecture:** The island pill is rendered inside `DesktopNav` as a `relative hidden md:block` wrapper; the dropdown is absolutely positioned 6px below it. The logo stays in `Navbar/index.tsx` on the left; `NavActions` is stripped to mobile-only (hamburger). Right-column content is driven by `SHOP_MENU` data — subcategory links for Apparel/Accessories/Equipment, product preview placeholders for New Arrivals/All Products.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Framer Motion (`motion/react`), Tailwind CSS 4, Lucide React.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/components/Navbar/types.ts` | Modify | Add `ShopCategory` and `ShopSubcategory` types |
| `app/components/Navbar/constants.ts` | Modify | Replace `SHOP_LINKS` with typed `SHOP_MENU` |
| `app/components/Navbar/NavActions.tsx` | Modify | Remove cart link; mobile hamburger only |
| `app/components/Navbar/index.tsx` | Modify | Stop passing `isDark` to `DesktopNav` |
| `app/components/Navbar/ShopDropdown.tsx` | Rewrite | Two-column floating panel with animated right column |
| `app/components/Navbar/DesktopNav.tsx` | Rewrite | Island pill wrapping all links + cart; simplified pill hover |

---

## Task 1: Update types and data

**Files:**
- Modify: `app/components/Navbar/types.ts`
- Modify: `app/components/Navbar/constants.ts`

- [ ] **Step 1: Replace `types.ts` with the new types**

Full file content:

```ts
export type NavTheme = "dark" | "light";
export type PillStyle = { left: number; width: number; height: number };

export type ShopSubcategory = { label: string; href: string };

export type ShopCategory = {
  label: string;
  href: string;
  type: "subcategories" | "products";
  subcategories?: ShopSubcategory[];
};
```

- [ ] **Step 2: Replace `constants.ts` with typed `SHOP_MENU`**

Full file content:

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
      { label: "Apparel_01", href: "/products/apparel/01" },
      { label: "Apparel_02", href: "/products/apparel/02" },
      { label: "Apparel_03", href: "/products/apparel/03" },
    ],
  },
  {
    label: "Accessories",
    href: "/products/accessories",
    type: "subcategories",
    subcategories: [
      { label: "Accessories_01", href: "/products/accessories/01" },
      { label: "Accessories_02", href: "/products/accessories/02" },
      { label: "Accessories_03", href: "/products/accessories/03" },
    ],
  },
  {
    label: "Equipment",
    href: "/products/equipment",
    type: "subcategories",
    subcategories: [
      { label: "Equipment_01", href: "/products/equipment/01" },
      { label: "Equipment_02", href: "/products/equipment/02" },
      { label: "Equipment_03", href: "/products/equipment/03" },
    ],
  },
  {
    label: "All Products",
    href: "/products",
    type: "products",
  },
];
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/Navbar/types.ts app/components/Navbar/constants.ts
git commit -m "feat: add ShopCategory types and SHOP_MENU data"
```

---

## Task 2: Strip cart from NavActions

**Files:**
- Modify: `app/components/Navbar/NavActions.tsx`

- [ ] **Step 1: Remove the cart `Link` and outer wrapper div**

Full file content:

```tsx
import { Menu } from "lucide-react";

interface NavActionsProps {
  onMenuOpen: () => void;
}

export default function NavActions({ onMenuOpen }: NavActionsProps) {
  return (
    <button
      onClick={onMenuOpen}
      aria-label="Open menu"
      className="md:hidden opacity-60 hover:opacity-100 transition-opacity duration-200"
    >
      <Menu size={18} strokeWidth={1.5} />
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/NavActions.tsx
git commit -m "feat: remove cart from NavActions (moves into island)"
```

---

## Task 3: Update Navbar index to drop isDark prop from DesktopNav

**Files:**
- Modify: `app/components/Navbar/index.tsx`

- [ ] **Step 1: Remove `isDark` prop from the `<DesktopNav>` call**

Change this line:

```tsx
<DesktopNav isDark={isDark} />
```

to:

```tsx
<DesktopNav />
```

The `isDark` const and `theme`/`useNavTheme` stay — they still control the outer `nav` text color.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: error on `DesktopNav` because it still has `isDark` in its interface. That will be fixed in Task 5. For now, this is expected — note it and move on.

---

## Task 4: Rewrite ShopDropdown

**Files:**
- Modify: `app/components/Navbar/ShopDropdown.tsx`

- [ ] **Step 1: Replace the full file**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SHOP_MENU } from "./constants";

interface ShopDropdownProps {
  shopOpen: boolean;
  onShopLinkClick: () => void;
}

export default function ShopDropdown({ shopOpen, onShopLinkClick }: ShopDropdownProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const category = SHOP_MENU[activeCategory];

  return (
    <AnimatePresence>
      {shopOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex bg-[rgba(18,18,18,0.92)] backdrop-blur-md rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          style={{ transformOrigin: "top center" }}
        >
          {/* Left column — categories */}
          <div className="py-2.5 border-r border-white/[0.07]" style={{ minWidth: "150px" }}>
            {SHOP_MENU.map((item, i) => (
              <div key={item.href} className="relative mx-1.5">
                {activeCategory === i && (
                  <motion.div
                    layoutId="dropdown-pill"
                    className="absolute inset-0 rounded-[10px] bg-white/[0.09]"
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  />
                )}
                <Link
                  href={item.href}
                  onClick={onShopLinkClick}
                  onMouseEnter={() => setActiveCategory(i)}
                  className="relative block px-4 py-2 text-[0.6rem] tracking-[0.16em] uppercase text-white/45 hover:text-white transition-colors duration-150 z-10"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right column — subcategories or product previews */}
          <div className="flex-1 overflow-hidden" style={{ minWidth: "170px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.12 }}
              >
                {category.type === "subcategories" ? (
                  <div className="py-2.5">
                    <p className="px-5 pb-2 text-[0.55rem] tracking-[0.18em] uppercase text-white/20">
                      {category.label}
                    </p>
                    {category.subcategories?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onShopLinkClick}
                        className="block mx-1.5 px-4 py-2 text-[0.6rem] tracking-[0.14em] uppercase text-white/55 hover:text-white hover:bg-white/[0.07] rounded-[10px] transition-colors duration-150"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 flex gap-2 items-start">
                    {[1, 2, 3].map((n) => (
                      <Link
                        key={n}
                        href={`${category.href}?product=${n}`}
                        onClick={onShopLinkClick}
                        className="flex-1 flex flex-col gap-1.5 group"
                      >
                        <div className="w-full aspect-[3/4] rounded-lg bg-white/[0.06] border border-dashed border-white/15 flex items-center justify-center group-hover:bg-white/[0.10] transition-colors duration-150">
                          <span className="text-white/20 text-xs">▣</span>
                        </div>
                        <span className="text-[0.5rem] tracking-[0.1em] uppercase text-white/35 text-center group-hover:text-white/60 transition-colors duration-150">
                          Product_0{n}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors only on `DesktopNav` (still has old `isDark` prop and old `ShopDropdown` call). Those are fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/ShopDropdown.tsx
git commit -m "feat: rewrite ShopDropdown as two-column floating panel"
```

---

## Task 5: Rewrite DesktopNav

**Files:**
- Modify: `app/components/Navbar/DesktopNav.tsx`

- [ ] **Step 1: Replace the full file**

```tsx
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ShopDropdown from "./ShopDropdown";
import type { PillStyle } from "./types";

export default function DesktopNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [pill, setPill] = useState<PillStyle | null>(null);

  const islandRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const shopTriggerRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const itemRefs = [communityRef, aboutRef, shopTriggerRef, cartRef];

    if (hoveredIndex === null || !islandRef.current) {
      setPill(null);
      return;
    }

    const el = itemRefs[hoveredIndex]?.current;
    const container = islandRef.current;
    if (!el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    setPill({
      left: elRect.left - containerRect.left,
      width: elRect.width,
      height: elRect.height,
    });
  }, [hoveredIndex]);

  return (
    <div
      className="relative hidden md:block"
      onMouseLeave={() => {
        setHoveredIndex(null);
        setShopOpen(false);
      }}
    >
      {/* Island pill */}
      <div
        ref={islandRef}
        className="relative flex items-center bg-[rgba(18,18,18,0.85)] backdrop-blur-md rounded-full px-1.5 py-1.5 gap-0.5"
      >
        {/* Sliding highlight */}
        <AnimatePresence>
          {pill && (
            <motion.div
              layoutId="nav-pill"
              className="absolute rounded-full pointer-events-none bg-white/[0.11]"
              initial={{ opacity: 0, left: pill.left, width: pill.width, height: pill.height }}
              animate={{ opacity: 1, left: pill.left, width: pill.width, height: pill.height }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
                opacity: { duration: 0.15, type: "tween" },
              }}
            />
          )}
        </AnimatePresence>

        <Link
          ref={communityRef}
          href="/community"
          onMouseEnter={() => { setHoveredIndex(0); setShopOpen(false); }}
          className="relative px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Community
        </Link>

        <Link
          ref={aboutRef}
          href="/about"
          onMouseEnter={() => { setHoveredIndex(1); setShopOpen(false); }}
          className="relative px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          About Us
        </Link>

        <div className="w-px h-3.5 bg-white/10 mx-1 shrink-0" />

        <button
          ref={shopTriggerRef}
          onMouseEnter={() => { setHoveredIndex(2); setShopOpen(true); }}
          className="relative flex items-center gap-1.5 px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Shop
          <ChevronDown
            size={10}
            strokeWidth={1.5}
            className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div className="w-px h-3.5 bg-white/10 mx-1 shrink-0" />

        <Link
          ref={cartRef}
          href="/cart"
          aria-label="Cart"
          onMouseEnter={() => { setHoveredIndex(3); setShopOpen(false); }}
          className="relative px-3 py-2 text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          <ShoppingCart size={14} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Floating dropdown panel */}
      <ShopDropdown
        shopOpen={shopOpen}
        onShopLinkClick={() => { setShopOpen(false); setHoveredIndex(null); }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check — expect clean**

```bash
npx tsc --noEmit
```

Expected: no errors. All tasks are now complete so TypeScript should be fully satisfied.

- [ ] **Step 3: Run linter**

```bash
npm run lint
```

Expected: no errors or warnings related to changed files.

- [ ] **Step 4: Commit**

```bash
git add app/components/Navbar/DesktopNav.tsx app/components/Navbar/index.tsx
git commit -m "feat: rewrite DesktopNav as centered island pill with cart inside"
```

---

## Task 6: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Check default state**

Desktop viewport (≥ 768px). Confirm:
- Logo is top-left, outside the island.
- Dark frosted-glass pill is horizontally centered.
- Links are at ~60% opacity, full white on hover with sliding pill highlight.
- Cart icon is the rightmost item in the island.

- [ ] **Step 3: Check dropdown — category hover**

Hover "Shop" to open dropdown. Then hover "Apparel", "Accessories", "Equipment" in turn. Confirm:
- Floating panel appears below island with 6px gap.
- Left column category pill slides smoothly.
- Right column shows 3 subcategory links with a label (e.g. "APPAREL") at the top.
- Right column content fades/slides when switching categories.

- [ ] **Step 4: Check dropdown — product preview hover**

Hover "New Arrivals" and "All Products". Confirm:
- Right column switches to 3 portrait placeholder cards with "Product_01/02/03" labels.
- Transition from subcategory state to product state animates cleanly.

- [ ] **Step 5: Check mouse-leave**

Move cursor off the island entirely. Confirm dropdown closes and pill fades out.

- [ ] **Step 6: Check mobile**

Narrow viewport (< 768px). Confirm:
- Island is hidden.
- Hamburger button appears (from `NavActions`).
- Mobile menu opens/closes as before.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete navbar island redesign"
```
