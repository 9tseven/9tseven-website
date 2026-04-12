"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type NavTheme = "dark" | "light";
type PillStyle = { left: number; width: number; height: number };

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Apparel", href: "/products/apparel" },
  { label: "Accessories", href: "/products/accessories" },
  { label: "Equipment", href: "/products/equipment" },
];

export default function Navbar() {
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [pill, setPill] = useState<PillStyle | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = useState<number | null>(null);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const shopTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll-based theme detection
  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
      let current: NavTheme = "dark";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) {
          current = (section.dataset.navTheme as NavTheme) ?? "dark";
        }
      });
      setTheme(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Recompute pill after every render that changes hovered state
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

    // Expand pill to contain dropdown when shop is active
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

  const isDark = theme === "dark";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>
        <div className="flex items-center justify-between px-6 md:px-10 h-16">
          {/* Logo */}
          <Link href="/" className="text-xs font-medium tracking-[0.25em] uppercase">
            9TSEVEN
          </Link>

          {/* Desktop nav */}
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
            <div
              className="relative z-10"
              onMouseEnter={() => {
                setHoveredIndex(2);
                setShopOpen(true);
              }}
            >
              <button ref={shopTriggerRef} className="flex items-center gap-1.5 px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-opacity duration-150">
                Shop
                <ChevronDown size={10} strokeWidth={1.5} className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown — visually inside the expanded pill */}
              <AnimatePresence>
                {shopOpen && (
                  <motion.div ref={dropdownRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="absolute left-0 top-full pt-1 pb-2 min-w-[200px]">
                    {SHOP_LINKS.map((link, i) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setShopOpen(false);
                          setHoveredIndex(null);
                        }}
                        onMouseEnter={() => setHoveredDropdown(i)}
                        onMouseLeave={() => setHoveredDropdown(null)}
                        className="relative block px-4 py-2.5 text-[0.6rem] tracking-[0.18em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-150"
                      >
                        {hoveredDropdown === i && <motion.span layoutId="dropdown-pill" className="absolute inset-y-0 left-2 right-2 rounded-lg pointer-events-none" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }} transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }} />}
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Cart + burger */}
          <div className="flex items-center gap-5">
            <Link href="/cart" aria-label="Cart" className="opacity-60 hover:opacity-100 transition-opacity duration-200">
              <ShoppingCart size={16} strokeWidth={1.5} />
            </Link>
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="md:hidden opacity-60 hover:opacity-100 transition-opacity duration-200">
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-0 z-50 bg-[#0b0b0b] flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-xs font-medium tracking-[0.25em] uppercase text-white">
                9TSEVEN
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-white/50 hover:text-white transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col justify-center flex-1 px-8 gap-10">
              {(["Community", "About Us"] as const).map((label, i) => (
                <motion.div key={label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.06, duration: 0.3, ease: "easeOut" }}>
                  <Link href={label === "Community" ? "/community" : "/about"} onClick={() => setMobileOpen(false)} className="text-white text-4xl font-light tracking-[0.12em] uppercase">
                    {label}
                  </Link>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}>
                <p className="text-white text-4xl font-light tracking-[0.12em] uppercase mb-5">Shop</p>
                <div className="flex flex-col gap-3.5 pl-px">
                  {SHOP_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-white/35 text-[0.7rem] tracking-[0.22em] uppercase hover:text-white/70 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
