"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import type { NavTheme } from "../types";

function detectTheme(): NavTheme {
  const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
  let current: NavTheme = "dark";
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) {
      current = (section.dataset.navTheme as NavTheme) ?? "dark";
    }
  });
  return current;
}

export function useNavTheme() {
  const [theme, setTheme] = useState<NavTheme>("dark");
  const pathname = usePathname();

  useLenis(() => {
    setTheme(detectTheme());
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setTheme(detectTheme()));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return theme;
}
