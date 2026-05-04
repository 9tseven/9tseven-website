# Editorial Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new sections after `FeaturedProductsSection` on the home page — a three-panel editorial image grid (`HomeImageSection`) and a minimal brand statement (`BrandStatementSection`).

**Architecture:** Each section is a self-contained client/server component in its own folder under `app/components/`. `HomeImageSection` uses vanilla JS event listeners + a `requestAnimationFrame` lerp loop for smooth cursor-Y tracking, plus a CSS `is-hovered` class for image zoom. `BrandStatementSection` is a static server component with no interactivity. Both are added to `app/page.tsx`.

**Tech Stack:** Next.js (App Router), Tailwind CSS, TypeScript, Next.js `<Image>`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `app/components/HomeImageSection/constants.ts` | Panel data (labels, texts, images, hrefs) |
| Create | `app/components/HomeImageSection/index.tsx` | Three-panel image grid with lerp cursor tracking |
| Create | `app/components/BrandStatementSection/index.tsx` | Static brand statement section |
| Modify | `app/globals.css` | CSS for `is-hovered` image zoom + cursor text fade |
| Modify | `app/page.tsx` | Add both sections after `FeaturedProductsSection` |

---

## Task 1: Panel constants

**Files:**
- Create: `app/components/HomeImageSection/constants.ts`

- [ ] **Step 1: Create the constants file**

```ts
// app/components/HomeImageSection/constants.ts

export type Panel = {
  label: string;
  leftText: string;
  rightText: string;
  image: string;
  alt: string;
  href: string;
};

export const PANELS: Panel[] = [
  {
    label: "Our Products",
    leftText: "Shop",
    rightText: "[ View all ]",
    image: "/PhotoSection/photo-section1.jpg",
    alt: "9TSEVEN products",
    href: "/products",
  },
  {
    label: "Our Story",
    leftText: "About",
    rightText: "[ Read more ]",
    image: "/PhotoSection/photo-section4.jpg",
    alt: "Our story",
    href: "/about",
  },
  {
    label: "Our Community",
    leftText: "Social",
    rightText: "[ Instagram ]",
    image: "/PhotoSection/photo-section7.jpg",
    alt: "Our community",
    href: "https://www.instagram.com/9tseven",
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add app/components/HomeImageSection/constants.ts
git commit -m "feat: add HomeImageSection panel constants"
```

---

## Task 2: HomeImageSection hover CSS

These rules can't be expressed in Tailwind because they rely on a JS-toggled class (`is-hovered`) on a parent element.

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append hover rules to globals.css**

Open `app/globals.css` and add at the end:

```css
/* HomeImageSection — image zoom + cursor text fade on hover */
.home-image-panel .home-image-photo {
  transition: transform 0.9s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}
.home-image-panel.is-hovered .home-image-photo {
  transform: scale(1.06);
}
.home-image-panel .home-image-cursor-text {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.home-image-panel.is-hovered .home-image-cursor-text {
  opacity: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add HomeImageSection hover CSS"
```

---

## Task 3: HomeImageSection component

**Files:**
- Create: `app/components/HomeImageSection/index.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/components/HomeImageSection/index.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { PANELS, type Panel } from "./constants";

function ImagePanel({ label, leftText, rightText, image, alt, href }: Panel) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const cursorText = cursorTextRef.current;
    if (!wrapper || !cursorText) return;

    let targetY = 0;
    let currentY = 0;
    let hovering = false;
    let raf = 0;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      currentY = lerp(currentY, targetY, 0.1);
      const h = wrapper!.getBoundingClientRect().height;
      const clamped = Math.max(24, Math.min(currentY, h - 24));
      cursorText!.style.top = `${clamped}px`;
      cursorText!.style.transform = "translateY(-50%)";
      raf =
        hovering || Math.abs(currentY - targetY) > 0.5
          ? requestAnimationFrame(tick)
          : 0;
    }

    function onMouseEnter(e: MouseEvent) {
      const rect = wrapper!.getBoundingClientRect();
      currentY = e.clientY - rect.top;
      targetY = currentY;
      hovering = true;
      wrapper!.classList.add("is-hovered");
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent) {
      targetY = e.clientY - wrapper!.getBoundingClientRect().top;
    }

    function onMouseLeave() {
      hovering = false;
      wrapper!.classList.remove("is-hovered");
    }

    wrapper.addEventListener("mouseenter", onMouseEnter);
    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("mouseleave", onMouseLeave);

    return () => {
      wrapper.removeEventListener("mouseenter", onMouseEnter);
      wrapper.removeEventListener("mousemove", onMouseMove);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="home-image-panel relative overflow-hidden">
      {/* Photo — zoomed by .is-hovered CSS class */}
      <div className="home-image-photo absolute inset-0">
        <Image src={image} alt={alt} fill className="object-cover" />
      </div>

      {/* Centered label — always visible */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] tracking-[0.28em] uppercase text-white/60 z-[3] pointer-events-none whitespace-nowrap">
        {label}
      </span>

      {/* Cursor-tracking text — Y driven by rAF, opacity by CSS */}
      <div
        ref={cursorTextRef}
        className="home-image-cursor-text absolute left-0 right-0 flex justify-between items-center px-[18px] pointer-events-none z-[3]"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        <span className="text-[9px] tracking-[0.28em] uppercase text-white/90">
          {leftText}
        </span>
        <span className="text-[9px] tracking-[0.28em] uppercase text-white/90">
          {rightText}
        </span>
      </div>

      {/* Full-panel link sits on top so the whole panel is clickable */}
      <Link href={href} className="absolute inset-0 z-[4]" aria-label={label} />
    </div>
  );
}

export default function HomeImageSection() {
  return (
    <section
      data-nav-theme="dark"
      className="grid grid-cols-3 gap-[10px] bg-white h-[78vh]"
    >
      {PANELS.map((panel) => (
        <ImagePanel key={panel.label} {...panel} />
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/HomeImageSection/index.tsx
git commit -m "feat: add HomeImageSection with lerp cursor tracking"
```

---

## Task 4: BrandStatementSection component

**Files:**
- Create: `app/components/BrandStatementSection/index.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/components/BrandStatementSection/index.tsx
import Image from "next/image";

export default function BrandStatementSection() {
  return (
    <section
      data-nav-theme="light"
      className="bg-white flex flex-col items-center px-10 pt-[90px] pb-[80px]"
    >
      {/* Brand line */}
      <p className="text-[10px] tracking-[0.22em] uppercase text-black/45 mb-[18px]">
        9TSEVEN©2025
      </p>

      {/* Middle row: Copenhagen | More than running | Denmark */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full mb-5">
        <span className="text-[9px] tracking-[0.28em] uppercase text-black/40">
          Copenhagen
        </span>
        <p className="text-[22px] tracking-[0.12em] uppercase font-light text-black/80 text-center px-8">
          More than running
        </p>
        <span className="text-[9px] tracking-[0.28em] uppercase text-black/40 text-right">
          Denmark
        </span>
      </div>

      {/* Body text */}
      <p className="text-[11px] leading-[1.8] tracking-[0.02em] text-black/45 max-w-[380px] text-center mb-[52px]">
        Rooted in identity, shaped by culture, and driven by community — our
        expression is a reflection of where we come from and where we&apos;re going.
      </p>

      {/* Logo */}
      <Image
        src="/Logo/9t7.svg"
        alt="9TSEVEN"
        width={80}
        height={80}
        className="opacity-25 w-20 h-auto"
      />
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/BrandStatementSection/index.tsx
git commit -m "feat: add BrandStatementSection"
```

---

## Task 5: Wire sections into the home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update app/page.tsx**

Replace the entire file content with:

```tsx
// app/page.tsx
import HeroSection from "./components/HeroSection";
import FeaturedProductsSection from "./components/FeaturedProductsSection";
import HomeImageSection from "./components/HomeImageSection";
import BrandStatementSection from "./components/BrandStatementSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProductsSection />
      <HomeImageSection />
      <BrandStatementSection />
    </main>
  );
}
```

- [ ] **Step 2: Start the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000` and scroll to the bottom of the page. Verify:
- Three equal-width image panels appear after the product carousel
- Hovering a panel: image zooms, label stays centered, cursor-tracking text follows your mouse Y-position and fades in/out
- `BrandStatementSection` renders below: `9TSEVEN©2025` → `Copenhagen / More than running / Denmark` row → body text → faded logo

- [ ] **Step 3: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add HomeImageSection and BrandStatementSection to home page"
```
