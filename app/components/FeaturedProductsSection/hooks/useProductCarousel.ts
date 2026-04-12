"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "motion/react";
import { PRODUCTS, CARD_GAP, PEEK_AMOUNT } from "../constants";

/** Below this container width (px) the carousel shows 1 card per page. */
const MOBILE_BREAKPOINT = 640;

export function useProductCarousel() {
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [pageCount, setPageCount] = useState(2);

  const cardWidthRef = useRef(0);
  const visibleCardsRef = useRef(3);
  const pageCountRef = useRef(2);

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const isMobile = containerWidth < MOBILE_BREAKPOINT;

      const visible = isMobile ? 1 : 3;
      const pages = PRODUCTS.length / visible; // 6 on mobile, 2 on desktop

      // Mobile: card fills full width (no peek, no inter-card gaps visible)
      // Desktop: 3 cards + 2 gaps + 1 peek = container width
      const peek = isMobile ? 0 : PEEK_AMOUNT;
      const w = Math.floor((containerWidth - CARD_GAP * (visible - 1) - peek) / visible);

      // Reset to page 0 when layout switches between mobile and desktop
      const layoutChanged = visible !== visibleCardsRef.current;

      cardWidthRef.current = w;
      visibleCardsRef.current = visible;
      pageCountRef.current = pages;

      setCardWidth(w);
      setVisibleCards(visible);
      setPageCount(pages);

      if (layoutChanged) {
        setCurrent(0);
        animate(x, 0, { type: "spring", stiffness: 320, damping: 36, mass: 0.9 });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, [x]);

  const snapTo = useCallback(
    (pageIndex: number) => {
      const pages = pageCountRef.current;
      const wrapped = ((pageIndex % pages) + pages) % pages;
      animate(x, -wrapped * visibleCardsRef.current * (cardWidthRef.current + CARD_GAP), {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(wrapped);
    },
    [x],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = cardWidthRef.current * 0.2;
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

  return { current, cardWidth, visibleCards, pageCount, containerRef, x, handleDragEnd, prev, next };
}
