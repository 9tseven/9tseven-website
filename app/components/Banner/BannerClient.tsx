"use client";

import { useLenis } from "lenis/react";

interface BannerClientProps {
  text: string;
  closeButton: boolean;
}

export default function BannerClient({ text, closeButton }: BannerClientProps) {
  const lenis = useLenis();

  const handleScroll = () => {
    const target = document.getElementById("newsletter");
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleScroll();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem("bannerClosed", "1");
    delete document.documentElement.dataset.bannerOpen;
  };

  return (
    <div
      data-banner
      role="button"
      tabIndex={0}
      onClick={handleScroll}
      onKeyDown={handleKeyDown}
      aria-label={`${text} — sign up`}
      className="fixed top-0 left-0 right-0 z-[60] h-10 bg-black text-white flex items-center justify-center px-6 md:px-10 cursor-pointer hover:bg-black/90 transition-colors duration-150"
    >
      <span className="text-[0.7rem] tracking-[0.14em] uppercase font-semibold truncate">
        {text}
      </span>
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close banner"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors duration-150 text-base leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </div>
  );
}
