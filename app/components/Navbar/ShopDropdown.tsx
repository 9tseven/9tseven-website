"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { SHOP_MENU } from "./constants";
import type { NavPreviews, PreviewItem } from "./types";

// Layout knobs
const PREVIEW_COUNT = 3;
const TILE_WIDTH = 110;
const TILE_GAP = 12;
const PANEL_PADDING_X = 16;
const PANEL_PADDING_Y = 12;
const TILE_TOTAL_COUNT = PREVIEW_COUNT + 1;
const RIGHT_COLUMN_WIDTH = TILE_TOTAL_COUNT * TILE_WIDTH + (TILE_TOTAL_COUNT - 1) * TILE_GAP + PANEL_PADDING_X * 2;

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
        <motion.div initial={{ opacity: 0, scale: 0.97, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -4 }} transition={{ duration: 0.15, ease: "easeOut" }} className="absolute p-4 top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex bg-overlay backdrop-blur-md rounded-[18px] overflow-hidden shadow-overlay" style={{ transformOrigin: "top center" }}>
          {/* Left column — categories */}
          <div className="py-3 border-r border-divider" style={{ minWidth: "170px" }}>
            {SHOP_MENU.map((item, i) => (
              <div key={item.href} className="relative mx-1.5">
                {activeCategory === i && <motion.div layoutId="dropdown-pill" className="absolute inset-0 rounded-[10px] bg-surface-active" transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }} />}
                <Link href={item.href} onClick={onShopLinkClick} onMouseEnter={() => setActiveCategory(i)} className="relative block px-4 py-2.5 text-[0.68rem] tracking-[0.16em] uppercase text-fg-tertiary hover:text-fg transition-colors duration-150 z-10">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right column — subcategories or product previews */}
          <div className="overflow-hidden" style={{ width: `${RIGHT_COLUMN_WIDTH}px` }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeCategory} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.12 }} className={category.type === "products" ? "h-full flex items-center" : ""}>
                {category.type === "subcategories" ? (
                  <div className="py-3">
                    <p className="mx-1.5 px-4 py-2.5 text-[0.68rem] tracking-[0.16em] uppercase text-fg">{category.label}</p>
                    {category.subcategories.map((sub) => (
                      <Link key={sub.href} href={sub.href} onClick={onShopLinkClick} className="block mx-1.5 px-4 py-2.5 text-[0.68rem] tracking-[0.14em] uppercase text-fg-secondary hover:text-fg hover:bg-surface-soft rounded-[10px] transition-colors duration-150">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <ProductPreviewPanel category={category} items={previewsForHref(category.href, previews)} onShopLinkClick={onShopLinkClick} />
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
  const previewItems = items.slice(0, PREVIEW_COUNT);
  const placeholderCount = Math.max(0, PREVIEW_COUNT - previewItems.length);
  const tileStyle = { width: `${TILE_WIDTH}px`, flex: "none" as const };

  return (
    <div
      className="flex items-start"
      style={{
        gap: `${TILE_GAP}px`,
        padding: `${PANEL_PADDING_Y}px ${PANEL_PADDING_X}px`,
      }}
    >
      {previewItems.map((item) => {
        const href = `/products/${categorySlug(item.productType)}/${item.handle}`;
        return (
          <Link key={item.handle} href={href} onClick={onShopLinkClick} className="flex flex-col gap-1.5 group" style={tileStyle}>
            <div className="w-full aspect-3/4 rounded-lg bg-surface overflow-hidden relative group-hover:bg-surface-hover transition-colors duration-150">{item.image ? <Image src={item.image.url} alt={item.image.altText ?? item.title} fill sizes={`${TILE_WIDTH}px`} className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-fg-faint text-xs">▣</span>}</div>
            <span className="text-[0.6rem] tracking-widest uppercase text-fg-caption text-center group-hover:text-fg-soft transition-colors duration-150 truncate">{item.title}</span>
          </Link>
        );
      })}
      {Array.from({ length: placeholderCount }).map((_, n) => (
        <div key={`placeholder-${n}`} className="flex flex-col gap-1.5" style={tileStyle}>
          <div className="w-full aspect-3/4 rounded-lg bg-surface border border-dashed border-edge-muted flex items-center justify-center">
            <span className="text-fg-faint text-xs">▣</span>
          </div>
          <span className="text-[0.6rem] tracking-widest uppercase text-fg-caption text-center">Product_0{n + 1}</span>
        </div>
      ))}

      <Link href={category.href} onClick={onShopLinkClick} className="flex flex-col gap-1.5 group" style={tileStyle}>
        <div className="w-full aspect-3/4 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-edge hover:border-edge-strong transition-colors duration-150 flex items-center justify-center">
          <Plus className="text-fg-muted group-hover:text-fg-strong transition-colors duration-150" size={32} strokeWidth={1.25} />
        </div>
        <span className="text-[0.6rem] tracking-widest uppercase text-fg-caption text-center group-hover:text-fg-soft transition-colors duration-150">See all</span>
      </Link>
    </div>
  );
}
