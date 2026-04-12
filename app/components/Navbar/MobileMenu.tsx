"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { SHOP_LINKS } from "./constants";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-0 z-50 bg-[#0b0b0b] flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 shrink-0">
            <Logo onClick={onClose} className="text-white" />
            <button onClick={onClose} aria-label="Close menu" className="text-white/50 hover:text-white transition-colors">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col justify-center flex-1 px-8 gap-10">
            {(["Community", "About Us"] as const).map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.08 + i * 0.06,
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <Link href={label === "Community" ? "/community" : "/about"} onClick={onClose} className="text-white text-4xl font-light tracking-[0.12em] uppercase">
                  {label}
                </Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}>
              <p className="text-white text-4xl font-light tracking-[0.12em] uppercase mb-5">Shop</p>
              <div className="flex flex-col gap-3.5 pl-px">
                {SHOP_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={onClose} className="text-white/35 text-[0.7rem] tracking-[0.22em] uppercase hover:text-white/70 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
