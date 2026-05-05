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
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
        <div ref={containerRef} className="relative">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase text-black/70 border border-black/20 px-3 py-1.5 hover:text-black hover:border-black/40 transition-colors duration-150">
            <span aria-hidden="true">⇌</span>
            <span>Filter</span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div role="menu" initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.14, ease: "easeOut" }} style={{ transformOrigin: "top left" }} className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-55 bg-white border border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                  <span className="text-[8px] tracking-[0.22em] uppercase text-black/35">Category</span>
                  {currentCategory && <span className="text-[8px] tracking-[0.18em] uppercase text-black/45">{currentCategory.label}</span>}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-colors duration-150 ${active ? "text-black bg-black/4" : "text-black/65 hover:text-black hover:bg-black/3"}`}
                        >
                          <span className="flex-1 text-left">{label}</span>
                          {active && <Check size={12} strokeWidth={2} className="text-black" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="h-px bg-black/8 mx-3" />

                <div className="px-3 pt-2.5 pb-1.5 text-[8px] tracking-[0.22em] uppercase text-black/35">Sort by</div>
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
                          className={`group w-full flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-colors duration-150 ${active ? "text-black bg-black/4" : "text-black/65 hover:text-black hover:bg-black/3"}`}
                        >
                          <Icon size={12} strokeWidth={1.5} className={active ? "text-black" : "text-black/45 group-hover:text-black/70"} />
                          <span className="flex-1 text-left">{label}</span>
                          {active && <Check size={12} strokeWidth={2} className="text-black" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-[9px] tracking-[0.15em] uppercase text-black/30">{sorted.length} Products</span>
      </div>

      <ProductsGrid products={sorted} />
    </>
  );
}
