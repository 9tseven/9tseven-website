# Manifesto Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scroll-driven manifesto section below the hero where 10 manifesto lines illuminate sequentially as the user scrolls through.

**Architecture:** A single `"use client"` component using `useScroll` + `useTransform` from `motion/react`. A `useRef` targets the section element; scroll progress drives per-line opacity transforms. The left half of the section is a plain empty div reserved for future image work.

**Tech Stack:** Next.js 16 App Router, React 19, motion/react 12, Tailwind CSS v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/components/ManifestoSection.tsx` | Full component — layout + scroll animation |
| Modify | `app/page.tsx` | Add `<ManifestoSection />` below `<HeroSection />` |

---

### Task 1: Create `ManifestoSection.tsx` — static layout

**Files:**
- Create: `app/components/ManifestoSection.tsx`

- [ ] **Step 1: Create the component with static layout (no animation yet)**

Create `app/components/ManifestoSection.tsx` with this exact content:

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";

const LINES = [
  "Gratitude. Thank you for this one life.",
  "Create a space for diversity. We are all the same.",
  "It's you vs you. At your own pace, in your own time.",
  "Welcome all feelings. To appreciate the highs, we have to appreciate the lows.",
  "Nothing changes if nothing changes. Start now and improve later.",
  "Challenge your limits. Growth happens when you step outside your comfort zone.",
  "Fuel your passion, not just your body. What drives you is as important as what nourishes you.",
  "You're always developing, always evolving. Enjoy the process.",
  "Holistic health. Invest in your physical, mental, and emotional well-being.",
  "Community. Create a space for inspiration & human connection.",
];

function ManifestoLine({
  text,
  inputRange,
  scrollYProgress,
}: {
  text: string;
  inputRange: [number, number];
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollYProgress, inputRange, [0.12, 1]);
  return (
    <motion.p style={{ opacity }} className="text-sm leading-relaxed text-black">
      {text}
    </motion.p>
  );
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      data-nav-theme="light"
      className="min-h-screen w-full bg-white flex"
    >
      {/* Left column — reserved for images */}
      <div className="w-1/2" data-image-area="" />

      {/* Right column — manifesto */}
      <div className="w-1/2 flex items-center py-24 pr-16">
        <div className="max-w-sm">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-black/40 mb-3">
            9TSEVEN
          </p>
          <h2 className="text-2xl font-light tracking-[0.12em] uppercase text-black mb-1">
            Manifesto
          </h2>
          <p className="text-xs text-black/50 italic mb-6">
            A guidance of living.
          </p>
          <div className="w-8 h-px bg-black/20 mb-8" />
          <div className="flex flex-col gap-4">
            {LINES.map((line, i) => {
              const start = 0.1 + i * 0.072;
              const end = 0.2 + i * 0.072;
              return (
                <ManifestoLine
                  key={i}
                  text={line}
                  inputRange={[start, end]}
                  scrollYProgress={scrollYProgress}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /path/to/9tseven-website && npx tsc --noEmit
```

Expected: no errors. If you see `MotionValue` not found, check the import path is `motion/react` (not `framer-motion`).

- [ ] **Step 3: Commit**

```bash
git add app/components/ManifestoSection.tsx
git commit -m "feat: add ManifestoSection component with scroll-driven animation"
```

---

### Task 2: Wire `ManifestoSection` into the page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Import and add `ManifestoSection` below `HeroSection`**

Replace the contents of `app/page.tsx` with:

```tsx
import HeroSection from "./components/HeroSection";
import ManifestoSection from "./components/ManifestoSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ManifestoSection />
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add ManifestoSection to home page"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in the browser.

- [ ] **Step 2: Check the layout**

Scroll past the hero. You should see:
- White section occupying at least the full viewport height
- Right half: eyebrow `9TSEVEN`, heading `MANIFESTO`, italic subtitle, thin divider line, 10 manifesto lines
- Left half: empty (no content, no background)
- All 10 lines visible but very dim (opacity ~0.12)

- [ ] **Step 3: Check the scroll animation**

Scroll slowly through the manifesto section. Lines should brighten one by one top-to-bottom as you scroll. By the time the section exits the viewport, all lines should be fully lit (opacity 1.0).

- [ ] **Step 4: Check the navbar theme switch**

Scroll from the hero into the manifesto section. The navbar text should switch from white to black as it crosses the section boundary.

- [ ] **Step 5: Check mobile layout**

Resize to mobile width (~375px). The two-column layout will stack — that's acceptable for now since the left column is empty. If the right column text overflows, add `pl-6` to the right column div in `ManifestoSection.tsx`.

- [ ] **Step 6: Final commit if any fixes were made**

```bash
git add -p
git commit -m "fix: manifesto section layout adjustments"
```
