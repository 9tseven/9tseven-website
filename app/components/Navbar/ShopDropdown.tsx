"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SHOP_MENU } from "./constants";

interface ShopDropdownProps {
  shopOpen: boolean;
  onShopLinkClick: () => void;
}

export default function ShopDropdown({ shopOpen, onShopLinkClick }: ShopDropdownProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const category = SHOP_MENU[activeCategory];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!shopOpen) setActiveCategory(0);
  }, [shopOpen]);

  return (
    <AnimatePresence>
      {shopOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex bg-[rgba(18,18,18,0.92)] backdrop-blur-md rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          style={{ transformOrigin: "top center" }}
        >
          {/* Left column — categories */}
          <div className="py-2.5 border-r border-white/[0.07]" style={{ minWidth: "150px" }}>
            {SHOP_MENU.map((item, i) => (
              <div key={item.href} className="relative mx-1.5">
                {activeCategory === i && (
                  <motion.div
                    layoutId="dropdown-pill"
                    className="absolute inset-0 rounded-[10px] bg-white/[0.09]"
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  />
                )}
                <Link
                  href={item.href}
                  onClick={onShopLinkClick}
                  onMouseEnter={() => setActiveCategory(i)}
                  className="relative block px-4 py-2 text-[0.6rem] tracking-[0.16em] uppercase text-white/45 hover:text-white transition-colors duration-150 z-10"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right column — subcategories or product previews */}
          <div className="flex-1 overflow-hidden" style={{ minWidth: "170px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.12 }}
              >
                {category.type === "subcategories" ? (
                  <div className="py-2.5">
                    <p className="px-5 pb-2 text-[0.55rem] tracking-[0.18em] uppercase text-white/20">
                      {category.label}
                    </p>
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onShopLinkClick}
                        className="block mx-1.5 px-4 py-2 text-[0.6rem] tracking-[0.14em] uppercase text-white/55 hover:text-white hover:bg-white/[0.07] rounded-[10px] transition-colors duration-150"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 flex gap-2 items-start">
                    {[1, 2, 3].map((n) => (
                      <Link
                        key={n}
                        href={`${category.href}?product=${n}`}
                        onClick={onShopLinkClick}
                        className="flex-1 flex flex-col gap-1.5 group"
                      >
                        <div className="w-full aspect-[3/4] rounded-lg bg-white/[0.06] border border-dashed border-white/15 flex items-center justify-center group-hover:bg-white/[0.10] transition-colors duration-150">
                          <span className="text-white/20 text-xs">▣</span>
                        </div>
                        <span className="text-[0.5rem] tracking-[0.1em] uppercase text-white/35 text-center group-hover:text-white/60 transition-colors duration-150">
                          Product_0{n}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
