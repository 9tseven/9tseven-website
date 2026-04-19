# Cart Drawer — Design Spec

**Date:** 2026-04-19  
**Status:** Approved

## Overview

Add a sliding cart drawer to the navbar with a cart item count indicator. The implementation uses placeholder state shaped to match the Shopify Storefront API, so wiring up the real API later requires minimal changes.

---

## 1. Data Shape & CartContext

**File:** `app/context/CartContext.tsx`

### Types

```ts
interface CartLinePrice {
  amount: string;       // e.g. "270.00"
  currencyCode: string; // e.g. "USD"
}

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string; // variant title, e.g. "FLASH RED/BLACK / 6.5M"
    price: CartLinePrice;
    product: {
      title: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  };
}

interface Cart {
  id: string;
  lines: CartLine[];
  cost: {
    subtotalAmount: CartLinePrice;
  };
  checkoutUrl: string; // links to Shopify checkout
}
```

### Context value

```ts
interface CartContextValue {
  cart: Cart;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (merchandise: CartLine["merchandise"], quantity: number) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, quantity: number) => void;
  totalQuantity: number; // sum of all line quantities
}
```

### Placeholder seed data

Two hardcoded items matching the screenshot style (running shoes with variant strings and prices). The subtotal is derived from lines on every state update — the same value Shopify would return.

### Future Shopify swap

Replace the `useState` placeholder with calls to:
- `cartCreate` → initialise cart
- `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove` → mutations
- `cart` query → read current state

No changes needed to consumers (`useCart()` API stays the same).

---

## 2. CartDrawer Component

**File:** `app/components/Cart/CartDrawer.tsx`

### Layout

- `fixed right-0 top-0 z-50`, full height, `~420px` wide
- Dark panel: `bg-[#0b0b0b]`
- Semi-transparent backdrop overlay (`fixed inset-0 z-40 bg-black/50`) — click closes drawer
- Slides in from right using `motion` (`x: "100%" → x: 0`), same spring config as existing nav animations

### Header

- `CART` — uppercase, `tracking-[0.18em]`, `text-white`
- X close button (lucide `X`, `size={18} strokeWidth={1.5}`) — right-aligned, `text-white/50 hover:text-white`

### Item list (scrollable)

Per item:
- Product image (placeholder grey box if no URL, square ~64px)
- Product title — `text-xs tracking-[0.18em] uppercase text-white`
- Variant title — `text-xs tracking-[0.18em] text-white/40`
- Price — `text-xs text-white/60`
- Quantity controls: `−` button · count · `+` button (calls `updateLine`)
- `Remove` link (calls `removeLine`) — `text-white/30 hover:text-white/70`

Empty state: centered text `YOUR CART IS EMPTY` with `text-white/30`.

### Footer (pinned to bottom)

- `SUBTOTAL:` label + `$XXX.XX` value — same typography as header
- Divider line `border-white/10`
- `CHECK OUT` button — full width, solid white background, black text, uppercase tracked — links to `cart.checkoutUrl`

---

## 3. DesktopNav Changes

**File:** `app/components/Navbar/DesktopNav.tsx`

- Cart `<Link href="/cart">` → `<button>` calling `openCart()` from `useCart()`
- Label: `Cart (N)` + `<ShoppingCart size={14} strokeWidth={1.5} />`
- `N` = `totalQuantity` from context (sum of all line quantities)
- Always shows `(0)` when empty — keeps the pill highlight layout stable
- `aria-label` updated to `"Open cart, N items"`

---

## 4. Wiring

### `app/layout.tsx`
Wrap children with `<CartProvider>`.

### `app/components/Navbar/index.tsx`
- Render `<CartDrawer />` alongside `<MobileMenu />`
- Body scroll lock already exists for mobile menu; same pattern applied when cart is open (managed inside `CartContext`)

---

## 5. File Summary

| File | Action |
|------|--------|
| `app/context/CartContext.tsx` | Create — context, provider, hook, placeholder data |
| `app/components/Cart/CartDrawer.tsx` | Create — sliding panel UI |
| `app/components/Navbar/DesktopNav.tsx` | Edit — cart button + count label |
| `app/components/Navbar/index.tsx` | Edit — render CartDrawer |
| `app/layout.tsx` | Edit — wrap with CartProvider |

---

## 6. Out of Scope

- Mobile cart access (MobileMenu cart link — separate task)
- Real Shopify Storefront API calls
- Persisting cart to localStorage
- "Add to cart" buttons on product pages (future, uses `addLine` from `useCart()`)
