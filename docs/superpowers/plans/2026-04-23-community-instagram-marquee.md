# Community Instagram Marquee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dark-themed section beneath `ParticleField` on `/community` that displays the existing 4 community photos in a continuously scrolling CSS marquee, with a gradient overlay + Instagram CTA that appears on hover and links the entire strip to `https://www.instagram.com/9tseven_/`.

**Architecture:** A single server component (`InstagramMarquee.tsx`) renders a mirrored-layout header grid (label right, heading left — inverse of `StorySection`) followed by a full-bleed strip. The strip duplicates the image list and translates the track by `-50%` on a CSS keyframe, looping seamlessly. Hover interactions are implemented with `group-hover:` Tailwind utilities plus one custom keyframe in `globals.css`. No client-side JavaScript.

**Tech Stack:** Next.js 16.2.3 (App Router), React 19.2.4, Tailwind CSS v4, `next/image`, `lucide-react` (already installed — `Instagram` icon).

**Project caveat:** This repo uses Next.js 16 with breaking changes. When uncertain about a Next API, consult `node_modules/next/dist/docs/` as directed by [AGENTS.md](../../../AGENTS.md). Keyframes live in [app/globals.css](../../../app/globals.css) — this project uses Tailwind v4 (`@import "tailwindcss"`), so custom animations go in plain CSS under `@layer base`.

**Design spec:** [docs/superpowers/specs/2026-04-23-community-instagram-marquee-design.md](../specs/2026-04-23-community-instagram-marquee-design.md)

---

## Task 1: Add marquee keyframes to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append the marquee keyframes + reduced-motion override inside `@layer base`**

Open [app/globals.css](../../../app/globals.css). Inside the existing `@layer base { ... }` block, after the closing `}` of the last `@media` rule but *before* the layer's closing `}`, add:

```css
  @keyframes marquee-scroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  .marquee-track {
    animation: marquee-scroll 40s linear infinite;
    will-change: transform;
  }

  .marquee-container:hover .marquee-track,
  .marquee-container:focus-within .marquee-track {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee-track {
      animation: none;
    }
  }
```

Why: Tailwind v4 arbitrary animations require the keyframe to be defined in CSS. The `.marquee-container` / `.marquee-track` pair lets hover on the outer container pause the inner track, and `focus-within` gives keyboard users the same behavior.

- [ ] **Step 2: Verify CSS syntax**

Run: `npm run lint`
Expected: PASS (or unchanged warning count — eslint does not lint CSS, but the build will catch broken CSS in Task 7).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(community): add marquee keyframes for instagram carousel"
```

---

## Task 2: Create InstagramMarquee component skeleton (header + empty strip)

**Files:**
- Create: `app/components/CommunitySection/InstagramMarquee.tsx`

- [ ] **Step 1: Create the file with the mirrored header block and an empty strip placeholder**

Path: `app/components/CommunitySection/InstagramMarquee.tsx`

```tsx
import Image from "next/image";
import { Instagram } from "lucide-react";
import { IMAGES } from "./constants";

const INSTAGRAM_URL = "https://www.instagram.com/9tseven_/";
const INSTAGRAM_HANDLE = "@9tseven_";

export default function InstagramMarquee() {
  return (
    <section data-nav-theme="dark" className="bg-black">
      <div className="grid grid-cols-1 gap-10 px-6 py-20 md:grid-cols-3 md:gap-16 md:px-20 md:py-32">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Follow the runs. The mornings, the miles, the people in between — on Instagram.
          </h2>
        </div>

        <div className="md:flex md:justify-end">
          <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-white/70">
            (&nbsp;&nbsp;&nbsp;On Instagram&nbsp;&nbsp;&nbsp;)
          </span>
        </div>
      </div>

      {/* Marquee strip — populated in Task 3 */}
      <div className="marquee-container relative overflow-hidden pb-20 md:pb-32">
        <div className="marquee-track flex w-max gap-4 md:gap-6">
          {/* tiles go here */}
        </div>
      </div>
    </section>
  );
}
```

Notes:
- `md:col-span-2` on the heading and `md:flex md:justify-end` on the label mirror `StorySection`'s layout with label and heading swapped.
- Padding in the header matches `StorySection`; the strip has its own `pb-20 md:pb-32` so the section closes on the marquee, not the header.
- `w-max` on the track lets it size to its content (needed for `translateX(-50%)` to traverse exactly one copy of the list).

- [ ] **Step 2: Commit**

```bash
git add app/components/CommunitySection/InstagramMarquee.tsx
git commit -m "feat(community): scaffold InstagramMarquee component"
```

---

## Task 3: Render duplicated image tiles in the marquee track

**Files:**
- Modify: `app/components/CommunitySection/InstagramMarquee.tsx`

- [ ] **Step 1: Replace the empty track with two duplicated tile rows**

Replace the `<div className="marquee-track ...">` block (and everything inside it) with:

```tsx
        <div className="marquee-track flex w-max gap-4 md:gap-6">
          {[...IMAGES, ...IMAGES].map((img, i) => (
            <div
              key={`${img.id}-${i}`}
              className="relative h-56 w-auto shrink-0 overflow-hidden rounded-sm md:h-80"
              aria-hidden={i >= IMAGES.length ? true : undefined}
            >
              <Image
                src={img.src}
                alt={img.alt}
                sizes="(max-width: 768px) 224px, 320px"
                className="h-full w-auto object-cover"
                priority={false}
              />
            </div>
          ))}
        </div>
```

Why duplicated inline (`[...IMAGES, ...IMAGES]`) rather than two `<ul>` blocks: the keyframe translates a single flex track by `-50%`, which only loops seamlessly if both copies are inside the same flex container. The second half gets `aria-hidden` so screen readers see the list once.

Why `h-auto w-auto` on the image: `next/image` with a `StaticImageData` source has intrinsic width/height, and `h-full w-auto` on the img + `h-56/md:h-80` on the parent keeps the native aspect ratio at a fixed height.

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Open: `http://localhost:3000/community`
Scroll past the particle field to the new section.
Expected:
- Header shows "FOLLOW THE RUNS…" on the left and `(   ON INSTAGRAM   )` on the right (stacked on mobile).
- Strip shows the 4 photos scrolling left continuously, looping seamlessly (no visible jump).
- Hovering anywhere over the strip pauses the scroll.

If you see a jump at the loop point, verify that both halves are inside the same `.marquee-track` and that the keyframe translates to exactly `-50%`.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/InstagramMarquee.tsx
git commit -m "feat(community): render duplicated image tiles in marquee"
```

---

## Task 4: Add edge fade masks to the strip

**Files:**
- Modify: `app/components/CommunitySection/InstagramMarquee.tsx`

- [ ] **Step 1: Add the mask-image utility to the strip container**

In `InstagramMarquee.tsx`, update the strip container's className from:

```tsx
      <div className="marquee-container relative overflow-hidden pb-20 md:pb-32">
```

to:

```tsx
      <div
        className="marquee-container relative overflow-hidden pb-20 md:pb-32"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
        }}
      >
```

Why inline `style` rather than Tailwind arbitrary values: Tailwind v4 supports `mask-[...]`, but the two-stop linear-gradient with `calc()` is cleaner and more portable as inline CSS, and the explicit `WebkitMaskImage` fallback covers older Safari.

- [ ] **Step 2: Verify visually**

Reload `http://localhost:3000/community`.
Expected: the leftmost and rightmost ~64px of the strip fade into the black background. No hard edges.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/InstagramMarquee.tsx
git commit -m "feat(community): add edge fade masks to marquee"
```

---

## Task 5: Wrap strip in anchor, add gradient overlay + hover CTA

**Files:**
- Modify: `app/components/CommunitySection/InstagramMarquee.tsx`

- [ ] **Step 1: Convert the strip container to a focusable anchor and add the overlay + CTA**

Replace the entire strip block (from `<div className="marquee-container ...">` through its closing `</div>`) with:

```tsx
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit 9tseven on Instagram"
        className="marquee-container group relative block overflow-hidden pb-20 outline-none md:pb-32"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
        }}
      >
        <div className="marquee-track flex w-max gap-4 md:gap-6">
          {[...IMAGES, ...IMAGES].map((img, i) => (
            <div
              key={`${img.id}-${i}`}
              className="relative h-56 w-auto shrink-0 overflow-hidden rounded-sm md:h-80"
              aria-hidden={i >= IMAGES.length ? true : undefined}
            >
              <Image
                src={img.src}
                alt={img.alt}
                sizes="(max-width: 768px) 224px, 320px"
                className="h-full w-auto object-cover"
                priority={false}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay — revealed on hover/focus */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 bottom-20 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 md:bottom-32"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        {/* CTA content — centered over the strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-20 flex translate-y-2 flex-col items-center justify-center gap-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:bottom-32">
          <span className="text-2xl font-extrabold uppercase tracking-[-0.01em] text-white md:text-4xl">
            {INSTAGRAM_HANDLE}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-white/70">
            <Instagram className="h-4 w-4" aria-hidden="true" />
            Visit our Instagram →
          </span>
        </div>
      </a>
```

Why `bottom-20 md:bottom-32`: the strip container's `pb-20 md:pb-32` reserves space *below* the marquee; the overlay and CTA should only cover the tiles, not the padding. Matching the padding values keeps them aligned.

Why `pointer-events-none` on the overlay and CTA: the whole anchor captures clicks — the overlay children must not swallow hover events or block the underlying anchor's clickable area.

Why `group-focus-visible:`: the anchor is focusable via keyboard; mirroring the hover state on focus gives keyboard users the same visual reveal.

- [ ] **Step 2: Verify visually**

Reload `http://localhost:3000/community`.
Expected:
- Hovering anywhere on the strip → marquee pauses, dark gradient fades in (darker at left/right, lighter middle), `@9tseven_` + Instagram icon + "Visit our Instagram →" appear centered.
- Clicking anywhere on the strip opens `https://www.instagram.com/9tseven_/` in a new tab.
- Tab key reaches the strip; the same reveal occurs on keyboard focus.

- [ ] **Step 3: Commit**

```bash
git add app/components/CommunitySection/InstagramMarquee.tsx
git commit -m "feat(community): add hover gradient overlay and instagram CTA"
```

---

## Task 6: Mount the component on the community page

**Files:**
- Modify: `app/community/page.tsx`

- [ ] **Step 1: Import and render `InstagramMarquee` after `ParticleField`**

Open [app/community/page.tsx](../../../app/community/page.tsx). Replace its contents with:

```tsx
import ImageSection from "../components/CommunitySection/ImageSection";
import InstagramMarquee from "../components/CommunitySection/InstagramMarquee";
import ParticleField from "../components/CommunitySection/ParticleField";
import StorySection from "../components/CommunitySection/StorySection";

export default function Community() {
  return (
    <main>
      <ImageSection />
      <StorySection />
      <ParticleField />
      <InstagramMarquee />
    </main>
  );
}
```

- [ ] **Step 2: Verify the page renders end-to-end**

Reload `http://localhost:3000/community` and scroll the full page.
Expected order: image section (white) → story section (white) → particle field (black) → instagram marquee (black).
Nav theme should stay dark through both the particle field and the marquee.

- [ ] **Step 3: Commit**

```bash
git add app/community/page.tsx
git commit -m "feat(community): mount InstagramMarquee on community page"
```

---

## Task 7: Final verification — lint, build, manual checks

**Files:** none (verification only)

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: PASS (no new errors or warnings introduced by these changes).

If lint flags the inline `style` objects or the `aria-hidden` boolean on a conditionally-rendered prop, fix inline and re-run.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: build completes without errors. This is the definitive check that the custom CSS, the `next/image` usage, and the server component wiring are all valid.

- [ ] **Step 3: Manual browser verification checklist**

With `npm run dev` running, walk through these on `http://localhost:3000/community`:

- [ ] Desktop hover: strip pauses, overlay fades in, CTA visible, click opens Instagram in new tab.
- [ ] Desktop keyboard: Tab to the strip — same reveal as hover.
- [ ] Mobile (DevTools responsive, ~375px): header stacks cleanly, strip fills width, tiles are ~224px tall, marquee still scrolls.
- [ ] `prefers-reduced-motion`: in DevTools > Rendering, enable "Emulate CSS prefers-reduced-motion: reduce" → marquee stops animating, tiles remain visible.
- [ ] Loop seam: watch the strip through at least one full cycle (~40s) — no visible jump where the second copy takes over from the first.
- [ ] Nav theme: nav stays dark-themed over the marquee (confirms `data-nav-theme="dark"` is detected).

- [ ] **Step 4: Final commit (if any fixes were needed)**

If any of Step 3's checks required fixes, commit them:

```bash
git add -A
git commit -m "fix(community): adjust instagram marquee per verification"
```

If no fixes, skip this step.

---

## Out of scope (explicitly not in this plan)

- Live Instagram API or Behold.so integration.
- Changes to `constants.ts` or the `IMAGES` array (including alt text).
- Per-post linking (only the profile is linked).
- Adding TikTok/YouTube variants — separate work.
