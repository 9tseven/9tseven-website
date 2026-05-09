# 9TSEVEN — Design Guide

A reference for the visual language, design tokens, and styling conventions used throughout the 9TSEVEN website.

This document mirrors the source of truth defined in [app/globals.css](app/globals.css) (Tailwind v4 `@theme` block) and the font setup in [app/layout.tsx](app/layout.tsx). When tokens change in code, update this file too.

---

## 1. Brand Identity

| Property | Value |
| --- | --- |
| Name | 9TSEVEN |
| Tagline | *More than running* |
| Tone | Editorial, athletic, confident, monochrome |
| Mood | High-contrast dark canvas with a subtle script accent |

The brand leans on heavy black backgrounds, near-white type, and a single decorative script face used sparingly for emotional emphasis. Color is intentionally absent — the design language is built almost entirely from **black, white, and translucent overlays**.

---

## 2. Color System

All colors are defined as CSS custom properties in [app/globals.css](app/globals.css) and exposed automatically as Tailwind utilities (e.g. `bg-bg`, `text-fg`, `border-edge`).

### 2.1 Base background & neutrals

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#0b0b0b` | Primary page background — near-black, not pure black |
| `--color-white` | `#f9f9f9` | Off-white sections, light surfaces |
| `--color-light-grey` | `#e0e0e0` | Soft dividers / muted light surfaces |
| `--color-grey` | `#ebebeb` | Light section backgrounds |

### 2.2 Foreground on dark (text & icons over `--color-bg`)

| Token | Value | Usage |
| --- | --- | --- |
| `--color-fg` | `#ffffff` | Primary text on dark |
| `--color-fg-muted` | `rgb(255 255 255 / 0.7)` | Secondary text, subtitles |
| `--color-fg-subtle` | `rgb(255 255 255 / 0.5)` | Captions, labels |
| `--color-fg-faint` | `rgb(255 255 255 / 0.35)` | Disabled / placeholder |
| `--color-fg-ghost` | `rgb(255 255 255 / 0.2)` | Decorative, low-emphasis text |

### 2.3 Foreground on light (text & icons over white/grey)

| Token | Value | Usage |
| --- | --- | --- |
| `--color-ink` | `#0b0b0b` | Primary text on light |
| `--color-ink-muted` | `rgb(0 0 0 / 0.7)` | Secondary text on light |
| `--color-ink-subtle` | `rgb(0 0 0 / 0.5)` | Captions on light |
| `--color-ink-faint` | `rgb(0 0 0 / 0.3)` | Disabled / placeholder on light |
| `--color-ink-ghost` | `rgb(0 0 0 / 0.2)` | Decorative on light |

### 2.4 Surfaces (white tints layered on dark backgrounds)

| Token | Value | Usage |
| --- | --- | --- |
| `--color-surface` | `rgb(255 255 255 / 0.05)` | Default card / panel |
| `--color-surface-hover` | `rgb(255 255 255 / 0.1)` | Hover state |
| `--color-surface-strong` | `rgb(255 255 255 / 0.15)` | Pressed / active state |

### 2.5 Tints (black tints layered on light backgrounds)

| Token | Value | Usage |
| --- | --- | --- |
| `--color-tint` | `rgb(0 0 0 / 0.05)` | Default surface on light |
| `--color-tint-hover` | `rgb(0 0 0 / 0.1)` | Hover state on light |
| `--color-tint-strong` | `rgb(0 0 0 / 0.2)` | Pressed / active state on light |

### 2.6 Edges & overlays

| Token | Value | Usage |
| --- | --- | --- |
| `--color-edge` | `rgb(255 255 255 / 0.1)` | Default 1px border on dark |
| `--color-edge-strong` | `rgb(255 255 255 / 0.2)` | Emphasized border on dark |
| `--color-overlay` | `rgba(18, 18, 18, 0.7)` | Modal / scrim background |

### 2.7 Color usage rules

- The site is **dark-first**. White-on-black is the default canvas.
- Light sections invert the relationship: use `text-ink*` tokens, `bg-white`/`bg-grey`, and `tint*` surfaces.
- Never reach for raw hex values in components — always use tokens. If a needed color doesn't exist, add a token to `globals.css` first.
- Translucent foreground tokens (`fg-muted`, `fg-subtle`, etc.) are preferred over opacity utilities so contrast hierarchy stays consistent.

---

## 3. Typography

### 3.1 Font families

| Token | Family | Source | Usage |
| --- | --- | --- | --- |
| `--font-sans` | **Open Sauce One** | Self-hosted via `next/font/local` ([app/layout.tsx](app/layout.tsx)) | Body, UI, headings |
| `--font-display` | **Parfumerie Script** | Adobe Typekit (`use.typekit.net/srx3ckv.css`) | Decorative display only |

Open Sauce One is loaded in weights 300–900 with matching italics. Parfumerie Script is reserved for short, expressive moments (mantra, hero accent words) — never for body or UI.

Use the corresponding Tailwind utilities: `font-sans` (default) and `font-display`.

### 3.2 Tracking (letter-spacing) tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--tracking-tight` | `-0.05em` | Large display headings |
| `--tracking-label` | `0.14em` | Buttons, small labels |
| `--tracking-eyebrow` | `0.2em` | Eyebrow / overline text |
| `--tracking-display` | `0.28em` | Wide-set monumental display text |

Available as `tracking-tight`, `tracking-label`, `tracking-eyebrow`, `tracking-display`.

### 3.3 Type scale (observed conventions)

The project uses Tailwind's default type scale plus fluid `clamp()` values for hero text. Common patterns:

| Role | Recipe |
| --- | --- |
| Hero headline | `font-bold uppercase tracking-tight leading-[1.1]` with `clamp(1.75rem, 4.5vw, 3rem)` |
| Section heading (light bg) | `text-5xl md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-bold leading-none tracking-tight text-ink` |
| Eyebrow / label | `font-mono text-xs tracking-eyebrow uppercase` |
| Body | `font-sans text-base leading-relaxed text-fg-muted` |
| Small UI / link | `font-mono text-sm tracking-tight underline underline-offset-4` |

Headings are **uppercase + bold + tight tracking** by default. Body copy stays sentence-case in `fg-muted` for hierarchy.

---

## 4. Motion

### 4.1 Duration tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--duration-fast` | `150ms` | Hover / focus tints |
| `--duration-base` | `200ms` | Default UI transitions, color swaps |
| `--duration-slow` | `300ms` | Panel reveals, larger state changes |
| `--duration-extraslow` | `500ms` | Hero / page-level transitions |

Use as `duration-fast`, `duration-base`, etc.

### 4.2 Custom keyframes (defined in [globals.css](app/globals.css))

| Animation | Purpose |
| --- | --- |
| `marquee-scroll` | 40s horizontal loop for image marquees (`.marquee-track`) |
| `text-marquee-left` / `text-marquee-right` | 30s text marquees (`.text-marquee--left/right`) |

Both honor `prefers-reduced-motion: reduce` and pause on hover/focus.

### 4.3 Motion library

Interactive animations use **Framer Motion** (`motion/react`) — see e.g. [HeroSection](app/components/HeroSection). Stick to the library's spring/tween primitives rather than ad-hoc CSS for component-level animation.

---

## 5. Elevation & Shadows

| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-overlay` | `0 16px 40px rgb(0 0 0 / 0.35)` | Modals, dropdowns, popovers |

The aesthetic is intentionally flat — shadows are reserved for floating overlays. Cards rely on `surface*` / `tint*` tokens and `edge*` borders rather than shadows.

---

## 6. Layout & Spacing

The site uses Tailwind's default spacing scale (4px base) and Flex/Grid utilities. There is no custom container token; sections typically rely on:

- Full-bleed sections with internal `max-w-*` constraints
- Generous vertical rhythm (`py-24`, `py-32` for section blocks)
- Consistent horizontal gutters via `px-6 md:px-10 lg:px-16`

The smooth-scrolling experience is provided by **Lenis** (see [SmoothScroll.tsx](app/components/SmoothScroll.tsx) and the `lenis/dist/lenis.css` import).

---

## 7. Components Overview

All shared UI lives in [app/components/](app/components/). Major building blocks:

| Component | Role |
| --- | --- |
| [Navbar](app/components/Navbar) | Sticky top navigation + cart trigger |
| [Footer](app/components/Footer) | Site footer with links + brand lockup |
| [HeroSection](app/components/HeroSection) | Animated landing hero with sliding text |
| [CommunitySection](app/components/CommunitySection) | Home-page community teaser linking to /community |
| [CommunityPage](app/components/CommunityPage) | Subcomponents that compose the /community page |
| [MantraPage](app/components/MantraPage) | Scroll-driven /mantra page experience |
| [FeaturedProductsSection](app/components/FeaturedProductsSection) | Product carousel |
| [BlogSection](app/components/BlogSection) | Editorial post grid |
| [Newsletter](app/components/Newsletter) / [NewsletterPopup](app/components/NewsletterPopup) | Email capture |
| [Cart](app/components/Cart) | Slide-over shopping cart |
| [LoadScreen](app/components/LoadScreen) | First-visit intro screen |
| [BrandLockup](app/components/BrandLockup) | Logo / wordmark |
| [Accordion](app/components/Accordion) | Expandable list sections |

When building a new component, prefer composing existing ones and reusing their token-based styles before introducing new patterns.

---

## 8. Accessibility

- Color contrast: dark surfaces use full white (`fg`) for primary text; never rely on `fg-faint`/`fg-ghost` for critical content.
- Reduced motion: every custom animation in [globals.css](app/globals.css) respects `prefers-reduced-motion: reduce`. Replicate this for any new keyframe animation.
- Focus states: rely on the browser default outline or use `focus-visible:ring-*` utilities — never remove focus rings without an equivalent replacement.
- Semantic HTML: prefer `button`, `a`, `nav`, `section`, `header`, `footer`, etc., and provide `aria-label` for icon-only controls (see Navbar examples).

---

## 9. Adding or Changing Tokens

1. Edit the `@theme { … }` block in [app/globals.css](app/globals.css) — this is the single source of truth.
2. Tailwind v4 will auto-generate matching utilities (e.g. a new `--color-foo` becomes `bg-foo`, `text-foo`, etc.).
3. Update this guide so the documentation stays in sync.
4. Avoid hard-coded values inside component files — if you need something that isn't a token, add the token first.

---

## 10. Quick Reference Cheatsheet

```text
Background     bg-bg              #0b0b0b
Primary text   text-fg            #ffffff
Muted text     text-fg-muted      white @ 70%
Light bg       bg-white / bg-grey #f9f9f9 / #ebebeb
Light text     text-ink           #0b0b0b
Border         border-edge        white @ 10%
Card           bg-surface         white @ 5%
Hover card     bg-surface-hover   white @ 10%
Overlay        bg-overlay         #121212 @ 70%

Sans font      font-sans          Open Sauce One
Display font   font-display       Parfumerie Script

Tight track    tracking-tight     -0.05em
Eyebrow track  tracking-eyebrow    0.2em

Fast motion    duration-fast      150ms
Base motion    duration-base      200ms
```
