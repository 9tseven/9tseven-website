"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, Sparkles } from "lucide-react";
import ProductsGrid from "./ProductsGrid";
import { SHOP_MENU } from "@/app/components/Navbar/constants";
import type { Product } from "@/app/components/FeaturedProductsSection/types";

type SortKey = "latest" | "price-desc" | "price-asc";

const SORT_OPTIONS: { key: SortKey; label: string; Icon: typeof Sparkles }[] = [
  { key: "latest", label: "Latest Arrivals", Icon: Sparkles },
  { key: "price-desc", label: "Price: High to Low", Icon: ArrowDownWideNarrow },
  { key: "price-asc", label: "Price: Low to High", Icon: ArrowUpNarrowWide },
];

const CATEGORY_OPTIONS = SHOP_MENU.map(({ label, href }) => ({ label, href }));

function sortProducts(products: readonly Product[], key: SortKey): Product[] {
  const list = [...products];
  switch (key) {
    case "latest":
      return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
  }
}

interface ProductsListingProps {
  products: readonly Product[];
}

export default function ProductsListing({ products }: ProductsListingProps) {
  const [open, setOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentCategory = CATEGORY_OPTIONS.find((c) => c.href === pathname) ?? CATEGORY_OPTIONS.find((c) => c.href === "/products");

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sorted = useMemo(() => sortProducts(products, sortKey), [products, sortKey]);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
        <div ref={containerRef} className="relative">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 text-[9px] tracking-eyebrow uppercase text-ink-muted border border-ink/20 px-3 py-1.5 hover:text-ink hover:border-ink/40 transition-colors duration-fast">
            <span aria-hidden="true">⇌</span>
            <span>Filter</span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div role="menu" initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.14, ease: "easeOut" }} style={{ transformOrigin: "top left" }} className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-55 bg-fg border border-ink/10 shadow-[0_8px_24px_rgb(0_0_0/0.08)] rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                  <span className="text-[8px] tracking-eyebrow uppercase text-ink-faint">Category</span>
                  {currentCategory && <span className="text-[8px] tracking-eyebrow uppercase text-ink-subtle">{currentCategory.label}</span>}
                </div>
                <ul className="py-1">
                  {CATEGORY_OPTIONS.map(({ label, href }) => {
                    const active = currentCategory?.href === href;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => setOpen(false)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-eyebrow uppercase transition-colors duration-fast ${active ? "text-ink bg-tint" : "text-ink-muted hover:text-ink hover:bg-tint"}`}
                        >
                          <span className="flex-1 text-left">{label}</span>
                          {active && <Check size={12} strokeWidth={2} className="text-ink" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="h-px bg-tint mx-3" />

                <div className="px-3 pt-2.5 pb-1.5 text-[8px] tracking-eyebrow uppercase text-ink-faint">Sort by</div>
                <ul className="py-1">
                  {SORT_OPTIONS.map(({ key, label, Icon }) => {
                    const active = sortKey === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => {
                            setSortKey(key);
                            setOpen(false);
                          }}
                          className={`group w-full flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-eyebrow uppercase transition-colors duration-fast ${active ? "text-ink bg-tint" : "text-ink-muted hover:text-ink hover:bg-tint"}`}
                        >
                          <Icon size={12} strokeWidth={1.5} className={active ? "text-ink" : "text-ink-subtle group-hover:text-ink-muted"} />
                          <span className="flex-1 text-left">{label}</span>
                          {active && <Check size={12} strokeWidth={2} className="text-ink" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-[9px] tracking-label uppercase text-ink-faint">{sorted.length} Products</span>
      </div>

      <ProductsGrid products={sorted} />
    </>
  );
}
