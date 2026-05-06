# Design System — Centralized Tokens in `globals.css`

## Goal

Replace ad-hoc color, tracking, motion, and font-family values scattered across components with a small, consolidated set of named tokens defined in `app/globals.css`. Migrate every existing usage in a single PR.

## Non-goals

- No theme-switching / auto-inverting tokens. The site has explicit dark and light sections; each has its own parallel scale (`fg-*` / `surface-*` / `edge` for dark; `ink-*` / `tint-*` / `edge` for light).
- No new radius or shadow scales. Tailwind defaults (`rounded-sm/md/lg/full`) cover the 17 radius uses; only the existing `--shadow-overlay` is needed.
- No new spacing scale. Tailwind defaults are sufficient.

## Token definitions

All tokens go inside the existing `@theme { ... }` block in `app/globals.css`. Tailwind v4 surfaces them automatically as utilities (e.g. `--color-fg-muted` → `text-fg-muted`, `--tracking-eyebrow` → `tracking-eyebrow`).

### Background base

| Token | Value | Notes |
|---|---|---|
| `--color-bg` | `#0b0b0b` | Replaces the loose `:root --background` var. |
| `--color-paper` | `#e8e4dc` | Warm light surface. Replaces the misleadingly-named `:root --foreground`. |

### Foreground — text/icons on dark backgrounds

| Token | Value | Replaces |
|---|---|---|
| `--color-fg` | `#ffffff` | `text-white`, old `--color-fg` |
| `--color-fg-muted` | `rgb(255 255 255 / 0.7)` | `text-white/70`, old `fg-strong` (0.8), old `fg-soft` (0.6) |
| `--color-fg-subtle` | `rgb(255 255 255 / 0.5)` | `text-white/50`, old `fg-secondary` (0.55), old `fg-tertiary` (0.45) |
| `--color-fg-faint` | `rgb(255 255 255 / 0.35)` | old `fg-muted` (0.4), old `fg-caption` (0.35), `text-white/40` |
| `--color-fg-ghost` | `rgb(255 255 255 / 0.2)` | old `fg-faint` (0.2), `text-white/20`, `text-white/25`, `text-white/30` |

### Foreground — text/icons on light backgrounds (new)

| Token | Value | Replaces |
|---|---|---|
| `--color-ink` | `#0b0b0b` | `text-black` |
| `--color-ink-muted` | `rgb(0 0 0 / 0.7)` | `text-black/80`, `text-black/70`, `text-black/65` |
| `--color-ink-subtle` | `rgb(0 0 0 / 0.5)` | `text-black/60`, `text-black/55`, `text-black/50`, `text-black/45` |
| `--color-ink-faint` | `rgb(0 0 0 / 0.3)` | `text-black/40`, `text-black/35`, `text-black/30`, `text-black/25` |
| `--color-ink-ghost` | `rgb(0 0 0 / 0.2)` | `text-black/20` |

### Surfaces — white tints on dark backgrounds

| Token | Value | Replaces |
|---|---|---|
| `--color-surface` | `rgb(255 255 255 / 0.05)` | old `surface` (0.06), `surface-subtle` (0.04), `bg-white/5` |
| `--color-surface-hover` | `rgb(255 255 255 / 0.1)` | old `surface-hover` (0.1), `surface-soft` (0.07), `surface-active` (0.09), `bg-white/10`, `bg-white/11` |
| `--color-surface-strong` | `rgb(255 255 255 / 0.15)` | `bg-white/15` |

### Surfaces — black tints on light backgrounds (new)

| Token | Value | Replaces |
|---|---|---|
| `--color-tint` | `rgb(0 0 0 / 0.05)` | `bg-black/3`, `bg-black/4`, `bg-black/5`, `bg-black/8` |
| `--color-tint-hover` | `rgb(0 0 0 / 0.1)` | `bg-black/10`, `bg-black/15` |
| `--color-tint-strong` | `rgb(0 0 0 / 0.2)` | `bg-black/20` |

### Edges (borders/dividers)

Two steps; the same scale is reused for both white-on-dark and black-on-light borders by Tailwind opacity utilities or by introducing parallel `edge-ink-*` if needed during migration. Default is the white variant; introduce `--color-edge-ink` only if the migration finds a black border that doesn't fit `border-ink/*`.

| Token | Value | Replaces |
|---|---|---|
| `--color-edge` | `rgb(255 255 255 / 0.1)` | old `divider` (0.07), old `edge` (0.08), `border-white/10` |
| `--color-edge-strong` | `rgb(255 255 255 / 0.2)` | old `edge-muted` (0.15), old `edge-strong` (0.2) |

For light surfaces, use `border-ink/10`, `border-ink/20` directly with the new `ink` color (or `border-ink-ghost` for the 0.2 case). Migration step replaces all `border-black/*` and `border-white/*` with these tokens.

### Overlay

| Token | Value | Notes |
|---|---|---|
| `--color-overlay` | `rgba(18, 18, 18, 0.7)` | Unchanged. Used for dropdowns/translucent dark panels. |

### Typography — families

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `var(--font-open-sauce-sans)` | Default body font. Used as `font-sans` (already Tailwind default). |
| `--font-display` | `var(--font-monsieur)` | Script display face. Used as `font-display`. |

The `html` rule in `globals.css` switches from `font-family: var(--font-open-sauce-sans), sans-serif;` to relying on Tailwind's `font-sans` resolution.

### Typography — tracking

11 inline values consolidate to 4 named tokens, named by intent:

| Token | Value | Replaces |
|---|---|---|
| `--tracking-tight` | `-0.05em` | `tracking-[-0.05em]`, `tracking-[-0.01em]`, `tracking-tight` |
| `--tracking-label` | `0.14em` | `tracking-[0.14em]`, `tracking-[0.08em]` |
| `--tracking-eyebrow` | `0.2em` | `tracking-[0.18em]`, `tracking-[0.2em]`, `tracking-[0.22em]`, `tracking-widest`, `tracking-wide`, `tracking-[0.25em]` |
| `--tracking-display` | `0.28em` | `tracking-[0.28em]` |

Tailwind's default `tracking-normal` stays available for the unmarked baseline.

### Motion — durations

| Token | Value | Replaces |
|---|---|---|
| `--duration-fast` | `150ms` | `duration-150` |
| `--duration-base` | `200ms` | `duration-200` |
| `--duration-slow` | `300ms` | `duration-300`, `duration-400`, `duration-500` |

### Shadow

| Token | Value | Notes |
|---|---|---|
| `--shadow-overlay` | `0 16px 40px rgb(0 0 0 / 0.35)` | Unchanged. The lone `shadow-2xl` usage stays as-is until a second use case appears. |

## Migration scope

A single PR ("big-bang") that:

1. Updates `app/globals.css` — replaces the existing `@theme` block with the new token set, removes the `:root --background` / `:root --foreground` block in favor of `--color-bg` / `--color-paper` and `var(--color-bg)` / `var(--color-paper)` references in the `html` rule.
2. Replaces every Tailwind color utility across `app/**/*.{tsx,ts}`:
   - `text-black` → `text-ink`, `text-black/80|70|65` → `text-ink-muted`, `text-black/60|55|50|45` → `text-ink-subtle`, `text-black/40|35|30|25` → `text-ink-faint`, `text-black/20` → `text-ink-ghost`
   - `text-white` → `text-fg`, `text-white/70` → `text-fg-muted`, `text-white/50|55|45` → `text-fg-subtle`, `text-white/40|35` → `text-fg-faint`, `text-white/20|25|30` → `text-fg-ghost`
   - `bg-black` → `bg-bg` (or `bg-ink` if it represents dark *content* on a light bg, decided per-site), `bg-black/3|4|5|8` → `bg-tint`, `bg-black/10|15` → `bg-tint-hover`, `bg-black/20` → `bg-tint-strong`, `bg-black/60|75|80` → keep as opacity literals against `bg-bg`/`bg-ink` (escalation surfaces)
   - `bg-white` → `bg-paper` (for the warm-light surface) or `bg-fg` (for pure white), decided per-site, `bg-white/5` → `bg-surface`, `bg-white/10|11` → `bg-surface-hover`, `bg-white/15` → `bg-surface-strong`, `bg-white/80|90|95` keep as is for now (escalation cases)
   - `border-black/*`, `border-white/*` → `border-edge`, `border-edge-strong`, or color-token + opacity (`border-ink/10`, `border-fg/10`) per the table above
   - All custom `tracking-[...]` arbitrary values → the four named tokens
   - All `duration-150|200|300|400|500` → `duration-fast|base|slow`
3. Replaces inline `style={{ ... }}` raw hex/rgba values:
   - `#0b0b0b` → `var(--color-bg)`
   - `#ffffff` → `var(--color-fg)`
   - `#e0e0e0` → `var(--color-fg-faint)` (or `var(--color-paper)` if it represents the warm surface — decided per-site)
   - `rgba(0,0,0,0.25)`, `rgba(0,0,0,0.85)`, etc. → nearest `var(--color-ink-*)` token
   - `rgba(255,255,255,0.35)`, `rgba(255,255,255,0.18)`, etc. → nearest `var(--color-fg-*)` token
   - `rgba(18,18,18,0.7)` → `var(--color-overlay)`
   - Animated/dynamic `rgba(255,255,255,${v})` template strings stay as raw rgba (these are intentional gradients/fades, not semantic colors).
4. Removes the now-redundant `font-[var(--font-open-sauce-sans)]` patterns in favor of `font-sans`.

## Validation

After migration, the rendered pages should be visually indistinguishable from before. Validation steps:

1. `npm run build` and `npm run lint` pass.
2. Run dev server, walk through every route (`/`, `/products`, `/products/[category]`, `/products/[category]/[handle]`, `/community`, `/mantra`, all `(policies)` routes), confirm hover/active/focus states for nav, cart drawer, newsletter popup, accordions.
3. Spot-check that the two warm-light areas (footer / certain hero sections) still render as `#e8e4dc`, not pure white.
4. Confirm no orphan raw hex/rgba in `app/**/*.{tsx,ts}` (excluding the dynamic-template gradients flagged above).

## Open questions for migration

These are decided during implementation, not now:

- For each `bg-black` and `bg-white` (no opacity) usage, the migrator picks `bg-bg`/`bg-ink` vs `bg-paper`/`bg-fg` based on the surrounding context (is this the page background, or is it a dark "card on a light page"?). Done case-by-case in the implementation plan.
- A handful of escalation tints (`bg-black/60|75|80`, `bg-white/80|90|95`) don't fit the 3-step surface scale and are kept as opacity-on-token (`bg-bg/80`, `bg-fg/95`). These are scrim/glass effects, not surfaces.
