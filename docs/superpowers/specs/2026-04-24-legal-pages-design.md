# Legal / Policy Pages — Design

## Goal

Render five footer-linked content pages (FAQ, Privacy Policy, Return & Exchange, Shipping Policy, Terms of Service) from JSON files in the top-level `policies/` directory using a single, slug-driven dynamic route. Adding or editing a page should only require editing its JSON file.

## Scope

In scope:
- One dynamic route that maps URL slug → `data/<slug>.json` → rendered page
- A shared `PolicyPage` renderer that handles two layout modes: accordion (FAQ) and section list (all others)
- Reuse of the existing product-page accordion visuals, extracted into a shared component

Out of scope:
- CMS integration, MDX, or markdown parsing
- i18n
- FAQ search / filter
- Any schema changes to the five JSON files (they are already unified enough)

## Routing

Single dynamic route: `app/[slug]/page.tsx`.

- `generateStaticParams` returns exactly `['faq', 'privacy', 'returns', 'shipping', 'terms']`. This pins the valid slugs and prevents the route from catching unrelated top-level URLs.
- Unknown slug → `notFound()`.
- `export const dynamic = 'force-static'`. These pages have no runtime inputs.
- Data is loaded via dynamic `import('@/policies/' + slug + '.json')` inside the page component so Next.js tree-shakes correctly.
- `generateMetadata` returns a `title` derived from the JSON `title` field (e.g. `"FAQ – 9TSEVEN"`).

URL / file alignment (already done by the user):
- `/faq` → `policies/faq.json`
- `/privacy` → `policies/privacy.json`
- `/returns` → `policies/returns.json`
- `/shipping` → `policies/shipping.json`
- `/terms` → `policies/terms.json`

Footer links in `app/components/Footer/index.tsx` already use these paths — no changes needed there.

## Data schema

All five JSON files conform to this TypeScript shape:

```ts
type PolicyPage = {
  title: string;
  accordion: boolean;
  lastUpdated?: string;
  intro?: string[];
  items?: FaqItem[];        // only when accordion === true
  sections?: Section[];     // when accordion === false
};

type FaqItem = { question: string; answer: string };

type Section = {
  heading: string;
  paragraphs?: string[];
  note?: string;                        // shipping only
  rates?: ShippingRate[];               // shipping only
  contact?: Record<string, string>;     // privacy, terms
};

type ShippingRate = {
  region: string;
  estimatedDelivery: string;
  standardShipping: string;
};
```

A `PolicyPage` type will live in `app/components/PolicyPage/types.ts` and be imported by both the route and the renderer.

## File structure

```
app/
  [slug]/
    page.tsx              # route handler: slug → JSON → <PolicyPage>
  components/
    PolicyPage/
      index.tsx           # shell: title, lastUpdated, intro, body
      SectionList.tsx     # renders sections[] (non-accordion mode)
      FaqList.tsx         # renders items[] as accordion
      AccordionItem.tsx   # shared accordion row (moved from products)
      types.ts            # PolicyPage, FaqItem, Section, ShippingRate
```

The existing `app/products/components/ProductAccordion/AccordionItem.tsx` moves to `app/components/PolicyPage/AccordionItem.tsx`. The product accordion re-imports it from the new location; its behavior and markup do not change.

## Rendering

`PolicyPage/index.tsx` (server component) receives the loaded JSON and renders:

1. `<h1>` with `title`
2. `lastUpdated` line, if present
3. `intro` paragraphs, if present
4. Body:
   - `accordion === true` → `<FaqList items={items} />`
   - `accordion === false` → `<SectionList sections={sections} />`

`SectionList` iterates sections, rendering for each:
- `<h2>` with `heading`
- Each string in `paragraphs` as a `<p>`
- If `note` is present, a small muted line
- If `rates` is present, a three-column grid (region / estimated delivery / standard shipping)
- If `contact` is present, key/value rows

`FaqList` is a client component (needs `useState` for open/close). It owns an `openIndex: number | null` state and renders one `<AccordionItem>` per item. Only one item can be open at a time (matching the product page behavior).

`AccordionItem` keeps its current visual: `+` / `−` toggle, `text-[10px] tracking-[0.2em] uppercase` title, grid-template-rows height transition, and a thin border between rows.

## Styling

Styling matches the existing site language used across the Footer and product accordion:

- Container: centered, `max-w-3xl`, `px-8`, `py-20` top/bottom padding
- Background: the surrounding page already sets the theme; the policy page itself adds no background. If the page ends up rendering against the main dark body, copy color defaults to `text-white/70` with headings at full opacity.
- Title: large, uppercase, tight tracking (similar scale to other page titles in the site)
- `lastUpdated`: `text-[0.6rem] tracking-widest uppercase` muted
- Section heading: `text-sm uppercase tracking-[0.14em] font-semibold`
- Paragraph: `text-sm leading-relaxed`, vertical spacing between paragraphs via `space-y-4` on the wrapping `<div>`
- Shipping rates: CSS grid (`grid grid-cols-3 gap-4 text-xs`) with column labels above the rows
- Contact block: simple `<dl>` with uppercase labels and normal-case values
- Accordion: identical visuals to the product page

Final color / background calibration is done by running `next dev` and checking the page in the browser alongside the rest of the site.

## Error handling

- Invalid slug: `notFound()` — triggers Next.js 404.
- Missing optional fields (`intro`, `lastUpdated`, `contact`, `rates`, `note`): conditionally rendered; never crash.
- `accordion: true` with no `items`, or `accordion: false` with no `sections`: body renders empty. No validation layer — these are internal data files maintained by the developer, not user input.
- JSON import failure (file missing for a slug that `generateStaticParams` lists): surfaced at build time by Next.js, which is the correct place to catch it.

## Verification

After implementation:
- Visit each of `/faq`, `/privacy`, `/returns`, `/shipping`, `/terms` in `next dev` and confirm content renders correctly.
- Confirm `/faq` shows the accordion behavior (only one item open at a time, +/− toggles correctly).
- Confirm the product page's accordion still works after `AccordionItem` moves.
- Confirm `/some-unknown-slug` returns 404.
- Run `npm run lint` and `npm run build` clean.
