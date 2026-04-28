"use client";

import { useEffect, useRef } from "react";
import { Waves } from "./Waves";

const LOGO_SRC = "/Logo/9t7-vector.svg";
const LOGO_ASPECT = 2000 / 1283;

function easeStep(cur: number, target: number, halfLifeMs: number, dt: number) {
  const k = 1 - Math.pow(2, -dt / halfLifeMs);
  return cur + (target - cur) * k;
}

export default function HeroLogo3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const tilt = tiltRef.current;
    if (!wrap || !tilt) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hero = wrap.closest<HTMLElement>("section[data-nav-theme]") ?? wrap;

    let raf = 0;
    let lastT = performance.now();
    let tx = 0;
    let ty = 0;
    let tTargetX = 0;
    let tTargetY = 0;

    function onMove(e: PointerEvent) {
      const r = tilt!.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tTargetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width / 2)));
      tTargetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height / 2)));
    }
    function onLeave() {
      tTargetX = 0;
      tTargetY = 0;
    }
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);

    function frame(now: number) {
      const dt = Math.min(64, now - lastT);
      lastT = now;
      tx = easeStep(tx, reduceMotion ? 0 : tTargetX, 260, dt);
      ty = easeStep(ty, reduceMotion ? 0 : tTargetY, 260, dt);
      tilt!.style.transform = `perspective(1200px) rotateY(${tx * 1.5}deg) rotateX(${-ty * 1.5}deg)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none"
    >
      <div
        ref={tiltRef}
        style={{
          width: "min(50vw, 80vh, 900px)",
          aspectRatio: `${LOGO_ASPECT}`,
          willChange: "transform",
        }}
      >
        <div
          role="img"
          aria-label="9TSEVEN"
          className="relative w-full h-full"
          style={{
            opacity: 0.6,
            WebkitMaskImage: `url(${LOGO_SRC})`,
            maskImage: `url(${LOGO_SRC})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        >
          <Waves
            backgroundColor="transparent"
            strokeColor="#ffffff"
            strokeWidth={1}
            showPointerDot={false}
          />
        </div>
      </div>
    </div>
  );
}
