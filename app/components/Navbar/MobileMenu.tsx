"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import BrandLockup from "../BrandLockup";
import { SHOP_MENU } from "./constants";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => {
    setShopOpen(false);
    onClose();
  };

  const rowBase =
    "block w-full text-left text-white text-3xl font-light tracking-[0.08em] uppercase py-6 px-6 border-t border-white/10";

  const entrance = (i: number) => ({
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.08 + i * 0.06, duration: 0.3, ease: "easeOut" as const },
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-[#0b0b0b] flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 h-16 shrink-0">
            <Logo onClick={handleClose} className="text-white" />
            <button
              onClick={handleClose}
              aria-label="Close menu"
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu list */}
          <div className="flex-1 pt-4 flex flex-col">
            <motion.div {...entrance(0)}>
              <Link href="/community" onClick={handleClose} className={rowBase}>
                Community
              </Link>
            </motion.div>

            <motion.div {...entrance(1)}>
              <Link href="/about" onClick={handleClose} className={rowBase}>
                Mantra
              </Link>
            </motion.div>

            <motion.div {...entrance(2)} className="border-b border-white/10">
              <button
                onClick={() => setShopOpen((v) => !v)}
                aria-expanded={shopOpen}
                className={`${rowBase} flex items-center justify-between`}
              >
                <span>Shop</span>
                <ChevronDown
                  size={20}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {shopOpen && (
                  <motion.div
                    key="shop-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {SHOP_MENU.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        onClick={handleClose}
                        className="block py-4 pl-10 pr-6 text-sm tracking-[0.22em] uppercase text-white/55 hover:text-white transition-colors border-t border-white/5"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom lockup */}
          <div className="mt-auto pb-6 flex items-center justify-center">
            <BrandLockup variant="onDark" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
