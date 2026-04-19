"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSlideOptions {
  next: () => void;
  isPaused: boolean;
  intervalMs?: number;
}

export function useAutoSlide({ next, isPaused, intervalMs = 10000 }: UseAutoSlideOptions) {
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
    // Interval always runs — isPausedRef gates whether the advance actually fires.
    // This keeps the rhythm steady across hover pauses so there's no long wait on resume.
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) nextRef.current();
    }, intervalMs);
  }, [clear, intervalMs]);

  const reset = useCallback(() => {
    start();
  }, [start]);

  useEffect(() => {
    start();
    return clear;
  }, [start, clear]);

  return { reset };
}
