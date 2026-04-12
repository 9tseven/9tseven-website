"use client";

import { useState, useEffect } from "react";
import type { NavTheme } from "../types";

export function useNavTheme() {
  const [theme, setTheme] = useState<NavTheme>("dark");

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

  return theme;
}
