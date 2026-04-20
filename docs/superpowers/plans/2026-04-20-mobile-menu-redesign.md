# Mobile Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the mobile menu into a clean list layout with a push-down Shop accordion, add a cart button to the mobile navbar, and extract the footer brand lockup into a shared component.

**Architecture:** Extract the footer's big `9t7 + circles + 9TSEVEN` block into a new `BrandLockup` component that takes an `onLight` / `onDark` variant. Footer and the rewritten `MobileMenu` both consume it. `NavActions` grows a cart button beside the menu button. `MobileMenu` replaces its centered typographic list with a full-width bordered row list and an inline push-down accordion for Shop.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS v4, motion/react, lucide-react

**Testing:** No unit test framework is configured. Verification is manual browser testing plus `npm run lint` and `npm run build` at completion. Each task has explicit manual verification steps.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/components/BrandLockup/index.tsx` | Create | Shared `9t7 + circles + 9TSEVEN` lockup with `variant` prop |
| `app/components/Footer/index.tsx` | Modify | Replace inline big-logo block with `<BrandLockup variant="onLight" />` |
| `app/components/Navbar/NavActions.tsx` | Modify | Render Cart button (icon + badge) + Menu button |
| `app/components/Navbar/MobileMenu.tsx` | Modify | Full rewrite: bordered row list, Shop accordion, BrandLockup at bottom |
| `app/components/Navbar/constants.ts` | Modify | Remove deprecated `SHOP_LINKS` shim |

---

## Task 1: Create `BrandLockup` component

**Files:**
- Create: `app/components/BrandLockup/index.tsx`

- [ ] **Step 1: Create the component file**

```tsx
// app/components/BrandLockup/index.tsx

interface BrandLockupProps {
  variant: "onLight" | "onDark";
  className?: string;
}

export default function BrandLockup({ variant, className = "" }: BrandLockupProps) {
  const isLight = variant === "onLight";
  const colorClass = isLight ? "text-black" : "text-white";
  const imgInvert = isLight ? "invert" : "";

  return (
    <div
      className={`flex items-center justify-center gap-[4vw] px-[2vw] py-[4vw] overflow-hidden ${colorClass} ${className}`}
    >
      <img
        src="/Logo/9t7.svg"
        alt="9t7 logo"
        className={`w-[18vw] shrink-0 ${imgInvert} object-contain`}
      />
      <svg viewBox="0 0 163 174" className="w-[11vw] shrink-0" fill="currentColor" aria-hidden="true">
        <circle cx="80.45" cy="87.17" r="7.5" />
        <circle cx="152.70" cy="112.52" r="7.3" />
        <circle cx="124.35" cy="146.22" r="7.6" />
        <circle cx="152.70" cy="68.41" r="7.5" />
        <circle cx="128.64" cy="27.64" r="7.6" />
        <circle cx="10.64" cy="112.52" r="7.6" />
        <circle cx="33.79" cy="146.22" r="7.6" />
        <circle cx="10.64" cy="68.41" r="7.6" />
        <circle cx="30.79" cy="27.81" r="7.6" />
        <circle cx="80.29" cy="9.64" r="7.3" />
        <circle cx="80.29" cy="162.72" r="7.3" />
      </svg>
      <span
        className="text-[13.5vw] font-extrabold leading-none whitespace-nowrap shrink-0"
        style={{ letterSpacing: "-0.09em" }}
      >
        9TSEVEN
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles in isolation**

Run: `npx tsc --noEmit`
Expected: no errors about `BrandLockup`.

- [ ] **Step 3: Commit**

```bash
git add app/components/BrandLockup/index.tsx
git commit -m "feat: add BrandLockup component for reusable 9TSEVEN lockup"
```

---

## Task 2: Refactor Footer to use `BrandLockup`

**Files:**
- Modify: `app/components/Footer/index.tsx`

- [ ] **Step 1: Add the import**

Add at the top of `app/components/Footer/index.tsx`, after the existing imports:

```tsx
import BrandLockup from "../BrandLockup";
```

- [ ] **Step 2: Replace the inline "Big logo" block**

Replace the entire existing block starting with `{/* Big logo */}` through its closing `</div>` (currently lines 66–85) with:

```tsx
      {/* Big logo */}
      <BrandLockup variant="onLight" />
```

- [ ] **Step 3: Start the dev server and manually verify the footer**

Run: `npm run dev`
Navigate to `http://localhost:3000/` and scroll to the footer.
Expected: the big `9t7 + circles + 9TSEVEN` lockup looks identical to before — dark logo, black dots, black "9TSEVEN" text on the light footer.

- [ ] **Step 4: Commit**

```bash
git add app/components/Footer/index.tsx
git commit -m "refactor: use BrandLockup in Footer"
```

---

## Task 3: Update `NavActions` — cart button + menu button

**Files:**
- Modify: `app/components/Navbar/NavActions.tsx`

- [ ] **Step 1: Replace file contents**

Replace the entire contents of `app/components/Navbar/NavActions.tsx` with:

```tsx
"use client";

import { Menu, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useNavTheme } from "./hooks/useNavTheme";

interface NavActionsProps {
  onMenuOpen: () => void;
}

export default function NavActions({ onMenuOpen }: NavActionsProps) {
  const { openCart, totalQuantity } = useCart();
  const theme = useNavTheme();
  const isDark = theme === "dark";

  const badgeBg = isDark ? "bg-white" : "bg-black";
  const badgeText = isDark ? "text-black" : "text-white";
  const badgeLabel = totalQuantity > 99 ? "99+" : String(totalQuantity);

  return (
    <div className="md:hidden flex items-center gap-5">
      <button
        onClick={openCart}
        aria-label={`Open cart, ${totalQuantity} items`}
        className="relative opacity-60 hover:opacity-100 transition-opacity duration-200"
      >
        <ShoppingCart size={18} strokeWidth={1.5} />
        {totalQuantity > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center text-[9px] font-semibold leading-none ${badgeBg} ${badgeText}`}
          >
            {badgeLabel}
          </span>
        )}
      </button>
      <button
        onClick={onMenuOpen}
        aria-label="Open menu"
        className="opacity-60 hover:opacity-100 transition-opacity duration-200"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify the mobile navbar**

With `npm run dev` running, open `http://localhost:3000/` in a mobile viewport (Chrome DevTools → Device Toolbar, iPhone 12 Pro).
Expected:
- Top-right shows `ShoppingCart` icon on the left, `Menu` icon on the right, with visible spacing.
- Icon color matches nav theme (white on dark hero, black on light sections when you scroll).
- No cart badge initially (cart is empty).
- Clicking the cart icon opens the cart drawer.
- Clicking the menu icon opens the existing mobile menu.

- [ ] **Step 3: Verify badge appears when cart has items**

Temporarily set `totalQuantity` to look non-zero: in Chrome devtools, open the cart drawer and click "Add Sample Item" if such control exists. If no sample-add path exists, add a temporary `const totalQuantity = 3;` line just under the `useCart()` destructure to visually confirm, then restore.
Expected: small circular badge in the top-right of the cart icon, showing the count. Badge bg matches theme text color, text is inverted.

- [ ] **Step 4: Commit**

```bash
git add app/components/Navbar/NavActions.tsx
git commit -m "feat: add mobile cart button beside menu button"
```

---

## Task 4: Rewrite `MobileMenu` — bordered list + Shop accordion + BrandLockup

**Files:**
- Modify: `app/components/Navbar/MobileMenu.tsx`

- [ ] **Step 1: Replace file contents**

Replace the entire contents of `app/components/Navbar/MobileMenu.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import BrandLockup from "../BrandLockup";
import { SHOP_MENU } from "./constants";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) setShopOpen(false);
  }, [open]);

  const rowBase =
    "block w-full text-left text-white text-3xl font-light tracking-[0.08em] uppercase py-6 px-6 border-t border-white/10";

  const entrance = (i: number) => ({
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.08 + i * 0.06, duration: 0.3, ease: "easeOut" as const },
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-[#0b0b0b] flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 h-16 shrink-0">
            <Logo onClick={onClose} className="text-white" />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu list */}
          <div className="flex-1 pt-4 flex flex-col">
            <motion.div {...entrance(0)}>
              <Link href="/community" onClick={onClose} className={rowBase}>
                Community
              </Link>
            </motion.div>

            <motion.div {...entrance(1)}>
              <Link href="/about" onClick={onClose} className={rowBase}>
                Mantra
              </Link>
            </motion.div>

            <motion.div {...entrance(2)} className="border-b border-white/10">
              <button
                onClick={() => setShopOpen((v) => !v)}
                aria-expanded={shopOpen}
                className={`${rowBase} flex items-center justify-between`}
              >
                <span>Shop</span>
                <ChevronDown
                  size={20}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {shopOpen && (
                  <motion.div
                    key="shop-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {SHOP_MENU.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        onClick={onClose}
                        className="block py-4 pl-10 pr-6 text-sm tracking-[0.22em] uppercase text-white/55 hover:text-white transition-colors border-t border-white/5"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom lockup */}
          <div className="mt-auto pb-6 flex items-center justify-center">
            <BrandLockup variant="onDark" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Manually verify the mobile menu**

With `npm run dev` running, in a mobile viewport at `http://localhost:3000/`, tap the menu icon.
Expected:
- Full-screen dark overlay slides/fades in.
- Top bar: logo left, X right.
- Three stacked rows with full-width dividers: COMMUNITY, MANTRA, SHOP.
- SHOP row shows a down-chevron on the right.
- Bottom-center: the white `9t7 + circles + 9TSEVEN` lockup.
- Tapping COMMUNITY → navigates to `/community` and closes the menu.
- Re-open menu; tap MANTRA → navigates to `/about` and closes.

- [ ] **Step 3: Verify Shop accordion**

Re-open the menu and tap SHOP.
Expected:
- Chevron rotates 180°.
- Panel expands below with 5 sub-rows: NEW ARRIVALS, APPAREL, ACCESSORIES, EQUIPMENT, ALL PRODUCTS — smaller tracked type, indented, faint dividers.
- COMMUNITY and MANTRA remain visible above (push-down, not replace).
- Tapping SHOP again collapses the panel smoothly.
- Tapping a sub-category navigates and closes the menu.

- [ ] **Step 4: Verify menu close resets Shop state**

Open menu → tap SHOP to expand → tap X to close → re-open menu.
Expected: SHOP is collapsed again (state was reset on close).

- [ ] **Step 5: Commit**

```bash
git add app/components/Navbar/MobileMenu.tsx
git commit -m "feat: redesign mobile menu with bordered list and Shop accordion"
```

---

## Task 5: Remove deprecated `SHOP_LINKS` shim

**Files:**
- Modify: `app/components/Navbar/constants.ts`

- [ ] **Step 1: Verify no other file imports `SHOP_LINKS`**

Run: `grep -rn "SHOP_LINKS" app/`
Expected: no matches (MobileMenu was the only consumer and now uses `SHOP_MENU`).

- [ ] **Step 2: Remove the shim**

Delete these two lines from `app/components/Navbar/constants.ts`:

```ts
/** @deprecated Use SHOP_MENU — this shim exists only until MobileMenu.tsx is migrated */
export const SHOP_LINKS = SHOP_MENU;
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/Navbar/constants.ts
git commit -m "chore: remove deprecated SHOP_LINKS shim"
```

---

## Task 6: Final verification — lint and build

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: passes. Fix any warnings introduced by this work before continuing.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: build completes successfully with no errors.

- [ ] **Step 3: Final manual regression pass**

With `npm run dev` running, verify across the site:
- Desktop navbar (≥ md): unchanged, cart pill still works, Shop dropdown still works.
- Mobile navbar (< md): cart icon + menu icon side by side, both functional.
- Mobile menu: bordered list, Shop accordion push-down works, BrandLockup renders in white at bottom.
- Footer on `/`: BrandLockup renders in black, visually identical to pre-refactor.
- Theme adaptation: scroll the homepage; mobile navbar icons flip between white and black with the section theme transitions.

- [ ] **Step 4: No commit needed — if everything passes, the feature is done.**

---

## Notes for the implementer

- `useNavTheme()` depends on Lenis (`useLenis`). It is already used by `Navbar/index.tsx` via `theme`, so adding it inside `NavActions` is safe — Lenis is initialized globally in `SmoothScroll`.
- `SHOP_MENU` items carry a `type` field (`products` vs `subcategories`) that the desktop dropdown uses. The mobile list ignores `type` and links straight to each top-level `href`, which is intentional per the spec.
- `AnimatePresence initial={false}` on the accordion prevents the sub-panel from animating in on the menu's first mount when `shopOpen` is already false.
- Keep the dev server open during all manual verification steps — the site relies on Lenis smooth scroll and motion/react animations that are easier to feel than to describe.
