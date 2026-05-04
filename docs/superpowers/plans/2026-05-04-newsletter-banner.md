# Newsletter Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a closable, top-pinned newsletter sign-up banner sourced from a Shopify "banner" metaobject. Clicking the banner smooth-scrolls to the newsletter form. Dismissal persists for the browser session.

**Architecture:** Server component (`app/components/Banner/index.tsx`) fetches the metaobject via a cached `getBanner()` loader (mirroring the existing hero / blogPosts pattern) and passes serializable props to a client component (`BannerClient.tsx`) that owns dismiss state and click-to-scroll. The layout awaits the same cached loader to template a pre-hydration script that flips a `data-banner-open` attribute on `<html>`, which a CSS variable (`--banner-h`) reads to drive the navbar's top offset.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, `@shopify/storefront-api-client`, `lenis/react` for smooth scroll.

**Note on testing:** This project has no unit test framework (no jest/vitest, no `test` script). Verification per task is done via `npm run lint`, `npm run build`, and the existing patterns in `app/lib/hero.ts` / `app/lib/blogPosts.ts`. End-to-end manual verification in a real browser via `npm run dev` is in the final task.

---

## File Structure

**Create:**
- `app/lib/queries/banner.ts` — GraphQL query string for the banner metaobject.
- `app/lib/banner.ts` — `getBanner()` cached loader, error-tolerant.
- `app/components/Banner/index.tsx` — server component, calls loader, renders client.
- `app/components/Banner/BannerClient.tsx` — client component, dismiss state + scroll.

**Modify:**
- `app/globals.css` — add `--banner-h` and `[data-banner-open]` rule.
- `app/components/Newsletter/index.tsx` — add `id="newsletter"` to root element.
- `app/components/Navbar/NavbarClient.tsx` — offset top by `var(--banner-h)`, add transition.
- `app/layout.tsx` — await `getBanner()`, render `<Banner />` above `<Navbar />`, template pre-hydration script conditionally.

---

## Task 1: GraphQL query + loader

**Files:**
- Create: `app/lib/queries/banner.ts`
- Create: `app/lib/banner.ts`

- [ ] **Step 1: Create the GraphQL query**

Create `app/lib/queries/banner.ts` with:

```ts
export const GET_BANNER = `
query GetBanner {
  metaobjects(type: "banner", first: 1) {
    edges {
      node {
        id
        fields {
          key
          value
        }
      }
    }
  }
}
`;
```

- [ ] **Step 2: Create the loader**

Create `app/lib/banner.ts` with:

```ts
import { cache } from "react";
import { shopifyClient } from "@/app/lib/shopify";
import { GET_BANNER } from "@/app/lib/queries/banner";

export type Banner = {
  text: string;
  closeButton: boolean;
};

type FieldNode = { key: string; value: string | null };
type BannerResponse = {
  metaobjects: { edges: { node: { id: string; fields: FieldNode[] } }[] };
};

function parseBoolean(value: string | null | undefined): boolean {
  return value === "true";
}

export const getBanner = cache(async (): Promise<Banner | null> => {
  try {
    const { data, errors } = await shopifyClient.request(GET_BANNER);
    if (errors || !data) throw new Error(`Shopify errors: ${JSON.stringify(errors)}`);

    const node = (data as BannerResponse).metaobjects.edges[0]?.node;
    if (!node) return null;

    const fields = Object.fromEntries(node.fields.map((f) => [f.key, f.value]));
    const text = fields.banner_text;
    if (!text) return null;

    return { text, closeButton: parseBoolean(fields.close_button) };
  } catch (err) {
    console.error("[getBanner] Failed to load banner:", err);
    return null;
  }
});
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no errors mentioning the two new files.

- [ ] **Step 4: Commit**

```bash
git add app/lib/queries/banner.ts app/lib/banner.ts
git commit -m "feat(banner): add Shopify metaobject loader for site banner"
```

---

## Task 2: BannerClient component

**Files:**
- Create: `app/components/Banner/BannerClient.tsx`

- [ ] **Step 1: Create the client component**

Create `app/components/Banner/BannerClient.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";

interface BannerClientProps {
  text: string;
  closeButton: boolean;
}

export default function BannerClient({ text, closeButton }: BannerClientProps) {
  const lenis = useLenis();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("bannerClosed") === "1") {
      setClosed(true);
    }
  }, []);

  if (closed) return null;

  const handleScroll = () => {
    const target = document.getElementById("newsletter");
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem("bannerClosed", "1");
    delete document.documentElement.dataset.bannerOpen;
    setClosed(true);
  };

  return (
    <button
      type="button"
      onClick={handleScroll}
      aria-label={`${text} — sign up`}
      className="fixed top-0 left-0 right-0 z-[60] h-10 bg-black text-white flex items-center justify-center px-12 md:px-16 cursor-pointer hover:bg-black/90 transition-colors duration-150"
    >
      <span className="text-[0.7rem] tracking-[0.14em] uppercase font-semibold truncate">
        {text}
      </span>
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close banner"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors duration-150 text-base leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no errors in the new file.

- [ ] **Step 3: Commit**

```bash
git add app/components/Banner/BannerClient.tsx
git commit -m "feat(banner): add BannerClient with dismiss + scroll-to-newsletter"
```

---

## Task 3: Banner server component

**Files:**
- Create: `app/components/Banner/index.tsx`

- [ ] **Step 1: Create the server component**

Create `app/components/Banner/index.tsx` with:

```tsx
import { getBanner } from "@/app/lib/banner";
import BannerClient from "./BannerClient";

export default async function Banner() {
  const banner = await getBanner();
  if (!banner) return null;
  return <BannerClient text={banner.text} closeButton={banner.closeButton} />;
}
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no errors in the new file.

- [ ] **Step 3: Commit**

```bash
git add app/components/Banner/index.tsx
git commit -m "feat(banner): add Banner server component"
```

---

## Task 4: CSS variable for banner height

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add the CSS variable and override**

Edit `app/globals.css`. In the existing `:root { … }` block (currently lines 4-7), add `--banner-h: 0px;`:

```css
:root {
  --background: #0b0b0b;
  --foreground: #e8e4dc;
  --banner-h: 0px;
}
```

Then immediately after the existing `html[data-load-seen] [data-load-screen] { display: none !important; }` rule (currently line 27), add:

```css
html[data-banner-open] {
  --banner-h: 2.5rem;
}

html:not([data-banner-open]) [data-banner] {
  display: none;
}
```

The first rule sets the banner-height variable (read by the navbar). The second rule hides the SSR-rendered `<div data-banner>` whenever `<html>` lacks `data-banner-open` — this is what prevents the hydration flash for returning visitors who dismissed the banner in the same session. The pre-hydration script in Task 7 sets `data-banner-open` synchronously before paint, so the banner is shown or hidden from the first frame without waiting for React hydration.

- [ ] **Step 2: Verify lint and build still parse the CSS**

Run: `npm run lint && npm run build`
Expected: build succeeds. (Tailwind v4 parses globals.css; a malformed rule will fail the build.)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(banner): add --banner-h css variable for navbar offset"
```

---

## Task 5: Anchor on the newsletter form

**Files:**
- Modify: `app/components/Newsletter/index.tsx`

- [ ] **Step 1: Add the id attribute**

In `app/components/Newsletter/index.tsx`, change the root `<div>` (currently line 40):

```tsx
    <div className="px-8 py-16 border-b border-black/10">
```

to:

```tsx
    <div id="newsletter" className="px-8 py-16 border-b border-black/10">
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Newsletter/index.tsx
git commit -m "feat(newsletter): add #newsletter anchor for banner scroll target"
```

---

## Task 6: Navbar top offset

**Files:**
- Modify: `app/components/Navbar/NavbarClient.tsx`

- [ ] **Step 1: Update the nav element's positioning classes**

In `app/components/Navbar/NavbarClient.tsx`, change the `<nav>` (currently line 24):

```tsx
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>
```

to:

```tsx
      <nav className={`fixed left-0 right-0 z-50 transition-[top,color] duration-500 ${isDark ? "text-white" : "text-black"}`} style={{ top: "var(--banner-h, 0px)" }}>
```

The reasoning: Tailwind v4 doesn't reliably consume `top-[var(--banner-h,0px)]` as an arbitrary value because of how it tokenizes the comma; using inline `style` is the most robust way to bind a CSS variable to `top`. The `transition-[top,color]` is the arbitrary-property form (only `top` and `color` are animated on this element — `color` covers the `text-white`/`text-black` swap that the original `transition-colors` was for).

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Navbar/NavbarClient.tsx
git commit -m "feat(navbar): offset top by --banner-h to make room for site banner"
```

---

## Task 7: Layout integration

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Make the layout async, await banner data, template the pre-hydration script**

Replace the entire contents of `app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from "next";
import { Monsieur_La_Doulaise } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import SmoothScroll from "./components/SmoothScroll";
import LoadScreen from "./components/LoadScreen";
import { CartProvider } from "./context/CartContext";
import { getBanner } from "./lib/banner";

function buildPreHydrationScript(hasBanner: boolean): string {
  const bannerLine = hasBanner
    ? "if(!sessionStorage.getItem('bannerClosed'))document.documentElement.dataset.bannerOpen='1';"
    : "";
  return `try{${bannerLine}if(sessionStorage.getItem('loadScreenSeen'))document.documentElement.setAttribute('data-load-seen','1');}catch(e){}`;
}

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

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const banner = await getBanner();
  const preHydrationScript = buildPreHydrationScript(banner !== null);

  return (
    <html lang="en" className={`${openSauceSans.variable} ${monsieurLaDoulaise.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preHydrationScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LoadScreen />
        <SmoothScroll>
          <CartProvider>
            <Banner />
            <Navbar />
            {children}
            <Footer />
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
```

Key changes from the original:
1. `import Banner from "./components/Banner";` and `import { getBanner } from "./lib/banner";` added.
2. `RootLayout` is now `async`.
3. `loadScreenPreHydrationScript` constant replaced by a `buildPreHydrationScript(hasBanner)` function called at request time.
4. `<Banner />` is rendered directly above `<Navbar />` inside `<CartProvider>`.

Because `getBanner()` is wrapped in `cache()`, this `await` and the one inside `<Banner />` deduplicate to a single Shopify request.

- [ ] **Step 2: Verify lint and type-check via build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(layout): wire site banner above navbar with pre-hydration script"
```

---

## Task 8: End-to-end manual verification

**Files:** none (verification only).

This task validates behavior in a real browser. There is no unit test infrastructure in this project — these manual checks are the verification step.

- [ ] **Step 1: Confirm the metaobject exists in Shopify**

Confirm in the Shopify admin that a metaobject of type `banner` exists with a non-empty `banner_text` value and a `close_button` boolean field. If you don't have access, ask the user to confirm.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: server starts on http://localhost:3000.

- [ ] **Step 3: Verify banner renders**

Open http://localhost:3000 in a fresh browser tab (or incognito to ensure empty `sessionStorage`).
Expected:
- Black 40px-tall banner pinned at the very top showing the `banner_text`.
- Navbar sits directly below the banner (not overlapping).
- If `close_button` is `true`, an `×` is visible on the right side of the banner.

- [ ] **Step 4: Verify scroll-to-newsletter on banner click**

Click the banner text (not the `×`).
Expected: page smooth-scrolls to the newsletter sign-up form in the footer (the "Join the Community" section).

- [ ] **Step 5: Verify dismissal behavior**

Click the `×`.
Expected:
- Banner disappears.
- Navbar smoothly slides up to `top: 0`.
- Page hero shifts up accordingly.

Reload the page (same tab).
Expected: banner does NOT reappear; navbar stays at `top: 0`. No visible flash of the banner during reload.

- [ ] **Step 6: Verify session boundary**

Close the tab and open http://localhost:3000 in a new browser session (incognito or after clearing sessionStorage).
Expected: banner reappears.

- [ ] **Step 7: Verify graceful degradation**

In the Shopify admin, temporarily clear `banner_text` (or delete the metaobject), then reload. Restore it after.
Expected: no banner renders; navbar sits at `top: 0` with no layout artifacts.

(If you can't modify the metaobject, skip this step and note it in the report.)

- [ ] **Step 8: Verify `close_button: false` mode**

In Shopify admin, set `close_button` to `false` and reload.
Expected: banner renders without the `×`. Clicking the banner still scrolls to newsletter. Reload several times — banner is non-dismissible.

(Skip if you can't modify the metaobject.)

- [ ] **Step 9: Run final lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed cleanly.

- [ ] **Step 10: Final commit (if any cleanup needed)**

If any cleanup commits are needed from manual testing, commit them now. Otherwise this step is a no-op.
