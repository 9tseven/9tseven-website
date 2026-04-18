"use client";

import { useState, useRef } from "react";

interface UseImageSliderOptions {
  images: readonly string[];
}

export function useImageSlider({ images }: UseImageSliderOptions) {
  const [hoverIdx, setHoverIdx] = useState(0);
  const hasDragged = useRef(false);
  const pointerStartX = useRef(0);
  const hasMultiple = images.length > 1;

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!hasMultiple) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(0.9999, relX / rect.width));
    setHoverIdx(Math.floor(ratio * images.length));
  };

  const handleCardMouseLeave = () => setHoverIdx(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    hasDragged.current = false;
    pointerStartX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (Math.abs(e.clientX - pointerStartX.current) > 8) hasDragged.current = true;
  };

  return { hoverIdx, hasMultiple, hasDragged, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove };
}
