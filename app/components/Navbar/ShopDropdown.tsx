"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SHOP_LINKS } from "./constants";

interface ShopDropdownProps {
  isDark: boolean;
  shopOpen: boolean;
  onMouseEnter: () => void;
  onShopLinkClick: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function ShopDropdown({ isDark, shopOpen, onMouseEnter, onShopLinkClick, dropdownRef, triggerRef }: ShopDropdownProps) {
  const [hoveredDropdown, setHoveredDropdown] = useState<number | null>(null);

  return (
    <div className="relative z-10" onMouseEnter={onMouseEnter}>
      <button ref={triggerRef} className="flex items-center gap-1.5 px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-opacity duration-150">
        Shop
        <ChevronDown size={10} strokeWidth={1.5} className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {shopOpen && (
          <motion.div ref={dropdownRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="absolute left-0 top-full pt-1 pb-2 min-w-[200px]">
            {SHOP_LINKS.map((link, i) => (
              <Link key={link.href} href={link.href} onClick={onShopLinkClick} onMouseEnter={() => setHoveredDropdown(i)} onMouseLeave={() => setHoveredDropdown(null)} className="relative block px-4 py-2.5 text-[0.6rem] tracking-[0.18em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-150">
                {hoveredDropdown === i && (
                  <motion.span
                    layoutId="dropdown-pill"
                    className="absolute inset-y-0 left-2 right-2 rounded-lg pointer-events-none"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
