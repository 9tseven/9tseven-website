"use client";

import { useState } from "react";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import NavActions from "./NavActions";
import MobileMenu from "./MobileMenu";
import CartDrawer from "../Cart/CartDrawer";
import { useNavTheme } from "./hooks/useNavTheme";
import type { NavPreviews } from "./types";

interface NavbarClientProps {
  previews: NavPreviews;
}

export default function NavbarClient({ previews }: NavbarClientProps) {
  const theme = useNavTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <>
      <nav className={`fixed left-0 right-0 z-50 transition-[top,color] duration-500 ${isDark ? "text-white" : "text-black"}`} style={{ top: "var(--banner-h, 0px)" }}>
        <div className="flex items-center h-16 px-6 md:px-10">
          <div className="flex-1 flex items-center">
            <Logo />
          </div>
          <DesktopNav previews={previews} />
          <div className="flex-1 flex items-center justify-end">
            <NavActions onMenuOpen={() => setMobileOpen(true)} />
          </div>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer />
    </>
  );
}
