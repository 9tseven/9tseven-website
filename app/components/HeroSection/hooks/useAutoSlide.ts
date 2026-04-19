"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSlideOptions {
  next: () => void;
  isPaused: boolean;
  intervalMs?: number;
}

export function useAutoSlide({ next, isPaused, intervalMs = 5000 }: UseAutoSlideOptions) {
  const nextRef = useRef(next);
  const isPausedRef = useRef(isPaused);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

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
    if (!isPausedRef.current) start();
  }, [start]);

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
