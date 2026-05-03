"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "motion/react";

export function useSlider(slideCount: number) {
  const [current, setCurrent] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const slideWidthRef = useRef(0);
  const currentRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.offsetWidth ?? 0;
      setSlideWidth(w);
      slideWidthRef.current = w;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const snapTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, slideCount - 1));
      animate(x, -clamped * slideWidthRef.current, {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(clamped);
      currentRef.current = clamped;
    },
    [x, slideCount],
  );

  // Horizontal trackpad/wheel scroll changes slide
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 40) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 1000) return;
      lastWheel = now;
      if (e.deltaX > 0) snapTo(currentRef.current + 1);
      else snapTo(currentRef.current - 1);
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [snapTo]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = slideWidthRef.current * 0.2;
      const { x: offsetX } = info.offset;
      const { x: velX } = info.velocity;

      if (offsetX < -threshold || velX < -400) {
        snapTo(current + 1);
      } else if (offsetX > threshold || velX > 400) {
        snapTo(current - 1);
      } else {
        snapTo(current);
      }
    },
    [current, snapTo],
  );

  const prev = useCallback(() => snapTo(current - 1), [current, snapTo]);
  const next = useCallback(() => snapTo(current + 1), [current, snapTo]);
  const nextLooping = useCallback(() => snapTo((currentRef.current + 1) % slideCount), [snapTo, slideCount]);

  return { current, slideWidth, containerRef, x, handleDragEnd, prev, next, nextLooping, goTo: snapTo };
}
