"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ShopDropdown from "./ShopDropdown";
import type { PillStyle } from "./types";

export default function DesktopNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [pill, setPill] = useState<PillStyle | null>(null);

  const islandRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const shopTriggerRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const itemRefs = [communityRef, aboutRef, shopTriggerRef, cartRef];

    if (hoveredIndex === null || !islandRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPill(null);
      return;
    }

    const el = itemRefs[hoveredIndex]?.current;
    const container = islandRef.current;
    if (!el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    setPill({
      left: elRect.left - containerRect.left,
      width: elRect.width,
      height: elRect.height,
    });
  }, [hoveredIndex]);

  return (
    <div
      className="relative hidden md:block"
      onMouseLeave={() => {
        setHoveredIndex(null);
        setShopOpen(false);
      }}
    >
      {/* Island pill */}
      <div ref={islandRef} className="relative flex items-center bg-[rgba(18,18,18,0.7)] backdrop-blur-md rounded-full px-2 py-2 gap-0.5">
        {/* Sliding highlight */}
        <AnimatePresence>
          {pill && (
            <motion.div
              layoutId="nav-pill"
              className="absolute rounded-full pointer-events-none bg-white/11"
              initial={{ opacity: 0, left: pill.left, width: pill.width, height: pill.height }}
              animate={{ opacity: 1, left: pill.left, width: pill.width, height: pill.height }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
                opacity: { duration: 0.15, type: "tween" },
              }}
            />
          )}
        </AnimatePresence>

        <Link
          ref={communityRef}
          href="/community"
          onMouseEnter={() => {
            setHoveredIndex(0);
            setShopOpen(false);
          }}
          className="relative px-4 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Community
        </Link>

        <Link
          ref={aboutRef}
          href="/about"
          onMouseEnter={() => {
            setHoveredIndex(1);
            setShopOpen(false);
          }}
          className="relative px-4 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Mantra
        </Link>

        <button
          ref={shopTriggerRef}
          onMouseEnter={() => {
            setHoveredIndex(2);
            setShopOpen(true);
          }}
          className="relative flex items-center gap-1.5 px-4 py-2.5 text-xs tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          Shop
          <ChevronDown size={10} strokeWidth={1.5} className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
        </button>

        <div className="w-px h-3.5 bg-white/10 mx-1 shrink-0" />

        <Link
          ref={cartRef}
          href="/cart"
          aria-label="Cart"
          onMouseEnter={() => {
            setHoveredIndex(3);
            setShopOpen(false);
          }}
          className="relative px-3.5 py-2.5 text-white/60 hover:text-white transition-colors duration-150 z-10"
        >
          <ShoppingCart size={14} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Floating dropdown panel */}
      {/* Invisible bridge — fills the 6 px gap so mouseleave doesn't fire mid-travel */}
      {shopOpen && <div className="absolute left-0 right-0 h-3" style={{ top: "100%" }} />}

      {/* Floating dropdown panel */}
      <ShopDropdown
        shopOpen={shopOpen}
        onShopLinkClick={() => {
          setShopOpen(false);
          setHoveredIndex(null);
        }}
      />
    </div>
  );
}
