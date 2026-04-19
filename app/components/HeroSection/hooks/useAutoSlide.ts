"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSlideOptions {
  next: () => void;
  isPaused: boolean;
  intervalMs?: number;
}

export function useAutoSlide({ next, isPaused, intervalMs = 5000 }: UseAutoSlideOptions) {
  const nextRef = useRef(next);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref fresh so interval always calls the latest `next`
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    intervalRef.current = setInterval(() => {
      nextRef.current();
    }, intervalMs);
  }, [clear, intervalMs]);

  const reset = useCallback(() => {
    if (!isPaused) start();
  }, [isPaused, start]);

  useEffect(() => {
    if (isPaused) {
      clear();
    } else {
      start();
    }
    return clear;
  }, [isPaused, start, clear]);

  return { reset };
}
