"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "motion/react";
import { SLIDES } from "../constants";

export function useSlider() {
  const [current, setCurrent] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const slideWidthRef = useRef(0);
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
      const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
      animate(x, -clamped * slideWidthRef.current, {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(clamped);
    },
    [x],
  );

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

  return { current, slideWidth, containerRef, x, handleDragEnd, prev, next };
}
