# Community Instagram Marquee — Design

## Goal

Add a new section beneath `ParticleField` on `/community` that presents "latest Instagram posts" as a continuously scrolling marquee. On hover, the marquee pauses, a gradient overlay fades in, and an Instagram CTA appears. Copy and layout mirror the existing `StorySection` for visual rhythm.

No Instagram API integration in this scope — the marquee renders the 4 existing community photos already exported from `app/components/CommunitySection/constants.ts`. A future swap to a live Instagram data source is a drop-in replacement at the data layer.

## Placement

In `app/community/page.tsx`, append after `<ParticleField />`:

```tsx
<ImageSection />
<StorySection />
<ParticleField />
<InstagramMarquee />
```

## Theme

- `bg-black`, `data-nav-theme="dark"` — continues the dark mood from `ParticleField` rather than snapping back to white.
- Text color: `text-white` for heading, `text-white/55`–`text-white/70` for secondary text and mono label (inverted versions of `StorySection`'s black tones).

## Layout

Two stacked blocks within a single `<section>`:

### Block 1 — Header grid (mirrored from `StorySection`)

- 3-column grid on `md`+, single column on mobile.
- **Columns 1–2 (left, `md:col-span-2`)**: uppercase heading, matches `StorySection` heading classes: `text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.01em] sm:text-4xl md:text-5xl lg:text-6xl`.
  - Draft copy: *"Follow the runs. The mornings, the miles, the people in between — on Instagram."*
- **Column 3 (right)**: mono label, matches `StorySection` label classes: `font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-white/70` with the `(   Label   )` pattern.
  - Label copy: `(   On Instagram   )`
- The mirror vs. `StorySection`: label moves from left column → right column, heading stays visually dominant on the left.
- Padding mirrors `StorySection`: `px-6 py-20 md:px-20 md:py-32` (may trim bottom padding since the marquee provides its own vertical rhythm — tune during implementation).

### Block 2 — Marquee strip

- Full-bleed horizontal strip below the header grid.
- Tile height: `h-56 md:h-80` (roughly 224px / 320px), auto width to preserve native aspect ratios.
- Gap between tiles: `gap-4 md:gap-6`.
- Rounded corners: `rounded-sm` (subtle, to fit the brand's clean aesthetic — no heavy rounding).
- Edge fade masks on the strip container using Tailwind `mask-image` linear gradient so tiles ease in/out at both edges (~64px fade zone).

## Marquee mechanics

- Pure CSS animation — no JS loop. Respects `prefers-reduced-motion` via a `@media (prefers-reduced-motion: reduce)` override that pauses the animation.
- Track structure:
  ```
  <div class="track">
    <ul class="marquee-row">{IMAGES.map(...)}</ul>
    <ul class="marquee-row" aria-hidden="true">{IMAGES.map(...)}</ul>
  </div>
  ```
  Duplicating the list lets the track translate by exactly `-50%` and loop seamlessly.
- Animation: `@keyframes marquee { to { transform: translateX(-50%); } }` applied to the track, duration ~40s linear infinite (tune for feel during implementation).
- On container `:hover` (or `group-hover` wrapper): `animation-play-state: paused`.

## Hover overlay

Triggered by hover on the whole marquee container (the `<a>` wraps it). All transitions `duration-300 ease-out`.

- **Gradient overlay**: absolutely positioned over the strip, `bg-gradient-to-r from-black/80 via-black/40 to-black/80`, `opacity-0 group-hover:opacity-100`.
- **CTA content**: absolutely centered, `opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`.
  - Line 1: `@9tseven_` — large, `text-2xl md:text-4xl font-extrabold uppercase tracking-[-0.01em] text-white`.
  - Line 2: Instagram SVG logo + small text "Visit our Instagram →", `font-mono text-[11px] tracking-[0.18em] uppercase text-white/70`, logo ~20px, inline-flex with small gap.
- Entire strip is wrapped in an `<a href="https://instagram.com/9tseven_" target="_blank" rel="noopener noreferrer" aria-label="Visit 9tseven on Instagram">` so clicking anywhere navigates.

## Instagram SVG

Inline the Instagram glyph (camera-with-circle mark) as an SVG in the component — no new dependency. Single-color `currentColor` fill/stroke so it inherits from the text color classes.

## Data

Import `IMAGES` from `app/components/CommunitySection/constants.ts` unchanged. Use the same `next/image` `Image` component used in `ImageSection.tsx`. Set `sizes` for a fixed-height tile (approximate: `(max-width: 768px) 224px, 320px`).

## File structure

New file: `app/components/CommunitySection/InstagramMarquee.tsx` — **server component**. Hover, animation, and reduced-motion handling are all pure CSS, so no `"use client"` directive is needed.

Edit: `app/community/page.tsx` — import and render the new component.

No changes to `constants.ts`.

## Accessibility

- `<a>` has descriptive `aria-label`.
- Duplicate image row gets `aria-hidden="true"` so screen readers don't announce twice.
- Images keep existing `alt=""` (decorative) — if stakeholders want descriptive alts, that's a constants.ts change, out of scope here.
- Hover CTA is revealed on focus as well as hover (`focus-visible:` variants mirroring the `group-hover:` ones) so keyboard users see the state.
- `prefers-reduced-motion: reduce` pauses the marquee animation.

## Out of scope

- Live Instagram API integration (Graph API, Behold, etc.).
- Changes to the existing `IMAGES` array.
- Click-through to individual Instagram posts (the whole strip links to the profile).
- Mobile-specific layout differences beyond tile height — the marquee keeps the same behavior on mobile.

## Open questions

None — heading copy and handle text were confirmed in brainstorming.
