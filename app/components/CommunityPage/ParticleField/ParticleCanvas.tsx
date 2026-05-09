"use client";

import { useEffect, useRef } from "react";
import { createParticleSystem } from "./particleSystem";
import { createShapeCycle } from "./shapeCycle";
import { useInteraction } from "./useInteraction";

const DESKTOP_PARTICLES = 2500;
const MOBILE_PARTICLES = 1500;

function initialParticleCount(): number {
  if (typeof window === "undefined") return DESKTOP_PARTICLES;
  return window.matchMedia("(pointer: coarse)").matches
    ? MOBILE_PARTICLES
    : DESKTOP_PARTICLES;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useInteraction(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const system = createParticleSystem(initialParticleCount(), {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
    const cycle = createShapeCycle();
    if (prefersReducedMotion()) cycle.freeze();

    function resize() {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      system.resize({ width: w, height: h });
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    const TAP_MAX_MS = 250;
    const TAP_MAX_DIST = 10;
    let tapStartTime = 0;
    let tapStartX = 0;
    let tapStartY = 0;
    let tapCandidate = false;

    function onPointerDown(e: PointerEvent) {
      tapStartTime = performance.now();
      tapStartX = e.clientX;
      tapStartY = e.clientY;
      tapCandidate = true;
    }
    function onPointerUp(e: PointerEvent) {
      if (!tapCandidate) return;
      tapCandidate = false;
      const dt = performance.now() - tapStartTime;
      const dx = e.clientX - tapStartX;
      const dy = e.clientY - tapStartY;
      if (dt <= TAP_MAX_MS && dx * dx + dy * dy <= TAP_MAX_DIST * TAP_MAX_DIST) {
        cycle.skip(performance.now());
      }
    }
    function onPointerCancel() {
      tapCandidate = false;
    }
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    let rafId = 0;
    function frame(time: number) {
      rafId = requestAnimationFrame(frame);
      if (!visible) return;
      if (!ctx) return;
      const state = cycle.read(time);
      system.update(state, pointerRef.current, time);
      system.draw(ctx);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [pointerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full select-none"
      style={{ WebkitTapHighlightColor: "transparent", WebkitUserSelect: "none" }}
      aria-hidden="true"
    />
  );
}
