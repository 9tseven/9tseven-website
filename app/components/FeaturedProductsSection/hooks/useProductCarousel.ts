"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "motion/react";
import { PRODUCTS, CARD_GAP, PEEK_AMOUNT } from "../constants";

const MOBILE_BREAKPOINT = 640;
const LARGE_BREAKPOINT = 1024;

export function useProductCarousel() {
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [pageCount, setPageCount] = useState(2);

  const cardWidthRef = useRef(0);
  const visibleCardsRef = useRef(3);
  const pageCountRef = useRef(2);
  const currentRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const isMobile = containerWidth < MOBILE_BREAKPOINT;
      const isLarge = containerWidth >= LARGE_BREAKPOINT;

      const visible = isMobile ? 1 : isLarge ? 3 : 2;
      const pages = PRODUCTS.length / visible;
      const peek = isMobile ? 0 : PEEK_AMOUNT;
      const w = Math.floor((containerWidth - CARD_GAP * (visible - 1) - peek) / visible);

      const layoutChanged = visible !== visibleCardsRef.current;

      cardWidthRef.current = w;
      visibleCardsRef.current = visible;
      pageCountRef.current = pages;

      setCardWidth(w);
      setVisibleCards(visible);
      setPageCount(pages);

      if (layoutChanged) {
        setCurrent(0);
        currentRef.current = 0;
        x.set(0);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, [x]);

  const pageWidth = useCallback(
    () => visibleCardsRef.current * (cardWidthRef.current + CARD_GAP),
    [],
  );

  const snapTo = useCallback(
    (pageIndex: number) => {
      const pages = pageCountRef.current;
      const wrapped = ((pageIndex % pages) + pages) % pages;
      animate(x, -wrapped * pageWidth(), {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(wrapped);
      currentRef.current = wrapped;
    },
    [x, pageWidth],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = cardWidthRef.current * 0.2;
      const { x: offsetX } = info.offset;
      const { x: velX } = info.velocity;

      if (offsetX < -threshold || velX < -400) snapTo(currentRef.current + 1);
      else if (offsetX > threshold || velX > 400) snapTo(currentRef.current - 1);
      else snapTo(currentRef.current);
    },
    [snapTo],
  );

  const prev = useCallback(() => snapTo(currentRef.current - 1), [snapTo]);
  const next = useCallback(() => snapTo(currentRef.current + 1), [snapTo]);

  const dragConstraintsLeft = useCallback(
    () => -(pageCountRef.current - 1) * pageWidth(),
    [pageWidth],
  );

  return { current, cardWidth, visibleCards, pageCount, containerRef, x, handleDragEnd, dragConstraintsLeft, prev, next, snapTo };
}
