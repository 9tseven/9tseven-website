"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PRODUCTS, CARD_GAP, PEEK_AMOUNT } from "../constants";

const MOBILE_BREAKPOINT = 640;

export function useProductCarousel() {
  const [current, setCurrent] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [pageCount, setPageCount] = useState(2);

  const cardWidthRef = useRef(0);
  const visibleCardsRef = useRef(3);
  const pageCountRef = useRef(2);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const isMobile = containerWidth < MOBILE_BREAKPOINT;

      const visible = isMobile ? 1 : 3;
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
        container.scrollLeft = 0;
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, []);

  const snapTo = useCallback((pageIndex: number) => {
    const pages = pageCountRef.current;
    const wrapped = ((pageIndex % pages) + pages) % pages;
    containerRef.current?.scrollTo({
      left: wrapped * visibleCardsRef.current * (cardWidthRef.current + CARD_GAP),
      behavior: "smooth",
    });
    setCurrent(wrapped);
  }, []);

  // Debounced: after 150 ms of scroll inactivity, snap to the nearest page boundary.
  // This corrects any mid-page positions from manual swipes on desktop.
  const handleScroll = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const page = Math.round(
        container.scrollLeft / (visibleCardsRef.current * (cardWidthRef.current + CARD_GAP))
      );
      const clamped = Math.max(0, Math.min(page, pageCountRef.current - 1));
      setCurrent(clamped);
      container.scrollTo({
        left: clamped * visibleCardsRef.current * (cardWidthRef.current + CARD_GAP),
        behavior: "smooth",
      });
    }, 150);
  }, []);

  const prev = useCallback(() => snapTo(current - 1), [current, snapTo]);
  const next = useCallback(() => snapTo(current + 1), [current, snapTo]);

  return { current, cardWidth, visibleCards, pageCount, containerRef, handleScroll, prev, next };
}
