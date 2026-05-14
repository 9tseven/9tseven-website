"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { PANELS, type Panel } from "./constants";
import "./HomeImageSection.css";

const O_BLOCK = "o".repeat(7800);

function ImagePanel({ label, leftText, rightText, image, alt, href }: Panel) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch devices synthesize mouseenter/mousemove on tap. Bail so the
    // cursor-text stays put at its initial top:24px and CSS handles visibility.
    if (window.matchMedia("(hover: none)").matches) return;

    const wrapper = wrapperRef.current;
    const cursorText = cursorTextRef.current;
    if (!wrapper || !cursorText) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hovering = false;
    let raf = 0;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);
      const h = wrapper!.getBoundingClientRect().height;
      const clamped = Math.max(24, Math.min(currentY, h - 24));
      cursorText!.style.top = `${clamped}px`;
      cursorText!.style.transform = "translateY(-50%)";
      wrapper!.style.setProperty("--cursor-x", `${currentX}px`);
      wrapper!.style.setProperty("--cursor-y", `${clamped}px`);
      if (hovering || Math.abs(currentY - targetY) > 0.5 || Math.abs(currentX - targetX) > 0.5) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }

    function onMouseEnter(e: MouseEvent) {
      const rect = wrapper!.getBoundingClientRect();
      currentX = e.clientX - rect.left;
      currentY = e.clientY - rect.top;
      targetX = currentX;
      targetY = currentY;
      hovering = true;
      wrapper!.classList.add("is-hovered");
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = wrapper!.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      hovering = false;
      wrapper!.classList.remove("is-hovered");
    }

    wrapper.addEventListener("mouseenter", onMouseEnter);
    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("mouseleave", onMouseLeave);

    return () => {
      wrapper.removeEventListener("mouseenter", onMouseEnter);
      wrapper.removeEventListener("mousemove", onMouseMove);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="home-image-panel h-[60vh] md:h-full relative overflow-hidden">
      <div className="home-image-photo absolute inset-0">
        <Image src={image} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>

      {/* Dark overlay on hover */}
      <div className="home-image-overlay absolute inset-0 z-2 pointer-events-none" />

      {/* O-layer — dense block of "o"s, masked to a horizontal band at cursor Y */}
      <div aria-hidden className="home-image-o-layer font-mono absolute inset-y-0 left-0 -right-2 z-2 pointer-events-none overflow-hidden text-[12px] leading-3 break-all select-none">
        {O_BLOCK}
      </div>

      {/* Centered label — always visible */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-md tracking-display uppercase text-fg z-3 pointer-events-none whitespace-nowrap">{label}</span>

      {/* Cursor-tracking text — Y driven by rAF, opacity by CSS */}
      <div ref={cursorTextRef} className="font-mono home-image-cursor-text absolute left-0 right-0 flex justify-between items-center px-4.5 pointer-events-none z-3" style={{ top: "24px" }}>
        <span className="text-[9px] tracking-display uppercase text-fg opacity-90">{leftText}</span>
        <span className="text-[9px] tracking-display uppercase text-fg opacity-90">{rightText}</span>
      </div>

      {/* Full-panel link sits on top so the whole panel is clickable */}
      <Link href={href} className="absolute inset-0 z-4" aria-label={label} />
    </div>
  );
}

export default function HomeImageSection() {
  return (
    <section data-nav-theme="dark" className="flex flex-col md:grid 2xl:grid-cols-3 gap-2.5 bg-white md:h-[120vh] 2xl:h-[80vh]">
      {PANELS.map((panel) => (
        <ImagePanel key={panel.label} {...panel} />
      ))}
    </section>
  );
}
