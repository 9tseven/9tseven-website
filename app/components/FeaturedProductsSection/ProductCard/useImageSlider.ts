"use client";

import { useState, useRef } from "react";
import { useMotionValue, animate } from "motion/react";

interface UseImageSliderOptions {
  images: readonly string[];
  cardWidth: number;
}

export function useImageSlider({ images, cardWidth }: UseImageSliderOptions) {
  const [imgIndex, setImgIndex] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(0);

  const [isDragMode, setIsDragMode] = useState(false);
  const [peekIdx, setPeekIdx] = useState(0);
  const [peekDir, setPeekDir] = useState<1 | -1>(1);

  const dragX = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const isDragModeRef = useRef(false);
  const hasDragged = useRef(false);

  const hasMultiple = images.length > 1;

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current || !hasMultiple) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(0.9999, relX / rect.width));
    setHoverIdx(Math.floor(ratio * images.length));
  };

  const handleCardMouseLeave = () => {
    setHoverIdx(0);
  };

  const commitDrag = (dir: 1 | -1) => {
    const newIndex =
      dir === 1
        ? (imgIndex + 1) % images.length
        : (imgIndex - 1 + images.length) % images.length;

    animate(dragX, dir * -cardWidth, {
      type: "spring",
      stiffness: 320,
      damping: 36,
      mass: 0.9,
      onComplete: () => {
        dragX.set(0);
        setImgIndex(newIndex);
        setHoverIdx(newIndex);
        isDragModeRef.current = false;
        setIsDragMode(false);
      },
    });
  };

  const snapBack = () => {
    animate(dragX, 0, {
      type: "spring",
      stiffness: 320,
      damping: 36,
      mass: 0.9,
      onComplete: () => {
        dragX.set(0);
        isDragModeRef.current = false;
        setIsDragMode(false);
      },
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    if (e.pointerType === "touch") return;
    if (!hasMultiple || isDragMode) return;
    e.preventDefault();
    isDragging.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      const delta = e.clientX - dragStartX.current;
      if (Math.abs(delta) > 8) hasDragged.current = true;
      return;
    }
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 8) hasDragged.current = true;
    dragX.set(delta);

    if (!isDragModeRef.current && Math.abs(delta) > 4) {
      const dir = delta < 0 ? 1 : -1;
      const peek =
        dir === 1
          ? (imgIndex + 1) % images.length
          : (imgIndex - 1 + images.length) % images.length;
      setPeekDir(dir as 1 | -1);
      setPeekIdx(peek);
      isDragModeRef.current = true;
      setIsDragMode(true);
    }

    e.stopPropagation();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    e.stopPropagation();

    const delta = dragX.get();
    if (Math.abs(delta) >= 40) {
      commitDrag(delta < 0 ? 1 : -1);
    } else {
      snapBack();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.stopPropagation();
    snapBack();
  };

  return {
    imgIndex,
    hoverIdx,
    isDragMode,
    peekIdx,
    peekDir,
    dragX,
    hasMultiple,
    hasDragged,
    handleCardMouseMove,
    handleCardMouseLeave,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
