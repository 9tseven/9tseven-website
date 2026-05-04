# Newsletter Sign-Up Banner

## Goal

Add a closable, top-pinned newsletter sign-up banner whose content comes from a Shopify metaobject. Clicking the banner smooth-scrolls to the newsletter sign-up form in the footer. Closing it persists for the browser session.

## Shopify metaobject

Type: `banner`. Fields:

- `banner_text` — single-line text. The message shown in the banner.
- `close_button` — boolean. When true, the dismiss `×` is rendered. When false, the banner is non-dismissible.

Only the first metaobject of this type is used (`first: 1`).

## Architecture

### Data layer

Follows the existing hero / blog-posts loader pattern.

- `app/lib/queries/banner.ts` — exports the GraphQL query string for `metaobjects(type: "banner", first: 1)`, fetching `id` and the `fields { key value }` shape (no media references).
- `app/lib/banner.ts` — exports `getBanner()` wrapped in `react/cache`. Returns:
  - `{ text: string; closeButton: boolean }` when the metaobject is present and `banner_text` is non-empty.
  - `null` on any Shopify error, missing metaobject, or empty `banner_text`. Errors are logged the same way `getHeroSlides` logs.

### Components

- `app/components/Banner/index.tsx` — server component. Awaits `getBanner()`. If `null`, returns `null`. Otherwise renders `<BannerClient text={…} closeButton={…} />`.
- `app/components/Banner/BannerClient.tsx` — client component. Owns dismiss state, click-to-scroll behavior, and sessionStorage interaction.

### Layout integration (`app/layout.tsx`)

- The layout `await`s `getBanner()` (it's `cache()`-wrapped, so `<Banner />` calling it again is free). The result is used both to render `<Banner />` and to template the pre-hydration script.
- Render `<Banner />` directly above `<Navbar />`, inside `<CartProvider>` and `<SmoothScroll>`.
- A pre-hydration `<script>` in `<head>` (mirroring the existing `loadScreenSeen` pattern) is templated based on whether the banner exists:
  - When `banner` is non-null **and** `sessionStorage.getItem("bannerClosed")` is not set, the script adds `data-banner-open="1"` to `<html>`.
  - When `banner` is null (no metaobject / Shopify error) or sessionStorage says closed, the script does nothing — `<html>` stays without the attribute.
- CSS in `globals.css`: `:root { --banner-h: 0px }` and `html[data-banner-open] { --banner-h: 2.5rem }`. Default is "no banner space"; the attribute opts in. This avoids reserving space when the metaobject is missing.

### Navbar offset (`app/components/Navbar/NavbarClient.tsx`)

- Change the `<nav>`'s `top-0` to `top-[var(--banner-h,0px)]`.
- Add `transition-[top] duration-300` so the navbar smoothly slides up when the banner is dismissed.
- Banner itself is `fixed top-0 left-0 right-0 z-[60]` — above the navbar's `z-50`.

### Newsletter scroll target

Add `id="newsletter"` to the root `<div>` of `app/components/Newsletter/index.tsx`. No other changes to the Newsletter component.

## Banner behavior

### Click to scroll

- The full banner row is a `<button>` element. On click it calls `lenis.scrollTo("#newsletter")` via the `useLenis()` hook from `lenis/react`.
- If `lenis` is unavailable for any reason, fall back to `document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" })`.

### Close

- The `×` is a nested `<button>` rendered only when `closeButton === true`. Its click handler calls `e.stopPropagation()` so the scroll-on-click doesn't also fire.
- On close:
  1. Write `sessionStorage.setItem("bannerClosed", "1")`.
  2. Remove `document.documentElement.dataset.bannerOpen` — the CSS variable falls back to `0px`, the navbar slides up, and the banner element is hidden via local state.
- Banner visibility is driven by local React state initialized on mount from `sessionStorage`. This mirrors the `data-banner-open` attribute the pre-hydration script may have set. The local state controls whether the banner element is rendered.

### Persistence model

- Session-only. `sessionStorage` clears when the browser tab/site session ends, so a new visit shows the banner again.
- The key is the literal string `"bannerClosed"`. There is no per-message versioning — if the merchant changes `banner_text`, users who closed the previous banner will still see the new one only on a new session.

## Styling

Matches the existing dark-on-black aesthetic used elsewhere on the site (Newsletter form, hero subheading conventions).

- Container: `bg-black text-white h-10 flex items-center justify-center`.
- Text: `text-[0.7rem] tracking-[0.14em] uppercase font-semibold`.
- The clickable area uses `cursor-pointer`. No underline.
- Close `×`: positioned absolutely on the right with the same `pr-6 md:pr-10` rhythm the navbar uses. `text-white/80 hover:text-white transition-colors duration-150`. Glyph is a literal `×` (or an inline SVG if visual parity matters — the literal character is acceptable).
- The banner shares the same horizontal padding rhythm as the navbar (`px-6 md:px-10`) so its content aligns visually with the page chrome.

## Edge cases

- **No metaobject / Shopify error:** `getBanner()` returns `null`. `<Banner />` renders nothing. The pre-hydration script does not set `data-banner-open`, so `--banner-h` stays at `0px` and the navbar sits at `top: 0`.
- **`close_button: false`:** No `×` rendered. Banner still scrolls on click. Cannot be dismissed.
- **Pre-hydration flicker:** The pre-hydration script runs synchronously in `<head>` before paint and sets the correct `data-banner-open` attribute, so the navbar renders at the right vertical position from the first paint.
- **Empty `banner_text`:** Treated identically to "no metaobject" — `getBanner()` returns `null`.
- **Multiple banner metaobjects in Shopify:** Only the first is used.

## Out of scope

- Multiple simultaneous banners or rotation between banners.
- Per-page or per-route banner content variations.
- Analytics on banner views, clicks, or dismissals.
- Animations beyond the navbar's `top` transition and the banner's height collapse.
- Localization or per-locale banner text.
- A "reopen banner" affordance after dismissal.
