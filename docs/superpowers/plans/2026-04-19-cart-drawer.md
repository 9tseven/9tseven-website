# Cart Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sliding cart drawer to the navbar with a cart item count indicator, using placeholder state shaped to match the Shopify Storefront API.

**Architecture:** A `CartContext` holds all cart state and drawer open/close control. A `CartDrawer` component slides in from the right. The cart button in `DesktopNav` calls `openCart()` from `useCart()` and displays the total item count.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS v4, motion/react, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/context/CartContext.tsx` | Create | Types, placeholder data, context, provider, `useCart()` hook |
| `app/components/Cart/CartDrawer.tsx` | Create | Sliding panel UI — items, subtotal, checkout |
| `app/components/Navbar/DesktopNav.tsx` | Modify | Cart button with `Cart (N) <icon>` label |
| `app/components/Navbar/index.tsx` | Modify | Render `<CartDrawer />` + scroll-lock for cart open state |
| `app/layout.tsx` | Modify | Wrap body with `<CartProvider>` |

---

## Task 1: CartContext — types, state, and hook

**Files:**
- Create: `app/context/CartContext.tsx`

- [ ] **Step 1: Create the file with types and placeholder data**

```tsx
// app/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartLinePrice {
  amount: string;
  currencyCode: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: CartLinePrice;
    product: {
      title: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  };
}

export interface Cart {
  id: string;
  lines: CartLine[];
  cost: {
    subtotalAmount: CartLinePrice;
  };
  checkoutUrl: string;
}

interface CartContextValue {
  cart: Cart;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (merchandise: CartLine["merchandise"], quantity: number) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, quantity: number) => void;
  totalQuantity: number;
}

const PLACEHOLDER_CART: Cart = {
  id: "placeholder-cart-1",
  checkoutUrl: "#",
  lines: [
    {
      id: "line-1",
      quantity: 1,
      merchandise: {
        id: "variant-1",
        title: "FLASH RED/BLACK / 6.5M",
        price: { amount: "270.00", currencyCode: "USD" },
        product: {
          title: "METASPEED EDGE TOKYO - UNISEX",
          featuredImage: null,
        },
      },
    },
    {
      id: "line-2",
      quantity: 2,
      merchandise: {
        id: "variant-2",
        title: "BLACK / 8M",
        price: { amount: "180.00", currencyCode: "USD" },
        product: {
          title: "GEL-KAYANO 31 - MENS",
          featuredImage: null,
        },
      },
    },
  ],
  cost: {
    subtotalAmount: { amount: "630.00", currencyCode: "USD" },
  },
};

function deriveSubtotal(lines: CartLine[]): CartLinePrice {
  const total = lines.reduce(
    (sum, line) => sum + parseFloat(line.merchandise.price.amount) * line.quantity,
    0
  );
  const currencyCode = lines[0]?.merchandise.price.currencyCode ?? "USD";
  return { amount: total.toFixed(2), currencyCode };
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(PLACEHOLDER_CART);
  const [isOpen, setIsOpen] = useState(false);

  const totalQuantity = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addLine = (merchandise: CartLine["merchandise"], quantity: number) => {
    setCart((prev) => {
      const existing = prev.lines.find((l) => l.merchandise.id === merchandise.id);
      const newLines = existing
        ? prev.lines.map((l) =>
            l.merchandise.id === merchandise.id
              ? { ...l, quantity: l.quantity + quantity }
              : l
          )
        : [
            ...prev.lines,
            { id: `line-${Date.now()}`, quantity, merchandise },
          ];
      return { ...prev, lines: newLines, cost: { subtotalAmount: deriveSubtotal(newLines) } };
    });
  };

  const removeLine = (id: string) => {
    setCart((prev) => {
      const newLines = prev.lines.filter((l) => l.id !== id);
      return { ...prev, lines: newLines, cost: { subtotalAmount: deriveSubtotal(newLines) } };
    });
  };

  const updateLine = (id: string, quantity: number) => {
    if (quantity < 1) { removeLine(id); return; }
    setCart((prev) => {
      const newLines = prev.lines.map((l) => (l.id === id ? { ...l, quantity } : l));
      return { ...prev, lines: newLines, cost: { subtotalAmount: deriveSubtotal(newLines) } };
    });
  };

  return (
    <CartContext.Provider value={{ cart, isOpen, openCart, closeCart, addLine, removeLine, updateLine, totalQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`  
Expected: no errors in `app/context/CartContext.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/context/CartContext.tsx
git commit -m "feat: add CartContext with placeholder Shopify-shaped cart state"
```

---

## Task 2: CartDrawer component

**Files:**
- Create: `app/components/Cart/CartDrawer.tsx`

- [ ] **Step 1: Create the CartDrawer component**

```tsx
// app/components/Cart/CartDrawer.tsx
"use client";

import { X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/app/context/CartContext";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeLine, updateLine } = useCart();

  const formatPrice = (amount: string, currencyCode: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(
      parseFloat(amount)
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={closeCart}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] bg-[#0b0b0b] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 shrink-0 border-b border-white/10">
              <span className="text-xs tracking-[0.22em] uppercase text-white">Cart</span>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              {cart.lines.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-white/30">
                    <ShoppingCart size={32} strokeWidth={1} />
                    <span className="text-xs tracking-[0.22em] uppercase">Your cart is empty</span>
                  </div>
                </div>
              ) : (
                cart.lines.map((line) => (
                  <div key={line.id} className="flex gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 shrink-0 bg-white/5 rounded flex items-center justify-center">
                      {line.merchandise.product.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.merchandise.product.featuredImage.url}
                          alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ShoppingCart size={18} strokeWidth={1} className="text-white/20" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <p className="text-xs tracking-[0.14em] uppercase text-white leading-snug">
                        {line.merchandise.product.title}
                      </p>
                      <p className="text-[0.65rem] tracking-[0.14em] text-white/40 uppercase">
                        {line.merchandise.title}
                      </p>
                      <p className="text-xs text-white/60">
                        {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                      </p>

                      {/* Quantity + Remove */}
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateLine(line.id, line.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="text-white/40 hover:text-white transition-colors text-sm leading-none"
                          >
                            −
                          </button>
                          <span className="text-xs text-white/70 tabular-nums">{line.quantity}</span>
                          <button
                            onClick={() => updateLine(line.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                            className="text-white/40 hover:text-white transition-colors text-sm leading-none"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeLine(line.id)}
                          className="text-[0.65rem] tracking-[0.14em] uppercase text-white/30 hover:text-white/70 transition-colors underline underline-offset-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.lines.length > 0 && (
              <div className="shrink-0 border-t border-white/10 px-6 py-6 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs tracking-[0.22em] uppercase text-white/60">Subtotal</span>
                  <span className="text-sm tracking-[0.1em] text-white">
                    {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                  </span>
                </div>
                <p className="text-[0.65rem] tracking-[0.1em] text-white/30 uppercase">
                  Taxes and shipping calculated at checkout
                </p>
                <a
                  href={cart.checkoutUrl}
                  className="w-full bg-white text-black text-xs tracking-[0.22em] uppercase text-center py-4 hover:bg-white/90 transition-colors"
                >
                  Check Out
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`  
Expected: no errors in `app/components/Cart/CartDrawer.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/components/Cart/CartDrawer.tsx
git commit -m "feat: add CartDrawer sliding panel component"
```

---

## Task 3: Update DesktopNav — cart button with count

**Files:**
- Modify: `app/components/Navbar/DesktopNav.tsx`

- [ ] **Step 1: Add `useCart` import and replace the cart Link with a button**

Replace the entire file content with:

```tsx
// app/components/Navbar/DesktopNav.tsx
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ShopDropdown from "./ShopDropdown";
import { useCart } from "@/app/context/CartContext";
import type { PillStyle } from "./types";

export default function DesktopNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [pill, setPill] = useState<PillStyle | null>(null);
  const { openCart, totalQuantity } = useCart();

  const islandRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const shopTriggerRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const itemRefs = [communityRef, aboutRef, shopTriggerRef, cartRef];

    if (hoveredIndex === null || !islandRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div ref={islandRef} className="relative flex items-center bg-[rgba(18,18,18,0.7)] backdrop-blur-md rounded-full px-2 py-2 gap-0.5">
        {/* Sliding highlight */}
        <AnimatePresence>
          {pill && (
            <motion.div
              layoutId="nav-pill"
              className="absolute rounded-full pointer-events-none bg-white/11"
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
          onMouseEnter={() => {
            setHoveredIndex(0);
            setShopOpen(false);
          }}
          className="relative px-4 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Community
        </Link>

        <Link
          ref={aboutRef}
          href="/about"
          onMouseEnter={() => {
            setHoveredIndex(1);
            setShopOpen(false);
          }}
          className="relative px-4 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Mantra
        </Link>

        <button
          ref={shopTriggerRef}
          onMouseEnter={() => {
            setHoveredIndex(2);
            setShopOpen(true);
          }}
          className="relative flex items-center gap-1.5 px-4 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Shop
          <ChevronDown size={10} strokeWidth={1.5} className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
        </button>

        <div className="w-px h-3.5 bg-white/10 mx-1 shrink-0" />

        <button
          ref={cartRef}
          onClick={openCart}
          aria-label={`Open cart, ${totalQuantity} items`}
          onMouseEnter={() => {
            setHoveredIndex(3);
            setShopOpen(false);
          }}
          className="relative flex items-center gap-2 px-3.5 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Cart ({totalQuantity})
          <ShoppingCart size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Invisible bridge — fills the 6 px gap so mouseleave doesn't fire mid-travel */}
      {shopOpen && <div className="absolute left-0 right-0 h-3" style={{ top: "100%" }} />}

      {/* Floating dropdown panel */}
      <ShopDropdown
        shopOpen={shopOpen}
        onShopLinkClick={() => {
          setShopOpen(false);
          setHoveredIndex(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`  
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/DesktopNav.tsx
git commit -m "feat: update cart nav item to open drawer with item count"
```

---

## Task 4: Wire CartProvider and CartDrawer into the app

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/components/Navbar/index.tsx`

- [ ] **Step 1: Wrap layout with CartProvider**

In `app/layout.tsx`, add the import and wrap the body children:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Monsieur_La_Doulaise } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import { CartProvider } from "./context/CartContext";

const openSauceSans = localFont({
  variable: "--font-open-sauce-sans",
  src: [
    { path: "../public/fonts/OpenSauceSans-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-Italic.otf", weight: "400", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-ExtraBoldItalic.otf", weight: "800", style: "italic" },
    { path: "../public/fonts/OpenSauceSans-Black.otf", weight: "900", style: "normal" },
    { path: "../public/fonts/OpenSauceSans-BlackItalic.otf", weight: "900", style: "italic" },
  ],
});

const monsieurLaDoulaise = Monsieur_La_Doulaise({
  variable: "--font-monsieur",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "9TSEVEN",
  description: "More than running",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSauceSans.variable} ${monsieurLaDoulaise.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Navbar />
          <SmoothScroll>{children}</SmoothScroll>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Add CartDrawer to Navbar**

Replace `app/components/Navbar/index.tsx` with:

```tsx
// app/components/Navbar/index.tsx
"use client";

import { useState } from "react";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import NavActions from "./NavActions";
import MobileMenu from "./MobileMenu";
import CartDrawer from "../Cart/CartDrawer";
import { useNavTheme } from "./hooks/useNavTheme";

export default function Navbar() {
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
          <DesktopNav />
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

Note: The `useEffect` scroll lock for `mobileOpen` was removed from `Navbar` — it is no longer needed here because `CartContext` handles its own scroll lock via `useEffect` on `isOpen`, and mobile menu scroll lock should live inside `MobileMenu` itself. Add the following `useEffect` inside `MobileMenu` (after the `open` prop arrives) if it does not already handle scroll locking:

```tsx
// Inside MobileMenu, add if not present:
useEffect(() => {
  document.body.style.overflow = open ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [open]);
```

- [ ] **Step 3: Check MobileMenu for existing scroll lock**

Open `app/components/Navbar/MobileMenu.tsx`. If it does NOT have a `useEffect` for `document.body.style.overflow`, add it:

```tsx
// Add at the top of the MobileMenu function body, after the props destructure:
import { useEffect } from "react";

// Inside MobileMenu({ open, onClose }):
useEffect(() => {
  document.body.style.overflow = open ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [open]);
```

If it already has scroll-lock logic, skip this step.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`  
Expected: no errors

- [ ] **Step 5: Start dev server and manually verify**

Run: `npm run dev`

Check:
1. Navbar shows `Cart (3) 🛒` (2 placeholder items: qty 1 + qty 2 = 3)
2. Clicking the cart button opens the drawer from the right
3. Backdrop click closes the drawer
4. `−` / `+` buttons change quantity; count in navbar updates
5. `Remove` deletes the line
6. When all items removed, empty state shows
7. Subtotal updates when quantities change
8. Body scroll is locked while drawer is open

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/components/Navbar/index.tsx app/components/Navbar/MobileMenu.tsx
git commit -m "feat: wire CartProvider and CartDrawer into app layout"
```
