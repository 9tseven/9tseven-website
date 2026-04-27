"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SHOP_MENU } from "./constants";
import type { NavPreviews, PreviewItem } from "./types";

interface ShopDropdownProps {
  shopOpen: boolean;
  previews: NavPreviews;
  onShopLinkClick: () => void;
}

function categorySlug(productType: string): string {
  return productType.toLowerCase().replace(/\s+/g, "-");
}

function previewsForHref(href: string, previews: NavPreviews): PreviewItem[] {
  if (href === "/products/new-arrivals") return previews.newArrivals;
  if (href === "/products") return previews.allProducts;
  return [];
}

export default function ShopDropdown({ shopOpen, previews, onShopLinkClick }: ShopDropdownProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const category = SHOP_MENU[activeCategory];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!shopOpen) setActiveCategory(0);
  }, [shopOpen]);

  return (
    <AnimatePresence>
      {shopOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.97, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -4 }} transition={{ duration: 0.15, ease: "easeOut" }} className="absolute p-4 top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex bg-[rgba(18,18,18,0.7)] backdrop-blur-md rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.35)]" style={{ transformOrigin: "top center" }}>
          {/* Left column — categories */}
          <div className="py-3 border-r border-white/[0.07]" style={{ minWidth: "170px" }}>
            {SHOP_MENU.map((item, i) => (
              <div key={item.href} className="relative mx-1.5">
                {activeCategory === i && <motion.div layoutId="dropdown-pill" className="absolute inset-0 rounded-[10px] bg-white/9" transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }} />}
                <Link href={item.href} onClick={onShopLinkClick} onMouseEnter={() => setActiveCategory(i)} className="relative block px-4 py-2.5 text-[0.68rem] tracking-[0.16em] uppercase text-white/45 hover:text-white transition-colors duration-150 z-10">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right column — subcategories or product previews */}
          <div className="overflow-hidden" style={{ width: "380px", minHeight: "228px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeCategory} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.12 }}>
                {category.type === "subcategories" ? (
                  <div className="py-3">
                    <p className="px-5 py-2.5 text-[0.6rem] tracking-[0.18em] uppercase text-white/20">{category.label}</p>
                    {category.subcategories.map((sub) => (
                      <Link key={sub.href} href={sub.href} onClick={onShopLinkClick} className="block mx-1.5 px-4 py-2.5 text-[0.68rem] tracking-[0.14em] uppercase text-white/55 hover:text-white hover:bg-white/[0.07] rounded-[10px] transition-colors duration-150">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <ProductPreviewPanel
                    category={category}
                    items={previewsForHref(category.href, previews)}
                    onShopLinkClick={onShopLinkClick}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ProductPreviewPanelProps {
  category: { label: string; href: string; type: "products" };
  items: PreviewItem[];
  onShopLinkClick: () => void;
}

function ProductPreviewPanel({ category, items, onShopLinkClick }: ProductPreviewPanelProps) {
  const hasItems = items.length > 0;

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        {hasItems
          ? items.slice(0, 3).map((item) => {
              const href = `/products/${categorySlug(item.productType)}/${item.handle}`;
              return (
                <Link key={item.handle} href={href} onClick={onShopLinkClick} className="flex-1 min-w-0 flex flex-col gap-1.5 group">
                  <div className="w-full aspect-3/4 rounded-lg bg-white/6 overflow-hidden relative group-hover:bg-white/10 transition-colors duration-150">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText ?? item.title}
                        fill
                        sizes="116px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">▣</span>
                    )}
                  </div>
                  <span className="text-[0.6rem] tracking-widest uppercase text-white/35 text-center group-hover:text-white/60 transition-colors duration-150 truncate">
                    {item.title}
                  </span>
                </Link>
              );
            })
          : [1, 2, 3].map((n) => (
              <div key={n} className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="w-full aspect-3/4 rounded-lg bg-white/6 border border-dashed border-white/15 flex items-center justify-center">
                  <span className="text-white/20 text-xs">▣</span>
                </div>
                <span className="text-[0.6rem] tracking-widest uppercase text-white/35 text-center">Product_0{n}</span>
              </div>
            ))}
      </div>
      <Link href={category.href} onClick={onShopLinkClick} className="self-end text-[0.62rem] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors duration-150">
        See all →
      </Link>
    </div>
  );
}
