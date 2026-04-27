# Navbar Shop Dropdown — Real Functionality

## Goal

Replace the placeholder Shop dropdown with real category routing and live product previews. The dropdown today links to non-functional placeholder paths (`/products/apparel/01`, etc.) and renders three dashed boxes labeled `Product_01..03`. After this change every link routes to a real listing or detail page, and the right-side panel shows the actual featured images of real products.

## Requirements

1. Each left-column entry in the Shop dropdown routes to a working page that fetches the corresponding products from Shopify.
2. Right-side preview panel has two states:
   - **Image previews** (3 product tiles) for `New Arrivals` and `All Products`.
   - **Subcategory list** for `Apparel`, `Accessories`, `Equipment`.
3. Subcategory links on the right side filter the parent category page down to a Shopify tag.
4. Existing product detail route (`/products/<cat>/<handle>`) keeps working — no collision with subcategory URLs.

## Data conventions

Subcategories are modeled as Shopify tags. Slugs are kebab-case.

| Parent       | Subcategory  | Tag slug       |
|--------------|--------------|----------------|
| Apparel      | Tops         | `tops`         |
| Apparel      | Bottoms      | `bottoms`      |
| Apparel      | Activewear   | `running`      |
| Accessories  | Socks        | `socks`        |
| Equipment    | Water Bottle | `water-bottle` |

- Parent categories continue to use Shopify `product_type` (`Apparel`, `Accessories`, `Equipment`).
- New Arrivals continues to use the existing `new-arrival` tag (already detected by `toProduct` in `app/components/FeaturedProductsSection/types.ts`).
- Products that lack the relevant subcategory tag will not appear on the subcategory page. This is the user's responsibility to maintain in Shopify admin.

## Routing

| URL                                  | Behavior                                                                                  |
|--------------------------------------|-------------------------------------------------------------------------------------------|
| `/products`                          | All products. Unchanged.                                                                  |
| `/products/new-arrivals`             | Products with `tag:new-arrival`. **Bug fix** — currently queries `product_type:'New Arrivals'` which returns nothing. |
| `/products/apparel`                  | All products with `product_type:'Apparel'`. Unchanged.                                    |
| `/products/apparel?tag=tops`         | `product_type:'Apparel' AND tag:'tops'`. New filtered view.                               |
| `/products/apparel?tag=bottoms`      | `product_type:'Apparel' AND tag:'bottoms'`.                                               |
| `/products/apparel?tag=running`      | `product_type:'Apparel' AND tag:'running'`.                                               |
| `/products/accessories`              | `product_type:'Accessories'`.                                                             |
| `/products/accessories?tag=socks`    | `product_type:'Accessories' AND tag:'socks'`.                                             |
| `/products/equipment`                | `product_type:'Equipment'`.                                                               |
| `/products/equipment?tag=water-bottle` | `product_type:'Equipment' AND tag:'water-bottle'`.                                      |
| `/products/<cat>/<handle>`           | Product detail. Unchanged.                                                                |

Subcategory URLs use a query parameter rather than a path segment to avoid colliding with the existing `[category]/[handle]` product detail route.

## Dropdown preview data flow

`Navbar/index.tsx` is a server component. It fetches preview data once per request and passes it down to `DesktopNav` → `ShopDropdown` as a `previews` prop.

The fetch is intentionally tiny: 3 newest products with `tag:new-arrival` plus 3 from the full catalog. Per-product fields are limited to `handle`, `title`, `productType`, and `featuredImage { url, altText }` — enough to render a tile and build a detail-page link.

```ts
type PreviewItem = {
  handle: string;
  title: string;
  productType: string;
  image: { url: string; altText: string | null } | null;
};

type NavPreviews = {
  newArrivals: PreviewItem[];
  allProducts: PreviewItem[];
};
```

On Shopify error or empty response the helper returns empty arrays. The dropdown then falls back to the existing dashed-placeholder tiles so a Shopify outage doesn't break the navbar across the site.

## File changes

**Create**

- `app/lib/queries/navPreviews.ts` — `GET_NAV_PREVIEWS` GraphQL query. Lightweight subset of fields (handle, title, productType, featuredImage). Two named queries or one query with two aliased `products` fields — implementation detail for the plan.
- `app/components/Navbar/getNavPreviews.ts` — server-side helper that runs the query through `shopifyClient` and returns `NavPreviews`. Catches errors and returns empty arrays.

**Modify**

- `app/components/Navbar/constants.ts` — replace placeholder subcategory entries with the table above. `Apparel` keeps three subs (Tops/Bottoms/Activewear), `Accessories` and `Equipment` drop to one sub each. Subcategory `href` values use `?tag=<slug>` form.
- `app/components/Navbar/types.ts` — add `PreviewItem` and `NavPreviews` types.
- `app/components/Navbar/index.tsx` — call `getNavPreviews()` server-side; pass `previews` to `DesktopNav`. Verify whether `MobileMenu` needs it (it shows category links only — likely no, but confirm during implementation).
- `app/components/Navbar/DesktopNav.tsx` — accept `previews` prop, forward to `ShopDropdown`.
- `app/components/Navbar/ShopDropdown.tsx` — for `type: "products"` panels, render real tiles using `next/image` with `fill` and `sizes` matching tile width. Each tile links to `/products/<category-slug>/<handle>` where `category-slug` = `productType.toLowerCase().replace(/\s+/g, "-")`. If the relevant previews array is empty, render the existing dashed-placeholder fallback.
- `app/products/[category]/page.tsx`:
  - Accept `searchParams: Promise<{ tag?: string }>` (Next.js promise-style searchParams per `AGENTS.md` note about API differences).
  - When `slug === "new-arrivals"`, query by `tag:'new-arrival'` instead of `product_type:'New Arrivals'`.
  - When `searchParams.tag` is present, append `AND tag:'<tag>'` to the Shopify query string. Use the existing tag value verbatim (kebab-case slug).
  - Marquee text: if filtering by tag, render the tag in upper case with hyphens replaced by spaces (`running` → `RUNNING`); otherwise keep the existing category label behavior.
  - `KNOWN_CATEGORIES` notFound logic stays. Unknown tag values render an empty grid, which is acceptable.

**Not modified**

- `app/products/page.tsx` — All Products page is unchanged.
- `app/products/[category]/[handle]/page.tsx` — product detail route unchanged.

## Out of scope

- Validating subcategory tag values against an allowlist (an unknown tag simply yields an empty grid).
- Caching policy beyond Next's request-deduped fetch — not adding explicit `revalidate` or `cache: "force-cache"` tuning in this change.
- Tests — there are no tests for these areas in the repo today; not adding any unless the user later asks.
- Mobile menu image previews — `MobileMenu` continues to show category links only.
- Standardizing tag conventions in Shopify admin — the user owns the catalog data.

## Acceptance criteria

- Hovering Shop and clicking each left-column entry lands on a page that returns the expected products.
- `/products/new-arrivals` returns the products tagged `new-arrival` (currently returns none).
- Hovering `New Arrivals` shows three real product images linking to product detail pages.
- Hovering `All Products` shows three real product images linking to product detail pages.
- Hovering `Apparel`/`Accessories`/`Equipment` shows the subcategory list; each sub link routes to the parent category page filtered by the corresponding tag.
- The Shopify query for a Shop dropdown render fails gracefully: navbar still renders, dropdown falls back to dashed placeholders.
- Existing product detail pages (`/products/<cat>/<handle>`) continue to work.
