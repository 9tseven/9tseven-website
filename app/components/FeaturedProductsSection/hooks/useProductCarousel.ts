"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, animate } from "motion/react";
import { CARD_GAP, PEEK_AMOUNT } from "../constants";

const MOBILE_BREAKPOINT = 640;
const LARGE_BREAKPOINT = 1024;

export function useProductCarousel(productCount: number) {
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
      const pages = Math.ceil(productCount / visible);
      const peek = isMobile ? 0 : PEEK_AMOUNT;
      const w = Math.floor((containerWidth - CARD_GAP * visible - 1 - peek) / (isMobile ? 1.2 : visible));

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
  }, [x, productCount]);

  const targetFor = useCallback((pageIndex: number) => {
    const visible = visibleCardsRef.current;
    const w = cardWidthRef.current;
    const isMobile = visible === 1;

    if (!isMobile) return -pageIndex * visible * (w + CARD_GAP);

    if (pageIndex === 0) return 0;
    const container = containerRef.current;
    if (!container) return 0;
    const groupWidth = visible * w + (visible - 1) * CARD_GAP;
    const leadCardPos = pageIndex * visible * (w + CARD_GAP);
    return (container.offsetWidth - groupWidth) / 2 - leadCardPos;
  }, []);

  const snapTo = useCallback(
    (pageIndex: number) => {
      const pages = pageCountRef.current;
      const wrapped = ((pageIndex % pages) + pages) % pages;
      animate(x, targetFor(wrapped), {
        type: "spring",
        stiffness: 320,
        damping: 36,
        mass: 0.9,
      });
      setCurrent(wrapped);
      currentRef.current = wrapped;
    },
    [x, targetFor],
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

  const dragConstraintsLeft = useCallback(() => targetFor(pageCountRef.current - 1), [targetFor]);

  return { current, cardWidth, visibleCards, pageCount, containerRef, x, handleDragEnd, dragConstraintsLeft, prev, next, snapTo };
}
