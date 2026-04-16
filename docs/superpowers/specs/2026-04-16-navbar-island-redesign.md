# Navbar Island Redesign

**Date:** 2026-04-16
**Status:** Approved

---

## Overview

Redesign the desktop navbar so navigation links live inside a centered dark "dynamic island" pill, with the logo remaining fixed top-left outside it. The existing shop dropdown is replaced by a two-column floating panel with animated right-column content that changes based on which category is hovered.

---

## Layout

- **Logo**: Fixed `top-left`, outside and independent of the island. No change to existing `Logo` component.
- **Island**: Horizontally centered on desktop. Contains: `Community`, `About Us`, `Shop` (with chevron), a vertical divider, and the cart icon.
- **Background**: `rgba(18, 18, 18, 0.85)` with `backdrop-filter: blur(16px)`. Border-radius `9999px` (full pill). The island is **always dark** regardless of the page's light/dark theme — it does not adapt to `isDark`. The `isDark` prop continues to control the logo and page text color only.
- **Mobile**: No change — existing `MobileMenu` is untouched.

---

## Island Hover Behaviour

- Nav links sit at ~65% opacity at rest.
- On hover: opacity → 100%, a pill-shaped background (`rgba(255,255,255,0.11)`) appears behind the hovered item using Framer Motion `layoutId` (existing pattern).
- The pill slides between items as the cursor moves — same spring animation already in `DesktopNav.tsx`.

---

## Shop Dropdown — Structure

The dropdown appears as a **separate floating panel** 6px below the island (not merged/connected).

### Panel styling
- Same dark frosted-glass as the island: `rgba(18, 18, 18, 0.92)`, `backdrop-filter: blur(16px)`.
- `border-radius: 18px`.
- `box-shadow: 0 16px 40px rgba(0,0,0,0.35)`.
- Horizontally centered below the island.
- Panel entrance: fade-in + subtle scale-up (`scale: 0.97 → 1`) over ~150ms.
- Panel exit: fade-out over ~100ms.

### Left column — categories
Links: `New Arrivals`, `Apparel`, `Accessories`, `Equipment`, `All Products`.

- Each item uses the same pill-hover pattern as the island (Framer Motion `layoutId: "dropdown-pill"`).
- Hovered item: full white text + `rgba(255,255,255,0.09)` pill background.
- A right-border divider (`rgba(255,255,255,0.07)`) separates the two columns.

### Right column — two states

The right column content changes depending on which left-column item is hovered. Transition between states: fade-out old content, fade-in new content (~120ms each), optionally with a small `x: -6px → 0` slide-in.

**State A — Category links** (Apparel, Accessories, Equipment):
- A small label at top showing the category name.
- 3 subcategory links: e.g. `Apparel_01`, `Apparel_02`, `Apparel_03`.
- Links use same opacity/hover style as left column.

**State B — Product previews** (New Arrivals, All Products):
- 3 product preview cards arranged in a row.
- Each card: portrait-ratio image placeholder + product name below.
- Placeholder is wired for real product data later (accepts `{ image, name, href }` props).
- Clicking a card navigates to the product page.

---

## Data / Constants

Extend `constants.ts` with a `SHOP_MENU` structure:

```ts
type ShopCategory = {
  label: string;
  href: string;
  type: 'subcategories' | 'products';
  subcategories?: { label: string; href: string }[];
  // products will be fetched dynamically later — placeholder array for now
};
```

Categories with `type: 'products'`: New Arrivals, All Products.
Categories with `type: 'subcategories'`: Apparel, Accessories, Equipment.

---

## Component Changes

| File | Change |
|---|---|
| `DesktopNav.tsx` | Restructure layout: island pill wraps all links + cart. Pill hover uses existing `layoutId` pattern. |
| `ShopDropdown.tsx` | Rewrite: two-column floating panel, animated right column with both states. |
| `constants.ts` | Replace `SHOP_LINKS` with `SHOP_MENU` typed structure. |
| `types.ts` | Add `ShopCategory` type. |
| `index.tsx` | No change needed. |
| `NavActions.tsx` | Cart `Link` is removed — the cart moves into the island. The hamburger button (already `md:hidden`) remains for mobile. |

---

## Animations Summary

| Interaction | Animation |
|---|---|
| Hover nav link | Pill slides via `layoutId="nav-pill"`, spring (stiffness 400, damping 30) |
| Shop dropdown open | `opacity: 0→1`, `scale: 0.97→1`, 150ms ease-out |
| Shop dropdown close | `opacity: 1→0`, 100ms ease-in |
| Hover dropdown category | Pill slides via `layoutId="dropdown-pill"`, same spring |
| Right column content change | Outgoing: `opacity: 1→0, x: 0→6px` 120ms. Incoming: `opacity: 0→1, x: -6px→0` 120ms |

---

## Out of Scope

- Mobile menu: no changes.
- Real product data for preview cards: placeholder only, wired later.
- Subcategory final names: placeholder labels used, replaced by user later.
- `useNavTheme` hook: no changes — light/dark theme prop continues to flow through.
