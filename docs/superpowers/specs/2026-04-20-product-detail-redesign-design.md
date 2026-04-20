# Product Detail Page Redesign

## Context

The current product detail page ([ProductDetailView.tsx](../../../app/products/components/ProductDetailView.tsx)) uses a two-panel side-by-side layout: a swipeable image carousel on the left (~55%) and a static info panel on the right (~45%) with product meta, size selector, and Add-to-cart. Users see one image at a time via dots/swipe.

This redesign accomplishes two goals in one pass:

1. Replace the carousel with a scrollable image stack and make the info panel sticky — following the Satisfy Running pattern where users scroll through all product imagery while purchase controls remain anchored.
2. Add an accordion block (Description, Material, Sizing, Shipping) so product detail content has a home.

## Goals

- All product images visible by scrolling, no carousel affordance.
- Purchase controls (name, price, size, Add-to-cart) always reachable while browsing images on desktop and mobile.
- Product detail copy (Description, Material, Sizing) expressed per-product; Shipping shared across all products.
- Implementation stays within existing visual language (tiny uppercase tracking, monochrome, thin `black/8` dividers).

## Non-goals

- No per-image layout metadata (single-column stack only; no mixed grid rows).
- No image zoom, lightbox, or fullscreen viewer.
- No real backend-sourced copy — Shipping is a local constant; Description/Material/Sizing are added inline to `PRODUCTS`.
- No search/filter changes on surrounding product routes.

## Data model

Extend the `PRODUCTS` entries in [app/components/FeaturedProductsSection/constants.ts](../../../app/components/FeaturedProductsSection/constants.ts) with three new optional string fields:

```ts
description?: string
material?: string
sizing?: string
```

Fields are optional because `PRODUCTS` is declared `as const` and forcing every existing entry to provide full copy would be noise. When a field is missing, the accordion renders the section header with a short fallback line (e.g. "Details coming soon.") rather than hiding the section, keeping the info panel visually consistent across products.

For initial population: each existing product gets placeholder copy matching the user-provided example format (a short narrative for `description`; composition + fit lines for `material`; model-height/fit statement for `sizing`).

Shipping content is not per-product. It lives as an exported constant in the accordion folder (see Component structure).

## Layout

### Desktop (≥ md breakpoint)

- Two columns in a flex row, full viewport width.
- **Left column, ~60% width:** vertical stack of all `product.images` rendered as full-width `aspect-[4/5]` tiles, one after another. Page scrolls normally. No carousel state, no dots, no swipe handlers.
- **Right column, ~40% width:** sticky info panel. `position: sticky; top: 64px` (matches existing navbar height), `max-h-[calc(100vh-64px)]`, `overflow-y-auto` so its contents scroll internally if the accordion exceeds viewport height.
- Info panel contents (top to bottom): Back button, category label, product name, price, divider, size selector, Add-to-cart button, divider, accordion block.

### Mobile (< md breakpoint)

Three-section layout, top to bottom:

1. **Images stack** — same vertical full-width stack as desktop.
2. **Sticky bottom info bar** — compact purchase controls. Implementation: the image stack and the bar are siblings inside a wrapper `<div>`; the bar has `position: sticky; bottom: 0` while the wrapper defines the sticky containing block. While the wrapper is on screen the bar is pinned to the viewport bottom; once the user scrolls past the wrapper (into the accordion) the bar un-pins naturally at the bottom of the image stack. Contents: product name + price on one line, size selector row, Add-to-cart button. White background with `border-t border-black/8` and a subtle shadow to lift it from images behind.
3. **Product accordion** — rendered below the bottom bar in normal flow, not sticky.

The Back button overlays the first image on mobile (top-left) to stay reachable without needing additional chrome.

### Shared behavior

- The accordion is the same component in both breakpoints, just mounted in different places (inside the sticky right panel on desktop, below the mobile bottom bar on mobile).
- The size selector is duplicated in the two breakpoint layouts because the mobile bar's compact form diverges from the desktop panel's layout — the selected size state needs to be hoisted to the parent (`ProductDetailView`) so both instances stay in sync.

## Component structure

New folder: `app/products/components/ProductAccordion/`

- **`index.tsx`** — exports `ProductAccordion`. Props: `{ product: Product }`. Owns single-open state via `useState<AccordionSection | null>(null)` where `AccordionSection = "description" | "material" | "sizing" | "shipping"`. Renders four `<AccordionItem>` rows in order.
- **`AccordionItem.tsx`** — presentational. Props: `{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }`. Responsible for the header button, `+`/`−` glyph, and the expand animation.
- **`shippingContent.tsx`** — exports `SHIPPING_CONTENT` as a JSX fragment (allows paragraph breaks and minor formatting without raw HTML).
- **`fallbackContent.ts`** — exports a single `MISSING_CONTENT` string for sections where the product has no data.

Updates to existing files:

- **[app/products/components/ProductDetailView.tsx](../../../app/products/components/ProductDetailView.tsx)** — substantially rewritten. Removes `activeIdx`, `dragStart`, `handlePointerDown`, `handlePointerUp`, the image dots, and the swipe container. Adds breakpoint-aware rendering for the sticky right panel (desktop) vs image stack + sticky bottom bar + accordion (mobile). Hoists `selectedSize` to remain shared between desktop and mobile instances of the size selector.
- **[app/components/FeaturedProductsSection/constants.ts](../../../app/components/FeaturedProductsSection/constants.ts)** — adds the three optional fields to each product entry with placeholder copy.

## Visual treatment

### Accordion

- Header: full-width `<button>`, `py-4`, flex row with `justify-between`. Label on left in `text-[10px] tracking-[0.2em] uppercase text-black/60`. Glyph on right as a single character (`+` when closed, `−` when open) in the same typography.
- Row divider: `h-px bg-black/8` between rows — reuses the existing token already present in the info panel.
- Body: `text-xs text-black/70 leading-relaxed pb-4`. Multi-line content renders as stacked `<p>` tags with `mb-2` between paragraphs.

### Sticky panels

- Desktop right panel: same `bg-white px-6 md:px-10 py-8` treatment as today, now with sticky positioning.
- Mobile bottom bar: `bg-white border-t border-black/8 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]`.

## Animation

Accordion expand/collapse uses the CSS grid-rows trick:

```tsx
<div
  className="grid transition-[grid-template-rows] duration-300 ease-out"
  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
>
  <div className="overflow-hidden">{children}</div>
</div>
```

Pure CSS, handles variable content heights without JS measurement, degrades cleanly if animation is disabled.

## Accessibility

- Accordion headers are `<button type="button">` with `aria-expanded={isOpen}` and `aria-controls={bodyId}`.
- Body element has matching `id={bodyId}` and `role="region"` with `aria-labelledby={headerId}`.
- Sticky bottom bar does not trap focus — it is regular document flow with position sticky.

## Testing

Manual verification against the following:

- Desktop: scroll through images — info panel remains pinned at `top: 64px`; size selection persists; accordion opens/closes with single-open behavior; internal scroll kicks in when all accordion sections open simultaneously on a short viewport.
- Mobile: info bar sticks to viewport bottom during image scroll; docks into place at the bottom of the image stack with accordion following below; size selection in the bottom bar is reflected if the user later resizes the viewport to desktop.
- Missing content: a product without `material`/`sizing`/`description` still renders all four accordion rows; the missing ones show the fallback message.
- Back button: works on both breakpoints, navigates to previous route via `router.back()`.

## Rollout

Single PR. No feature flag. The route `/products/[category]/[id]` is the only consumer; all changes are contained in that route's view plus the new accordion folder and the constants file addition.
