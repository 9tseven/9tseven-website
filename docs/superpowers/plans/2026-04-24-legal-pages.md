# Legal / Policy Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render five footer-linked legal/policy pages (`/faq`, `/privacy`, `/returns`, `/shipping`, `/terms`) from JSON files in `policies/` via a single slug-driven Next.js dynamic route.

**Architecture:** One dynamic route at `app/[slug]/page.tsx` reads a typed JSON file and renders through a shared `PolicyPage` component that has two render modes — accordion (FAQ) and section list (all others). The product page's existing `AccordionItem` is extracted into the shared component so both callers use the same visuals.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4.

**Important:** This project does NOT use a test framework — there is no `jest`, `vitest`, or `test` script. Verification uses TypeScript (`npx tsc --noEmit`), the Next.js build (`npm run build`), and manual browser checks against `npm run dev`. Do not invent unit tests; follow the verification steps exactly as written.

**Next.js 16 note:** `params` in page and metadata functions is a `Promise` and must be awaited. `generateStaticParams` + `dynamicParams = false` prerenders only the five listed slugs and returns 404 for anything else.

---

## File Structure

**Create:**
- `app/components/PolicyPage/types.ts` — shared TypeScript types + slug list
- `app/components/PolicyPage/AccordionItem.tsx` — copied from products (see Task 2)
- `app/components/PolicyPage/FaqList.tsx` — client component, accordion of Q&A
- `app/components/PolicyPage/SectionList.tsx` — server component, sections + optional intro/rates/contact
- `app/components/PolicyPage/index.tsx` — top-level renderer dispatching to Faq/Section
- `app/[slug]/page.tsx` — dynamic route that imports the JSON and renders `<PolicyPage>`

**Modify:**
- `app/products/components/ProductAccordion/index.tsx` — update `AccordionItem` import path
- `app/products/components/ProductAccordion/AccordionItem.tsx` — delete (moved)

**Untouched:**
- All five `policies/*.json` files
- `app/components/Footer/index.tsx` (links already use the correct slugs)

---

## Task 1: Shared types and slug list

**Files:**
- Create: `app/components/PolicyPage/types.ts`

- [ ] **Step 1: Create the types file**

Write `app/components/PolicyPage/types.ts`:

```ts
export const POLICY_SLUGS = ["faq", "privacy", "returns", "shipping", "terms"] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ShippingRate {
  region: string;
  estimatedDelivery: string;
  standardShipping: string;
}

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  note?: string;
  rates?: ShippingRate[];
  contact?: Record<string, string>;
}

export interface PolicyPageData {
  title: string;
  accordion: boolean;
  lastUpdated?: string;
  intro?: string[];
  items?: FaqItem[];
  sections?: PolicySection[];
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/PolicyPage/types.ts
git commit -m "feat(policy): add shared types and slug list for policy pages"
```

---

## Task 2: Move `AccordionItem` to the shared location

The existing accordion visuals live at `app/products/components/ProductAccordion/AccordionItem.tsx`. Move the file so both the product page and the new policy pages can import it. The product page's `ProductAccordion/index.tsx` is the only current consumer and must have its import updated.

**Files:**
- Create: `app/components/PolicyPage/AccordionItem.tsx`
- Modify: `app/products/components/ProductAccordion/index.tsx` (line 4)
- Delete: `app/products/components/ProductAccordion/AccordionItem.tsx`

- [ ] **Step 1: Create the file at the new location**

Write `app/components/PolicyPage/AccordionItem.tsx` with the same content as the current product version:

```tsx
"use client";

import type { ReactNode } from "react";
import { useId } from "react";

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  const bodyId = useId();
  const headerId = useId();

  return (
    <div className="border-b border-black/8 last:border-b-0">
      <button
        id={headerId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-black/60">{title}</span>
        <span className="text-[10px] text-black/60" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="text-xs text-black/70 leading-relaxed pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update the product accordion's import**

In `app/products/components/ProductAccordion/index.tsx`, change line 4 from:

```tsx
import AccordionItem from "./AccordionItem";
```

to:

```tsx
import AccordionItem from "@/app/components/PolicyPage/AccordionItem";
```

- [ ] **Step 3: Delete the old file**

```bash
rm app/products/components/ProductAccordion/AccordionItem.tsx
```

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manually verify the product page still works**

Run: `npm run dev` (keep it running through later tasks)
Open a product detail page and confirm the right-hand accordion (Description / Material / Sizing / Shipping) expands and collapses as before. No visual or behavior change expected.

- [ ] **Step 6: Commit**

```bash
git add app/components/PolicyPage/AccordionItem.tsx app/products/components/ProductAccordion/
git commit -m "refactor(accordion): extract AccordionItem to shared PolicyPage module"
```

---

## Task 3: `FaqList` component

Client component that renders the accordion for FAQ pages. Owns the open/closed state — only one item open at a time, matching the product page behavior.

**Files:**
- Create: `app/components/PolicyPage/FaqList.tsx`

- [ ] **Step 1: Create the file**

Write `app/components/PolicyPage/FaqList.tsx`:

```tsx
"use client";

import { useState } from "react";
import AccordionItem from "./AccordionItem";
import type { FaqItem } from "./types";

interface FaqListProps {
  items: FaqItem[];
}

export default function FaqList({ items }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-black/8">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.question}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        >
          <p>{item.answer}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/PolicyPage/FaqList.tsx
git commit -m "feat(policy): add FaqList accordion component"
```

---

## Task 4: `SectionList` component

Server component that renders the non-accordion layout: section headings, paragraphs, plus the optional `note`, `rates`, and `contact` variants.

**Files:**
- Create: `app/components/PolicyPage/SectionList.tsx`

- [ ] **Step 1: Create the file**

Write `app/components/PolicyPage/SectionList.tsx`:

```tsx
import type { PolicySection } from "./types";

interface SectionListProps {
  sections: PolicySection[];
}

export default function SectionList({ sections }: SectionListProps) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((section, index) => (
        <section key={index} className="flex flex-col gap-4">
          <h2 className="text-sm uppercase tracking-[0.14em] font-semibold">
            {section.heading}
          </h2>

          {section.paragraphs?.map((paragraph, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="text-sm leading-relaxed text-black/70"
            >
              {paragraph}
            </p>
          ))}

          {section.note && (
            <p className="text-[0.7rem] tracking-[0.08em] uppercase text-black/45">
              {section.note}
            </p>
          )}

          {section.rates && (
            <div className="mt-2 border-t border-black/8">
              <div className="grid grid-cols-3 gap-4 py-3 border-b border-black/8 text-[0.6rem] tracking-[0.14em] uppercase text-black/45">
                <span>Region</span>
                <span>Estimated Delivery</span>
                <span>Standard Shipping</span>
              </div>
              {section.rates.map((rate, rateIndex) => (
                <div
                  key={rateIndex}
                  className="grid grid-cols-3 gap-4 py-3 border-b border-black/8 last:border-b-0 text-xs text-black/70"
                >
                  <span className="font-semibold text-black">{rate.region}</span>
                  <span>{rate.estimatedDelivery}</span>
                  <span>{rate.standardShipping}</span>
                </div>
              ))}
            </div>
          )}

          {section.contact && (
            <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-xs text-black/70">
              {Object.entries(section.contact).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="uppercase tracking-[0.14em] text-[0.6rem] text-black/45 self-center">
                    {key}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/PolicyPage/SectionList.tsx
git commit -m "feat(policy): add SectionList for non-accordion policy pages"
```

---

## Task 5: `PolicyPage` shell

The top-level renderer. Given a `PolicyPageData`, render the page shell (title, optional `lastUpdated`, optional `intro`) then dispatch to `FaqList` or `SectionList` based on the `accordion` flag. This is a server component; it simply renders whichever child is needed.

**Files:**
- Create: `app/components/PolicyPage/index.tsx`

- [ ] **Step 1: Create the file**

Write `app/components/PolicyPage/index.tsx`:

```tsx
import FaqList from "./FaqList";
import SectionList from "./SectionList";
import type { PolicyPageData } from "./types";

interface PolicyPageProps {
  data: PolicyPageData;
}

export default function PolicyPage({ data }: PolicyPageProps) {
  return (
    <main
      data-nav-theme="light"
      className="bg-white min-h-screen pt-24 pb-24 text-black"
    >
      <div className="max-w-3xl mx-auto px-8">
        <header className="mb-12">
          <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold">
            {data.title}
          </h1>
          {data.lastUpdated && (
            <p className="mt-3 text-[0.6rem] tracking-widest uppercase text-black/45">
              Last updated: {data.lastUpdated}
            </p>
          )}
        </header>

        {data.intro && data.intro.length > 0 && (
          <div className="flex flex-col gap-4 mb-12">
            {data.intro.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-black/70">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {data.accordion
          ? data.items && <FaqList items={data.items} />
          : data.sections && <SectionList sections={data.sections} />}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/PolicyPage/index.tsx
git commit -m "feat(policy): add PolicyPage shell dispatching to accordion or sections"
```

---

## Task 6: Dynamic `[slug]` route

The route file imports each JSON file statically (safer than dynamic `import()` with template strings) and looks up by slug. `generateStaticParams` plus `dynamicParams = false` prerenders exactly the five known slugs and returns a 404 for anything else — no manual `notFound()` branch needed.

**Files:**
- Create: `app/[slug]/page.tsx`

- [ ] **Step 1: Create the file**

Write `app/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import PolicyPage from "@/app/components/PolicyPage";
import { POLICY_SLUGS, type PolicyPageData, type PolicySlug } from "@/app/components/PolicyPage/types";
import faq from "@/policies/faq.json";
import privacy from "@/policies/privacy.json";
import returns from "@/policies/returns.json";
import shipping from "@/policies/shipping.json";
import terms from "@/policies/terms.json";

const POLICIES: Record<PolicySlug, PolicyPageData> = {
  faq: faq as PolicyPageData,
  privacy: privacy as PolicyPageData,
  returns: returns as PolicyPageData,
  shipping: shipping as PolicyPageData,
  terms: terms as PolicyPageData,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: PolicySlug }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${POLICIES[slug].title} – 9TSEVEN` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: PolicySlug }>;
}) {
  const { slug } = await params;
  return <PolicyPage data={POLICIES[slug]} />;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds; output should show the five routes `/faq`, `/privacy`, `/returns`, `/shipping`, `/terms` as prerendered static pages.

- [ ] **Step 4: Commit**

```bash
git add app/[slug]/page.tsx
git commit -m "feat(policy): add slug-driven dynamic route for legal/policy pages"
```

---

## Task 7: Manual verification and final commit

No unit tests exist — verification is done in the browser against `npm run dev`.

- [ ] **Step 1: Run dev server**

Run: `npm run dev`

- [ ] **Step 2: Click through every footer link**

From any page, scroll to the footer and click each of: `Return & Exchange`, `Terms of Service`, `FAQ`, `Privacy Policy`, `Shipping Policy`.

Expected for each:
- Page loads without console errors.
- Title (uppercase) displays at the top.
- For `/privacy`: `Last updated: 19 September 2025` shows under the title.
- For `/privacy` and `/terms`: `intro` paragraphs render above the sections.
- For `/shipping`: the rates section shows three rows (Denmark, European Union, International) in a three-column grid.
- For `/privacy` and `/terms`: the contact block at the bottom shows labeled key/value rows.
- For `/faq`: items render as an accordion; clicking a question opens the answer, clicking another closes the first and opens the second.

- [ ] **Step 3: Verify the navbar theme**

Each policy page sets `data-nav-theme="light"` on `<main>`. Confirm the navbar renders in the light-theme variant (same as the products pages), not the dark variant used on the home page.

- [ ] **Step 4: Verify the product page accordion still works**

Navigate to any product detail page and expand/collapse each of the four accordion rows. No regression expected.

- [ ] **Step 5: Verify 404 for unknown slugs**

Visit `http://localhost:3000/not-a-real-policy`.
Expected: Next.js 404 page (not the policy layout with broken content).

- [ ] **Step 6: Final lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds; five policy routes appear as static in the route summary.

- [ ] **Step 7: Commit only if there are outstanding changes**

```bash
git status
```

If clean, this step is a no-op. If any fixups were needed during verification, commit them with a targeted message.
