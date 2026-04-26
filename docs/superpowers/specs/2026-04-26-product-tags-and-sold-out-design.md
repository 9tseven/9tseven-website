# Product Tags & Sold-Out Treatment

## Problem

`ProductCard` currently renders a hardcoded "New Arrival" badge on every card and provides no visual signal for products that are on sale, low in stock, or fully sold out. Customers can't tell availability at a glance from the grid, and the "New Arrival" label is meaningless when it's universal.

## Goals

- Add two new tag states — **Sale** and **Sold Out** — and gate **New Arrival** behind a real signal.
- Leave a clear path to add **Few Left** later, once Shopify exposes inventory counts to the Storefront API token (currently blocked: the public access token does not have `unauthenticated_read_product_inventory`, and grants haven't propagated). Few Left is **deferred**, not removed from the design.
- Grey out sold-out products on the grid while still allowing navigation to the detail page.
- Keep tag visuals identical to the existing "New Arrival" badge styling.
- Drive every state from Shopify data so a content editor never has to touch code to flip a tag (except for the explicit `new-arrival` tag).

## Non-Goals

- Product detail page changes.
- Filtering/sorting by tag state on the category page.
- Restock notifications, waitlists, or any backend write paths.
- Showing more than one tag per side of the card.

## Tag Rules

Each card has two tag slots — top-left and top-right. Each slot displays at most one tag. Within a slot, higher priority wins.

| Slot | Tag | Condition | Priority |
|---|---|---|---|
| Top-right | **Sold Out** | All variants `availableForSale === false` | 1 (wins) |
| Top-right | **New Arrival** | Shopify product `tags` contains `new-arrival` (case-insensitive) | 2 |
| Top-left | **Sale** | Any variant has `compareAtPrice` set and `compareAtPrice > price` | 1 |
| Top-left | **Few Left** *(deferred)* | `Σ quantityAvailable` across variants `≤ 3`, AND not sold out, AND not on sale | 2 |

**Few Left is deferred.** The Storefront API token's `unauthenticated_read_product_inventory` access scope is not currently active. With this scope missing, requesting `quantityAvailable` causes the entire query to fail (not just null out that one field), so we cannot include it. Sold Out, Sale, and New Arrival do not depend on inventory counts and ship now.

When the scope becomes active later, re-enabling Few Left is mechanical:
1. Add `quantityAvailable` to the variant subselection in `app/lib/queries/products.ts`.
2. Add `quantityAvailable: number | null` to `StorefrontVariant`, derive `totalInventory` in `toProduct()`, add `totalInventory: number | null` to `Product`.
3. Add the Few Left branch to `ProductCardTags`.

## Data Layer

### `Product` type

Extend [app/components/FeaturedProductsSection/types.ts](../../../app/components/FeaturedProductsSection/types.ts):

```ts
export type Product = {
  // existing fields…
  compareAtPrice: number | null;
  isSoldOut: boolean;
  isNewArrival: boolean;
};
```

### GraphQL query

Extend each variant node in [app/lib/queries/products.ts](../../../app/lib/queries/products.ts) with:

```graphql
price { amount }
compareAtPrice { amount }
```

`StorefrontVariant` in `types.ts` gains the matching fields:

```ts
type StorefrontVariant = {
  id: string;
  availableForSale: boolean;
  price: { amount: string };
  compareAtPrice: { amount: string } | null;
  selectedOptions: { name: string; value: string }[];
};
```

### `toProduct()` derivations

In `toProduct()`:

```ts
const variants = node.variants.edges.map((e) => e.node);

const isSoldOut = variants.length > 0 && variants.every((v) => !v.availableForSale);

const compareAtPrices = variants
  .map((v) => v.compareAtPrice ? Number(v.compareAtPrice.amount) : null)
  .filter((n): n is number => n !== null && n > 0);
const compareAtPrice = compareAtPrices.length > 0 ? Math.max(...compareAtPrices) : null;

const isNewArrival = node.tags.some((t) => t.toLowerCase() === "new-arrival");
```

`Sale` is detected by comparing `compareAtPrice` to the existing `price` field (`product.price < product.compareAtPrice`).

## Rendering

### `ProductCardTags` component

New file: `app/components/FeaturedProductsSection/ProductCard/ProductCardTags.tsx`.

```tsx
function ProductCardTags({ product }: { product: Product }) {
  const right = product.isSoldOut ? "Sold Out" : product.isNewArrival ? "New Arrival" : null;

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const left = onSale ? "Sale" : null;

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

Styling matches the existing badge exactly: `px-3 py-1.5 bg-black`, text `text-[9px] tracking-[0.18em] uppercase font-medium text-white`. `pointer-events-none` so tags don't intercept the card-level click.

### `ProductCard` integration

In [app/components/FeaturedProductsSection/ProductCard/index.tsx](../../../app/components/FeaturedProductsSection/ProductCard/index.tsx):

- Replace the hardcoded `<div>` at lines 62-64 (desktop image) with `<ProductCardTags product={product} />`.
- Replace the hardcoded `<div>` at lines 104-106 (mobile carousel) with `<ProductCardTags product={product} />`.

## Sold-Out Treatment

When `product.isSoldOut === true`:

1. **Image container greys out.** Add `opacity-60 grayscale` to the desktop image container (line ~47) and the mobile carousel container (line ~80). Conditional via a ternary on `product.isSoldOut`.
2. **"Add to cart" button is hidden.** In [ProductCardInfo.tsx](../../../app/components/FeaturedProductsSection/ProductCard/ProductCardInfo.tsx):
   - Wrap the desktop button (lines 24-27) in `{!product.isSoldOut && (…)}`.
   - Wrap the stacked mobile button (lines 82-85) in `{!product.isSoldOut && (…)}`.
3. **Card click still navigates** to the detail page. No change to `handleClick`.
4. **Size buttons** keep their existing per-size strikethrough behavior — when every size is in `soldOutSizes`, all sizes naturally render as struck-through and disabled.

## Out of Scope

- Tag rendering on the product detail page.
- Per-variant "Few Left" (decided against — too noisy alongside size strikethroughs).
- Visual transitions on tag appearance.
- Restock waitlists.

## Risks / Open Questions

- **Few Left is deferred** until the Shopify Storefront API token gains the `unauthenticated_read_product_inventory` scope. Path back to enabling it is outlined above (3 small additions across 3 files).
- The `new-arrival` Shopify tag is case-insensitive in our check but exact-match on the slug. If a content editor types `New Arrival` (with space) it won't match. Documented behavior, not a defect.
