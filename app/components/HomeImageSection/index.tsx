// app/components/HomeImageSection/index.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { PANELS, type Panel } from "./constants";

function ImagePanel({ label, leftText, rightText, image, alt, href }: Panel) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const cursorText = cursorTextRef.current;
    if (!wrapper || !cursorText) return;

    let targetY = 0;
    let currentY = 0;
    let hovering = false;
    let raf = 0;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      currentY = lerp(currentY, targetY, 0.1);
      const h = wrapper!.getBoundingClientRect().height;
      const clamped = Math.max(24, Math.min(currentY, h - 24));
      cursorText!.style.top = `${clamped}px`;
      cursorText!.style.transform = "translateY(-50%)";
      if (hovering || Math.abs(currentY - targetY) > 0.5) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }

    function onMouseEnter(e: MouseEvent) {
      const rect = wrapper!.getBoundingClientRect();
      currentY = e.clientY - rect.top;
      targetY = currentY;
      hovering = true;
      wrapper!.classList.add("is-hovered");
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent) {
      targetY = e.clientY - wrapper!.getBoundingClientRect().top;
    }

    function onMouseLeave() {
      hovering = false;
      wrapper!.classList.remove("is-hovered");
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchDevice) {
      wrapper.addEventListener("mouseenter", onMouseEnter);
      wrapper.addEventListener("mousemove", onMouseMove);
      wrapper.addEventListener("mouseleave", onMouseLeave);
    }

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
        <Image src={image} alt={alt} fill className="object-cover" />
      </div>

      {/* Dark overlay on hover */}
      <div className="home-image-overlay absolute inset-0 z-2 pointer-events-none" />

      {/* Centered label — always visible */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-md tracking-[0.28em] uppercase text-white z-3 pointer-events-none whitespace-nowrap">{label}</span>

      {/* Cursor-tracking text — Y driven by rAF, opacity by CSS */}
      <div ref={cursorTextRef} className="home-image-cursor-text absolute left-0 right-0 flex justify-between items-center px-4.5 pointer-events-none z-3" style={{ top: "24px" }}>
        <span className="text-[9px] tracking-[0.28em] uppercase text-white/90">{leftText}</span>
        <span className="text-[9px] tracking-[0.28em] uppercase text-white/90">{rightText}</span>
      </div>

      {/* Full-panel link sits on top so the whole panel is clickable */}
      <Link href={href} className="absolute inset-0 z-4" aria-label={label} />
    </div>
  );
}

export default function HomeImageSection() {
  return (
    <section data-nav-theme="dark" className="flex flex-col md:grid md:grid-cols-3 gap-2.5 bg-white md:h-[78vh]">
      {PANELS.map((panel) => (
        <ImagePanel key={panel.label} {...panel} />
      ))}
    </section>
  );
}
