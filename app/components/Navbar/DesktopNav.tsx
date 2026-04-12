"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import ShopDropdown from "./ShopDropdown";
import type { PillStyle } from "./types";

interface DesktopNavProps {
  isDark: boolean;
}

export default function DesktopNav({ isDark }: DesktopNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [pill, setPill] = useState<PillStyle | null>(null);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const shopTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

  useLayoutEffect(() => {
    const itemRefs = [communityRef, aboutRef, shopTriggerRef];

    if (hoveredIndex === null || !navContainerRef.current) {
      setPill(null);
      return;
    }

    const el = itemRefs[hoveredIndex].current;
    const container = navContainerRef.current;
    if (!el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const containerH = container.offsetHeight;

    let w = elRect.width;
    let h = containerH;

    if (hoveredIndex === 2 && shopOpen && dropdownRef.current) {
      w = Math.max(w, dropdownRef.current.offsetWidth);
      h = containerH + dropdownRef.current.offsetHeight;
    }

    setPill({
      left: elRect.left - containerRect.left,
      width: w,
      height: h,
    });
  }, [hoveredIndex, shopOpen]);

  return (
    <div
      ref={navContainerRef}
      className="relative hidden md:flex items-center py-1"
      onMouseLeave={() => {
        setHoveredIndex(null);
        setShopOpen(false);
      }}
    >
      {/* Sliding pill */}
      <AnimatePresence>
        {pill && (
          <motion.div
            layoutId="nav-pill"
            className="absolute top-0 rounded-2xl pointer-events-none"
            style={{ background: pillBg }}
            initial={{
              opacity: 0,
              left: pill.left,
              width: pill.width,
              height: pill.height,
            }}
            animate={{
              opacity: 1,
              left: pill.left,
              width: pill.width,
              height: pill.height,
            }}
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

      {/* Community */}
      <Link
        ref={communityRef}
        href="/community"
        onMouseEnter={() => {
          setHoveredIndex(0);
          setShopOpen(false);
        }}
        className="relative px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-opacity duration-150 z-10"
      >
        Community
      </Link>

      {/* About Us */}
      <Link
        ref={aboutRef}
        href="/about"
        onMouseEnter={() => {
          setHoveredIndex(1);
          setShopOpen(false);
        }}
        className="relative px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-opacity duration-150 z-10"
      >
        About Us
      </Link>

      {/* Shop */}
      <ShopDropdown
        isDark={isDark}
        shopOpen={shopOpen}
        onMouseEnter={() => {
          setHoveredIndex(2);
          setShopOpen(true);
        }}
        onShopLinkClick={() => {
          setShopOpen(false);
          setHoveredIndex(null);
        }}
        dropdownRef={dropdownRef}
        triggerRef={shopTriggerRef}
      />
    </div>
  );
}
