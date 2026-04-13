# Manifesto Image Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace scroll-tied image animations in ManifestoSection with viewport-triggered one-shot animations that stay visible after appearing.

**Architecture:** Each `ManifestImage` will use Framer Motion's `whileInView` + `viewport={{ once: true }}` declarative API instead of `useTransform`/`useScroll`. The `scrollYProgress` prop is removed from the component. Mobile images, currently unanimated, receive the same treatment via `motion.div`. The `useScroll` hook in `ManifestoSection` is retained because `ManifestoLine` still depends on it.

**Tech Stack:** Next.js, Framer Motion (`motion/react`), Tailwind CSS

---

### Task 1: Update `ManifestImage` to use `whileInView`

**Files:**
- Modify: `app/components/ManifestoSection/index.tsx`

- [ ] **Step 1: Remove `useTransform` from the import and drop the `scrollYProgress` prop**

In `app/components/ManifestoSection/index.tsx`, update line 4 — remove `useTransform` (keep `useScroll` as ManifestoLine still needs it via scrollYProgress):

```tsx
import { motion, useScroll } from "motion/react";
```

Update the `ManifestImage` function signature — remove `scrollYProgress` from both the destructure and the inline type:

```tsx
function ManifestImage({ src, alt, position, index }: { src: string; alt: string; position: (typeof IMAGE_POSITIONS)[number]; index: number }) {
```

- [ ] **Step 2: Replace the transform logic with `whileInView` props**

Delete these three lines inside `ManifestImage`:

```tsx
const start = index * 0.15;
const end = start + 0.25;
const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
const y = useTransform(scrollYProgress, [start, end], [40, 0]);
```

Replace the `motion.div` JSX with:

```tsx
return (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.2 }}
    style={{
      top: position.top,
      left: position.left,
      rotate: position.rotate,
      zIndex: position.zIndex,
    }}
    className="absolute w-[50%] aspect-4/3 shadow-xl overflow-hidden"
  >
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </motion.div>
);
```

- [ ] **Step 3: Remove `scrollYProgress` prop from desktop `ManifestImage` call sites**

In the desktop image block (inside the `hidden md:block` div), update the map:

```tsx
{MANIFEST_IMAGES.map((img, i) => (
  <ManifestImage key={i} src={img.src} alt={img.alt} position={IMAGE_POSITIONS[i]} index={i} scrollYProgress={scrollYProgress} />
))}
```

to:

```tsx
{MANIFEST_IMAGES.map((img, i) => (
  <ManifestImage key={i} src={img.src} alt={img.alt} position={IMAGE_POSITIONS[i]} index={i} />
))}
```

- [ ] **Step 4: Verify the dev server compiles with no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors)

- [ ] **Step 5: Commit**

```bash
git add app/components/ManifestoSection/index.tsx
git commit -m "feat: replace scroll-tied image animation with whileInView in ManifestoSection"
```

---

### Task 2: Animate mobile images

**Files:**
- Modify: `app/components/ManifestoSection/index.tsx`

- [ ] **Step 1: Replace mobile `<div>` elements with animated `motion.div`**

In the `md:hidden` mobile block, replace the existing map:

```tsx
{MANIFEST_IMAGES.map((img, i) => (
  <div
    key={i}
    className="absolute w-[40%] aspect-3/4 shadow-xl overflow-hidden"
    style={{
      top: `${i * 18}%`,
      left: `${5 + i * 25}%`,
      rotate: `${IMAGE_POSITIONS[i].rotate}deg`,
      zIndex: IMAGE_POSITIONS[i].zIndex,
    }}
  >
    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
  </div>
))}
```

with:

```tsx
{MANIFEST_IMAGES.map((img, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.2 }}
    className="absolute w-[40%] aspect-3/4 shadow-xl overflow-hidden"
    style={{
      top: `${i * 18}%`,
      left: `${5 + i * 25}%`,
      rotate: `${IMAGE_POSITIONS[i].rotate}deg`,
      zIndex: IMAGE_POSITIONS[i].zIndex,
    }}
  >
    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
  </motion.div>
))}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add app/components/ManifestoSection/index.tsx
git commit -m "feat: add whileInView entrance animation to mobile manifesto images"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify desktop behaviour**

Open `http://localhost:3000` in a browser and scroll to the Manifesto section. Confirm:
- All three images are invisible before the section scrolls into view
- Each image fades and slides up (y: 40→0) with ~0.2s stagger between them
- Scrolling back up does **not** hide the images again

- [ ] **Step 3: Verify mobile behaviour**

In browser DevTools, switch to a mobile viewport (e.g. iPhone 12, 390px wide). Scroll to the Manifesto section. Confirm:
- The three stacked mobile images animate in the same way as desktop
- Scrolling back up does not hide them

- [ ] **Step 4: Stop the dev server** (`Ctrl+C`)
