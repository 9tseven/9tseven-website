# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize all color, tracking, motion, and font tokens in `app/globals.css` and migrate every hardcoded usage across the app in one PR.

**Architecture:** Single-pass refactor. Step 1 *adds* the new token set to `globals.css` while leaving the existing tokens in place — both coexist, nothing breaks. Steps 2–7 migrate components area-by-area. Step 8 cleans up inline hex/rgba in `style={...}` props. Step 9 deletes the now-orphan old tokens and verifies no caller is left behind.

**Tech Stack:** Tailwind CSS v4 (`@theme` block in `globals.css`), Next.js 16, TypeScript, React 19.

**Reference spec:** [docs/superpowers/specs/2026-05-05-design-system-design.md](../specs/2026-05-05-design-system-design.md) — defines all token values. This plan applies them.

---

## Migration mapping (used by every task below)

### Color utilities

| Old | New |
|---|---|
| `text-white` | `text-fg` |
| `text-white/70`, `text-white/80`, `text-white/85`, `text-white/90` | `text-fg-muted` |
| `text-white/45`, `text-white/50`, `text-white/55`, `text-white/60` | `text-fg-subtle` |
| `text-white/30`, `text-white/35`, `text-white/40` | `text-fg-faint` |
| `text-white/20`, `text-white/25` | `text-fg-ghost` |
| `text-black` | `text-ink` |
| `text-black/65`, `text-black/70`, `text-black/80` | `text-ink-muted` |
| `text-black/45`, `text-black/50`, `text-black/55`, `text-black/60` | `text-ink-subtle` |
| `text-black/25`, `text-black/30`, `text-black/35`, `text-black/40` | `text-ink-faint` |
| `text-black/20` | `text-ink-ghost` |
| `bg-white/5` | `bg-surface` |
| `bg-white/10`, `bg-white/11`, `bg-white/15` | `bg-surface-hover` |
| `bg-white/80`, `bg-white/90`, `bg-white/95` | keep as `bg-fg/80`, `bg-fg/90`, `bg-fg/95` (scrim) |
| `bg-black/3`, `bg-black/4`, `bg-black/5`, `bg-black/8` | `bg-tint` |
| `bg-black/10`, `bg-black/15` | `bg-tint-hover` |
| `bg-black/20` | `bg-tint-strong` |
| `bg-black/30`, `bg-black/40`, `bg-black/60`, `bg-black/75`, `bg-black/80` | keep as `bg-bg/30`, `bg-bg/40`, etc. (scrim) |
| `bg-white` (no opacity) | judgment: `bg-paper` if it's the warm-light surface (`#e8e4dc`-feeling area); `bg-fg` if it's pure white |
| `bg-black` (no opacity) | judgment: `bg-bg` if it's the page background; `bg-ink` if it's a dark card on a light page |
| `border-white/5`, `border-white/10` | `border-edge` |
| `border-white/50`, `border-white` | `border-edge-strong` |
| `border-black/8`, `border-black/10` | `border-ink/10` |
| `border-black/20` | `border-ink/20` |
| `border-black/40`, `border-black` | `border-ink/40`, `border-ink` |

### Tracking

| Old | New |
|---|---|
| `tracking-[-0.05em]`, `tracking-[-0.01em]`, `tracking-tight` | `tracking-tight` |
| `tracking-[0.08em]`, `tracking-[0.14em]` | `tracking-label` |
| `tracking-[0.18em]`, `tracking-[0.2em]`, `tracking-[0.22em]`, `tracking-[0.25em]`, `tracking-wide`, `tracking-widest` | `tracking-eyebrow` |
| `tracking-[0.28em]` | `tracking-display` |

### Motion

| Old | New |
|---|---|
| `duration-150` | `duration-fast` |
| `duration-200` | `duration-base` |
| `duration-300`, `duration-400`, `duration-500` | `duration-slow` |

### Fonts

| Old | New |
|---|---|
| `font-[var(--font-open-sauce-sans)]` | `font-sans` |
| `font-[var(--font-monsieur)]` | `font-display` |

### Inline `style={...}` and CSS hex/rgba

| Old | New |
|---|---|
| `#0b0b0b` | `var(--color-bg)` |
| `#ffffff` | `var(--color-fg)` |
| `#e0e0e0` | `var(--color-fg-faint)` (judge per site — sometimes `var(--color-paper)`) |
| `rgba(0, 0, 0, 0.06)`, `rgba(0,0,0,0.08)` | `var(--color-tint)` |
| `rgba(0, 0, 0, 0.15)` | `var(--color-tint-hover)` |
| `rgba(0, 0, 0, 0.25)`, `rgba(0,0,0,0.3)`, `rgba(0, 0, 0, 0.3)` | `var(--color-ink-faint)` |
| `rgba(0,0,0,0.4)` | `var(--color-ink-faint)` |
| `rgba(0,0,0,0.85)`, `rgba(0,0,0,1)` | `var(--color-ink)` |
| `rgba(255, 255, 255, 0.1)` | `var(--color-fg-ghost)` |
| `rgba(255, 255, 255, 0.18)`, `rgba(255, 255, 255, 0.35)` | `var(--color-fg-faint)` |
| `rgba(170, 170, 170, 0.65)`, `rgba(200, 200, 200, 0.75)`, `rgba(230, 230, 230, 0.85)`, `rgba(255,255,255,0.9)`, `rgba(255, 255, 255, 0.95)` | `var(--color-fg-muted)` (these are step values in a manual gradient — collapse to nearest token) |
| `rgba(18,18,18,0.7)`, `rgba(18, 18, 18, 0.7)` | `var(--color-overlay)` |
| `rgb(255 255 255 / 0.07)`, `rgb(255 255 255 / 0.1)`, `rgb(255 255 255 / 0.15)`, etc. | use the `--color-fg-*` / `--color-edge*` token they map to per the spec |
| `rgba(255,255,255,${v})` template strings (dynamic gradient/fade) | **leave as-is** — these are computed gradient stops, not semantic colors |

---

## File structure

- **Modify**: `app/globals.css` — replaces `@theme` block (Tasks 1 and 9).
- **Modify**: ~43 component/page files under `app/` — see per-task file lists below. Each file is touched once during its task.
- **No new files**, no test files (this refactor has no behavior change; verification is build + lint + grep + visual walk).

---

## Task 1: Add new tokens to `globals.css` alongside existing ones

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the `@theme` block**

Open `app/globals.css`. Replace the entire current `@theme { ... }` block (lines 4–33) with this new block, which keeps the old token names as aliases pointing at the new values so nothing breaks until cleanup in Task 9.

```css
@theme {
  /* ── Background base ───────────────────────────────────────────── */
  --color-bg: #0b0b0b;
  --color-paper: #e8e4dc;

  /* ── Foreground (text/icons on dark) ───────────────────────────── */
  --color-fg: #ffffff;
  --color-fg-muted: rgb(255 255 255 / 0.7);
  --color-fg-subtle: rgb(255 255 255 / 0.5);
  --color-fg-faint: rgb(255 255 255 / 0.35);
  --color-fg-ghost: rgb(255 255 255 / 0.2);

  /* ── Foreground (text/icons on light) ──────────────────────────── */
  --color-ink: #0b0b0b;
  --color-ink-muted: rgb(0 0 0 / 0.7);
  --color-ink-subtle: rgb(0 0 0 / 0.5);
  --color-ink-faint: rgb(0 0 0 / 0.3);
  --color-ink-ghost: rgb(0 0 0 / 0.2);

  /* ── Surfaces (white tints on dark) ────────────────────────────── */
  --color-surface: rgb(255 255 255 / 0.05);
  --color-surface-hover: rgb(255 255 255 / 0.1);
  --color-surface-strong: rgb(255 255 255 / 0.15);

  /* ── Surfaces (black tints on light) ───────────────────────────── */
  --color-tint: rgb(0 0 0 / 0.05);
  --color-tint-hover: rgb(0 0 0 / 0.1);
  --color-tint-strong: rgb(0 0 0 / 0.2);

  /* ── Edges & dividers ──────────────────────────────────────────── */
  --color-edge: rgb(255 255 255 / 0.1);
  --color-edge-strong: rgb(255 255 255 / 0.2);

  /* ── Overlays ──────────────────────────────────────────────────── */
  --color-overlay: rgba(18, 18, 18, 0.7);

  /* ── Typography — families ─────────────────────────────────────── */
  --font-sans: var(--font-open-sauce-sans), sans-serif;
  --font-display: var(--font-monsieur);

  /* ── Typography — tracking ─────────────────────────────────────── */
  --tracking-tight: -0.05em;
  --tracking-label: 0.14em;
  --tracking-eyebrow: 0.2em;
  --tracking-display: 0.28em;

  /* ── Motion — durations ────────────────────────────────────────── */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;

  /* ── Elevation ─────────────────────────────────────────────────── */
  --shadow-overlay: 0 16px 40px rgb(0 0 0 / 0.35);

  /* ── Legacy aliases (DELETED in Task 9) ────────────────────────── */
  --color-fg-strong: var(--color-fg-muted);
  --color-fg-soft: var(--color-fg-muted);
  --color-fg-secondary: var(--color-fg-subtle);
  --color-fg-tertiary: var(--color-fg-subtle);
  --color-fg-caption: var(--color-fg-faint);
  --color-fg-faint-legacy: var(--color-fg-ghost);
  --color-surface-subtle: var(--color-surface);
  --color-surface-soft: var(--color-surface-hover);
  --color-surface-active: var(--color-surface-hover);
  --color-divider: var(--color-edge);
  --color-edge-muted: var(--color-edge-strong);
}
```

Then replace the `:root { --background: ...; --foreground: ...; }` block (lines 35–38) and the `html` rule (lines 40–44) with:

```css
html {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-paper);
}
```

(The old `--background` / `--foreground` CSS vars get replaced by the typed `--color-bg` / `--color-paper`. The `html` rule now references those directly, so no caller depends on `--background` or `--foreground` anymore.)

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: build succeeds with no Tailwind warnings. Both old and new utility class names resolve (old via the legacy aliases).

- [ ] **Step 3: Verify visually that nothing rendered changed**

Run: `npm run dev` and load `http://localhost:3000`. Walk through `/`, `/products`, `/community`, `/mantra`, one policy route. Compare to `main` if needed by checking out `main` in another terminal/browser tab. Expected: pixel-identical.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(design-system): add consolidated tokens alongside legacy aliases"
```

---

## Task 2: Migrate top-level chrome (Navbar, LoadScreen, Cart, NewsletterPopup)

**Files:**
- Modify: `app/components/Navbar/DesktopNav.tsx`
- Modify: `app/components/Navbar/MobileMenu.tsx`
- Modify: `app/components/Navbar/NavActions.tsx`
- Modify: `app/components/Navbar/NavbarClient.tsx`
- Modify: `app/components/Navbar/ShopDropdown.tsx`
- Modify: `app/components/LoadScreen/index.tsx`
- Modify: `app/components/Cart/CartDrawer.tsx`
- Modify: `app/components/NewsletterPopup/NewsletterPopupClient.tsx`

- [ ] **Step 1: Apply the migration mapping to each file**

For each file above, apply every row of the **Migration mapping** table at the top of this plan that occurs in the file. Use Edit. Examples:
- `text-white/70` → `text-fg-muted`
- `bg-black/8` → `bg-tint`
- `tracking-[0.18em]` → `tracking-eyebrow`
- `duration-150` → `duration-fast`
- `font-[var(--font-open-sauce-sans)]` → `font-sans`

For ambiguous bare `bg-white` / `bg-black`: read the surrounding component to decide. The Navbar background is the dark page background → `bg-bg`. The Cart drawer background is the warm light surface → `bg-paper`. NewsletterPopup background is a black overlay → `bg-bg/...`.

- [ ] **Step 2: Verify no orphan utility classes remain in this group**

Run:
```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-' \
  app/components/Navbar app/components/LoadScreen app/components/Cart app/components/NewsletterPopup
```
Expected: no output (empty grep). If anything remains, decide whether it's an intentional scrim case (`bg-bg/30` etc. are allowed — they don't match the pattern) or a missed replacement.

- [ ] **Step 3: Build & lint**

Run: `npm run build && npm run lint`
Expected: both pass.

- [ ] **Step 4: Visual check**

Run dev server. Confirm: navbar in default and scrolled states, mobile menu open, shop dropdown, cart drawer (open it from any product), newsletter popup (clear `localStorage` if needed to retrigger). All look identical to before.

- [ ] **Step 5: Commit**

```bash
git add app/components/Navbar app/components/LoadScreen app/components/Cart app/components/NewsletterPopup
git commit -m "refactor(navbar,cart,popup): migrate to design tokens"
```

---

## Task 3: Migrate hero & top-of-page sections

**Files:**
- Modify: `app/components/HeroSection/HeroOverlayText.tsx`
- Modify: `app/components/HeroSection/Slide.tsx`
- Modify: `app/components/HeroSection/SlideIndicator.tsx`
- Modify: `app/components/HeroSection/HeroLogo3D.tsx`
- Modify: `app/components/HeroSection/Waves.tsx`
- Modify: `app/components/HeroSection/constants.ts`
- Modify: `app/components/BrandStatementSection/index.tsx`
- Modify: `app/components/BrandLockup/index.tsx`
- Modify: `app/components/MantraSection/index.tsx`

- [ ] **Step 1: Apply the migration mapping**

For each file, apply every applicable row of the table — Tailwind utilities AND any inline `style={{ ... }}` or constant-defined hex/rgba values (`HeroSection/constants.ts`, `Waves.tsx`, `HeroLogo3D.tsx` are likely to have these). Use the inline-style mapping rows from the table.

- [ ] **Step 2: Verify no orphans in this group**

Run:
```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-|#[0-9a-fA-F]{3,8}\b|rgba?\(' \
  app/components/HeroSection app/components/BrandStatementSection app/components/BrandLockup app/components/MantraSection
```
Expected: only matches are the dynamic-gradient `rgba(255,255,255,${v})` and `rgba(255,255,255,${0.5 + v * 0.5})` template strings (intentionally kept per the spec).

- [ ] **Step 3: Build, lint, visually check the home page**

Run: `npm run build && npm run lint`. Then run dev and load `/`. Confirm: hero slides cycle, slide indicator highlights, logo renders, waves animate, brand statement is positioned correctly, mantra section is unchanged.

- [ ] **Step 4: Commit**

```bash
git add app/components/HeroSection app/components/BrandStatementSection app/components/BrandLockup app/components/MantraSection
git commit -m "refactor(hero,brand,mantra): migrate to design tokens"
```

---

## Task 4: Migrate featured-products section

**Files:**
- Modify: `app/components/FeaturedProductsSection/FeaturedProductsCarousel.tsx`
- Modify: `app/components/FeaturedProductsSection/ProductCard/index.tsx`
- Modify: `app/components/FeaturedProductsSection/ProductCard/ProductCardInfo.tsx`
- Modify: `app/components/FeaturedProductsSection/ProductCard/ProductCardTags.tsx`
- Modify: `app/components/FeaturedProductsSection/ProductCarouselIndicator.tsx`
- Modify: `app/components/CirclesAnimation/index.tsx`

- [ ] **Step 1: Apply the migration mapping**

Note: `ProductCard/index.tsx` and `ProductCardInfo.tsx` use `bg-white` and `text-black` heavily — these cards sit on the warm-light background, so `bg-white` → `bg-paper`, `text-black` → `text-ink`. `CirclesAnimation/index.tsx` likely has hex colors in canvas drawing — check whether they're inline `style={...}` (replaceable) vs canvas API string literals (also replaceable, but reference `getComputedStyle(document.documentElement).getPropertyValue('--color-fg')` if you want them tokenized; if too invasive, leave canvas literals alone and document the exception in the commit body).

- [ ] **Step 2: Verify no orphans in this group**

Run:
```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-' \
  app/components/FeaturedProductsSection app/components/CirclesAnimation
```
Expected: empty (or only canvas-API literals you decided to leave as exceptions).

- [ ] **Step 3: Build, lint, visually check carousel**

Run: `npm run build && npm run lint`. Then run dev and load `/` — scroll to featured products, click through carousel, hover product cards, check tags rendering.

- [ ] **Step 4: Commit**

```bash
git add app/components/FeaturedProductsSection app/components/CirclesAnimation
git commit -m "refactor(featured-products): migrate to design tokens"
```

---

## Task 5: Migrate community, blog, inspo, home-image sections

**Files:**
- Modify: `app/components/CommunitySection/AsciiRun.tsx`
- Modify: `app/components/CommunitySection/ImageSection.tsx`
- Modify: `app/components/CommunitySection/InstagramMarquee.tsx`
- Modify: `app/components/CommunitySection/StorySection.tsx`
- Modify: `app/components/CommunitySection/ParticleField/index.tsx`
- Modify: `app/components/CommunitySection/ParticleField/particleSystem.ts`
- Modify: `app/components/BlogSection/BlogStack.tsx`
- Modify: `app/components/BlogSection/BlogPostCard.tsx`
- Modify: `app/components/InspoSection/index.tsx`
- Modify: `app/components/HomeImageSection/index.tsx`

- [ ] **Step 1: Apply the migration mapping**

Note: `particleSystem.ts` and the dynamic `rgba(255,255,255,${v})` template strings in `InstagramMarquee.tsx` are the *intentional gradient/fade* exceptions — leave those template strings alone. Replace static hex/rgba per the inline-style table rows.

- [ ] **Step 2: Verify no orphans in this group**

Run:
```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-' \
  app/components/CommunitySection app/components/BlogSection app/components/InspoSection app/components/HomeImageSection
```
Expected: empty.

Then for inline rgba/hex:
```bash
grep -rE '#[0-9a-fA-F]{3,8}\b|rgba?\(' \
  app/components/CommunitySection app/components/BlogSection app/components/InspoSection app/components/HomeImageSection
```
Expected: only dynamic template-string matches (`rgba(255,255,255,${v})`, etc.).

- [ ] **Step 3: Build, lint, visually check `/` and `/community`**

Run: `npm run build && npm run lint`. Then load `/` (scroll through community/blog/inspo/home-image) and `/community`.

- [ ] **Step 4: Commit**

```bash
git add app/components/CommunitySection app/components/BlogSection app/components/InspoSection app/components/HomeImageSection
git commit -m "refactor(community,blog,inspo): migrate to design tokens"
```

---

## Task 6: Migrate footer, newsletter, policies, accordion

**Files:**
- Modify: `app/components/Footer/index.tsx`
- Modify: `app/components/Newsletter/index.tsx`
- Modify: `app/components/PolicyPage/index.tsx`
- Modify: `app/components/PolicyPage/FaqList.tsx`
- Modify: `app/components/PolicyPage/SectionList.tsx`
- Modify: `app/components/PolicyPage/renderWithEmails.tsx`
- Modify: `app/components/Accordion/AccordionItem.tsx`

- [ ] **Step 1: Apply the migration mapping**

The Footer is the heaviest user of `text-white/40`, `text-white/60`, `border-white/10`. The PolicyPage components are heavy users of `text-black/*` opacities — these are the warm-light reading surface, so `text-black/70` → `text-ink-muted`, etc.

- [ ] **Step 2: Verify no orphans**

```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-|#[0-9a-fA-F]{3,8}\b|rgba?\(' \
  app/components/Footer app/components/Newsletter app/components/PolicyPage app/components/Accordion
```
Expected: empty.

- [ ] **Step 3: Build, lint, visually check footer and a policy page**

Run: `npm run build && npm run lint`. Then load `/` (footer at the bottom) and one of `/(policies)/[slug]` routes (`/privacy`, `/returns`, etc. — pick any).

- [ ] **Step 4: Commit**

```bash
git add app/components/Footer app/components/Newsletter app/components/PolicyPage app/components/Accordion
git commit -m "refactor(footer,policies): migrate to design tokens"
```

---

## Task 7: Migrate products pages

**Files:**
- Modify: `app/products/page.tsx`
- Modify: `app/products/[category]/page.tsx`
- Modify: `app/products/[category]/[handle]/page.tsx`
- Modify: `app/products/components/CategoryMarquee.tsx`
- Modify: `app/products/components/ProductsGrid.tsx`
- Modify: `app/products/components/ProductsListing.tsx`
- Modify: `app/products/components/ProductDetailView.tsx`
- Modify: `app/products/components/ProductAccordion/index.tsx`

- [ ] **Step 1: Apply the migration mapping**

Note: `ScrollVelocity.tsx` was filtered out by the grep but if the `products/components/ScrollVelocity` directory has any color/tracking usage, include it here.

The product detail view sits on a warm-light surface — bare `bg-white` → `bg-paper`, `text-black` → `text-ink`.

- [ ] **Step 2: Verify no orphans**

```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-|#[0-9a-fA-F]{3,8}\b|rgba?\(' \
  app/products
```
Expected: empty (or only intentional dynamic template strings).

- [ ] **Step 3: Build, lint, visually walk products**

Run: `npm run build && npm run lint`. Then dev: load `/products`, pick a category, open a product detail page, expand the product accordion.

- [ ] **Step 4: Commit**

```bash
git add app/products
git commit -m "refactor(products): migrate to design tokens"
```

---

## Task 8: Sweep for any remaining files

This catches anything missed by the per-area tasks (e.g. files added between when this plan was written and execution).

- [ ] **Step 1: Find remaining occurrences**

```bash
grep -rE '\b(text|bg|border)-(white|black)(\/[0-9]+)?\b|tracking-\[|duration-(150|200|300|400|500)|font-\[var\(--font-' app --include="*.tsx" --include="*.ts"
```

```bash
grep -rE '#[0-9a-fA-F]{3,8}\b|rgba?\(' app --include="*.tsx" --include="*.ts"
```

Expected: only dynamic-template `rgba(255,255,255,${...})` matches. Any other hits → fix them by applying the mapping table.

- [ ] **Step 2: Build, lint**

Run: `npm run build && npm run lint`
Expected: both pass.

- [ ] **Step 3: Commit (only if Step 1 found anything to fix)**

```bash
git add -A
git commit -m "refactor: migrate remaining stragglers to design tokens"
```

---

## Task 9: Delete legacy aliases from `globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Verify no caller still uses any legacy token name**

Run:
```bash
grep -rE '(fg-strong|fg-soft|fg-secondary|fg-tertiary|fg-caption|fg-faint-legacy|surface-subtle|surface-soft|surface-active|edge-muted|color-divider|--background\b|--foreground\b)' app
```

Expected: only matches are the legacy alias *definitions* inside `app/globals.css` itself. No `*.tsx` / `*.ts` consumer should appear.

If any consumer appears, it was missed in Tasks 2–8 — go back, migrate it, then re-run this grep.

- [ ] **Step 2: Delete the legacy alias block**

In `app/globals.css`, delete the `/* ── Legacy aliases (DELETED in Task 9) ─────... */` comment and the 11 alias lines below it.

- [ ] **Step 3: Build, lint**

Run: `npm run build && npm run lint`
Expected: both pass.

- [ ] **Step 4: Final visual walkthrough**

Run dev. Walk every route: `/`, `/products`, `/products/[category]` (each), `/products/[category]/[handle]` (sample), `/community`, `/mantra`, every `(policies)` route. Open the cart drawer, the mobile menu, the shop dropdown, the newsletter popup. Trigger hover on cards, nav links. Confirm: pixel-identical to `main` (or whatever you branched from before this work).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat(design-system): remove legacy token aliases after migration"
```

---

## Task 10: Open the PR

- [ ] **Step 1: Verify branch state**

```bash
git status
git log --oneline main..HEAD
```

Expected: clean working tree; 9 commits (Tasks 1, 2, 3, 4, 5, 6, 7, optionally 8, 9).

- [ ] **Step 2: Push and open PR**

```bash
git push -u origin HEAD
gh pr create --title "feat(design-system): centralize color, tracking, motion tokens" --body "$(cat <<'EOF'
## Summary
- Adds a consolidated token system in `app/globals.css` (colors, tracking, motion, font families)
- Migrates ~250 hardcoded usages across 43+ files to the new tokens
- Removes legacy aliases after migration is complete

## Test plan
- [x] `npm run build` passes
- [x] `npm run lint` passes
- [x] Visual walkthrough of every route — pixel-identical to main
- [x] Cart drawer, mobile menu, shop dropdown, newsletter popup checked
- [x] No orphan `text-(white|black)` / hardcoded hex / rgba in `app/**`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review notes

Spec coverage check:
- Background base (`--color-bg`, `--color-paper`) → Task 1
- 5-step `fg-*` scale → Task 1 + applied across Tasks 2–7
- 5-step `ink-*` scale → Task 1 + applied across Tasks 2–7
- 3-step `surface-*` scale → Task 1 + applied across Tasks 2–7
- 3-step `tint-*` scale → Task 1 + applied across Tasks 2–7
- 2-step edge scale → Task 1 + applied across Tasks 2–7
- Overlay token → Task 1
- Font families (`--font-sans`, `--font-display`) → Task 1 + applied
- 4-step tracking scale → Task 1 + applied
- 3-step duration scale → Task 1 + applied
- Shadow → unchanged in Task 1
- Inline hex/rgba replacement → covered in Tasks 3, 4, 5 (via the inline-style mapping rows)
- Dynamic template strings preserved → flagged in Tasks 3, 5
- Big-bang single-PR migration → all tasks land on one branch, single PR in Task 10

No placeholders, no "TBD". Every step has either a concrete code block, a concrete grep command with expected output, or a concrete git command.
