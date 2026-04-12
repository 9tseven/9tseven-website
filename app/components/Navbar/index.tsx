"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import NavActions from "./NavActions";
import MobileMenu from "./MobileMenu";
import { useNavTheme } from "./hooks/useNavTheme";

export default function Navbar() {
  const theme = useNavTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isDark = theme === "dark";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>
        <div className="flex items-center justify-between px-6 md:px-10 h-16">
          <Logo />
          <DesktopNav isDark={isDark} />
          <NavActions onMenuOpen={() => setMobileOpen(true)} />
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
