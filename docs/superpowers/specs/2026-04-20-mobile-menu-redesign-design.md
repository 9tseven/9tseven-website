# Mobile Menu Redesign

**Date:** 2026-04-20
**Status:** Draft

## Goal

Rework the mobile menu into a cleaner, list-based layout inspired by the user-provided screenshot while keeping the site's existing dark aesthetic. Add an expandable Shop section that reveals the top-level shop categories inline. Add a cart button to the mobile navbar, placed to the left of the menu button. Extract the Footer's large brand lockup into a reusable component and render it at the bottom of the mobile menu.

## Scope

In scope:
- New file-structure and visuals for `app/components/Navbar/MobileMenu.tsx`
- New mobile navbar actions layout (cart + menu)
- New `BrandLockup` component extracted from `Footer/index.tsx`
- Footer refactored to consume `BrandLockup`

Out of scope:
- Desktop navbar changes
- Cart drawer changes
- Shop data/content changes
- Light-mode treatment for the mobile menu

## Design

### File structure

```
app/components/
  BrandLockup/
    index.tsx              NEW — extracted from Footer
  Navbar/
    MobileMenu.tsx         REWRITTEN
    NavActions.tsx         UPDATED — adds Cart button beside Menu
    constants.ts           UNCHANGED
  Footer/
    index.tsx              UPDATED — consumes <BrandLockup variant="onLight" />
```

### Mobile navbar — `NavActions.tsx`

Replace the single Menu button with a two-button cluster, both `md:hidden`:

- **Cart button** (left): `ShoppingCart` icon from lucide-react, `size={18} strokeWidth={1.5}`. Calls `openCart` from `useCart()`. When `totalQuantity > 0`, overlay a small badge in the top-right of the icon showing the count. Badge: absolutely positioned, ~14px circle, `text-[10px]` bold. Badge background matches the navbar's current text color and badge text uses the opposite, so it flips with the nav theme. Achieved with `bg-current` on the badge wrapper and an inner span with `text-white dark-nav:text-black` — in practice implemented by reading `useNavTheme()` inside `NavActions` and picking `bg-white text-black` on dark nav or `bg-black text-white` on light nav.
- **Gap**: `gap-5` between cart and menu.
- **Menu button** (right): unchanged icon/behavior from current implementation.

Both buttons use the same opacity-on-hover treatment (`opacity-60 hover:opacity-100 transition-opacity duration-200`).

### Mobile menu — `MobileMenu.tsx`

Full-screen overlay, `fixed inset-0 z-50 bg-[#0b0b0b]`, flex column.

**Top bar** (unchanged from current): `h-16 px-6`, `Logo` on the left, close `X` on the right.

**Menu list** (occupies main area, anchored near the top with `pt-4`):
- Rows are top-to-bottom stacked with `border-t border-white/10` on each, and a final `border-b border-white/10` on the last row, producing the full-width dividers from the screenshot.
- Each row: `py-6 px-6`, full-width clickable area.
- Typography: `text-white text-3xl font-light tracking-[0.08em] uppercase`, left-aligned.
- Rows:
  1. **Community** — `<Link href="/community">`
  2. **Mantra** — `<Link href="/about">` (match desktop label)
  3. **Shop** — button that toggles `shopOpen`. Row shows a right-aligned `ChevronDown` (size 16, strokeWidth 1.5) that rotates 180° when open via CSS transition.
     - Expanded sub-list (push-down accordion): animated container below the Shop row, same border divider style continues. Each sub-row: `py-4 pl-10 pr-6`, `text-sm tracking-[0.22em] text-white/55 uppercase`, `border-t border-white/5`. Sub-rows are the 5 top-level entries from `SHOP_MENU`: New Arrivals, Apparel, Accessories, Equipment, All Products. Each is a `<Link>` that navigates to its `href` and closes the menu.

Use `SHOP_MENU` from `Navbar/constants.ts`. The existing `SHOP_LINKS` shim becomes unused and can be deleted.

**Bottom block**:
- `mt-auto pb-10 flex items-center justify-center`.
- Renders `<BrandLockup variant="onDark" />`.

### Accordion mechanics

- `useState` for `shopOpen`.
- Sub-list wrapped in `AnimatePresence` from `motion/react`.
- Motion variants: `initial={{ height: 0, opacity: 0 }}`, `animate={{ height: "auto", opacity: 1 }}`, `exit={{ height: 0, opacity: 0 }}`, `transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}`, with `overflow-hidden` on the wrapper so the height clip works cleanly.
- Closing the menu (via `onClose`) resets `shopOpen` to `false`.
- Chevron rotation: simple Tailwind `transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`.

### Entrance animation

Staggered fade-in per row using motion; rows animate `opacity: 0 → 1` and `x: -16 → 0`, `delay: 0.08 + i * 0.06`, `duration: 0.3`, `ease: "easeOut"`. Applies to top-level rows only; the Shop sub-list animates independently via the accordion.

### BrandLockup component

```tsx
interface BrandLockupProps {
  variant: "onLight" | "onDark";
  className?: string;
}
```

- Root element carries `text-black` (onLight) or `text-white` (onDark).
- `<img src="/Logo/9t7.svg" />` gets the `invert` class only on `onLight` (raw SVG is already light-colored).
- Circles SVG uses `fill="currentColor"` so it inherits the root's text color.
- "9TSEVEN" text inherits `currentColor` via `text-*` on the root.
- Layout: preserve the existing footer proportions — `flex items-center justify-center gap-[4vw] px-[2vw] py-[4vw] overflow-hidden`, with `<img>` at `w-[18vw]`, circles at `w-[11vw]`, text at `text-[13.5vw] font-extrabold leading-none whitespace-nowrap shrink-0 letter-spacing:-0.09em`.
- Accepts `className` for container overrides (padding/size tweaks if MobileMenu needs different scale than Footer).

### Footer refactor

Replace the inline "Big logo" block (lines 66–85 of current `Footer/index.tsx`) with `<BrandLockup variant="onLight" />`. No visual change to the footer.

## Data flow

- `Navbar/index.tsx`: unchanged — still holds `mobileOpen` state and renders `NavActions` + `MobileMenu`.
- `NavActions.tsx`: consumes `useCart()` directly for `openCart` + `totalQuantity`. The `onMenuOpen` prop stays.
- `MobileMenu.tsx`: internal `shopOpen` state, no new props.

## Error handling & edge cases

- `totalQuantity === 0`: cart badge not rendered.
- `totalQuantity > 99`: display `99+` in the badge (keeps width bounded).
- Body scroll lock: preserve the existing `overflow: hidden` effect on `open`.
- Theme adaptation: `NavActions` relies on the navbar's parent `text-white`/`text-black` class so the cart icon adapts to `useNavTheme()` automatically. Badge uses `bg-current` with inverted text.
- Accordion height animation uses `overflow-hidden` to prevent content flashing during transition.

## Testing

Manual verification:
- Mobile menu opens/closes cleanly; body scroll is locked while open.
- Tapping Community and Mantra navigates correctly and closes the menu.
- Tapping Shop expands the accordion; the other rows remain visible above (push-down behavior). Chevron rotates. Tapping again collapses.
- Tapping a shop category navigates and closes the menu.
- Cart button on mobile navbar opens the cart drawer. Badge appears when items exist, hides when empty, shows `99+` for large counts.
- Cart icon color adapts to nav theme (dark vs light sections of the site).
- Footer still renders its lockup identically after the refactor.
- `BrandLockup` renders correctly in both `onLight` (footer) and `onDark` (mobile menu) variants.
