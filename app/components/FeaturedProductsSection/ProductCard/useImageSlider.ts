"use client";

import { useState, useRef } from "react";
import { useMotionValue, animate } from "motion/react";

interface UseImageSliderOptions {
  images: readonly string[];
  cardWidth: number;
}

export function useImageSlider({ images, cardWidth }: UseImageSliderOptions) {
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const [isDragMode, setIsDragMode] = useState(false);
  const [peekIdx, setPeekIdx] = useState(0);
  const [peekDir, setPeekDir] = useState<1 | -1>(1);

  const dragX = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const skipEnterAnim = useRef(false);
  const isDragModeRef = useRef(false);

  const hasMultiple = images.length > 1;

  const prevImage = (e: React.MouseEvent) => {
    if (isAnimating || isDragMode) return;
    e.stopPropagation();
    setDirection(-1);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    if (isAnimating || isDragMode) return;
    e.stopPropagation();
    setDirection(1);
    setImgIndex((i) => (i + 1) % images.length);
  };

  const commitDrag = (dir: 1 | -1) => {
    const newIndex = dir === 1 ? (imgIndex + 1) % images.length : (imgIndex - 1 + images.length) % images.length;

    animate(dragX, dir * -cardWidth, {
      type: "spring",
      stiffness: 320,
      damping: 36,
      mass: 0.9,
      onComplete: () => {
        skipEnterAnim.current = true;
        dragX.set(0);
        setDirection(dir);
        setImgIndex(newIndex);
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
    // Skip touch events — let native scroll handle carousel navigation on mobile
    if (e.pointerType === "touch") return;
    if (!hasMultiple || isAnimating || isDragMode) return;
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    dragX.set(delta);

    if (!isDragModeRef.current && Math.abs(delta) > 4) {
      const dir = delta < 0 ? 1 : -1;
      const peek = dir === 1 ? (imgIndex + 1) % images.length : (imgIndex - 1 + images.length) % images.length;
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
    direction,
    isAnimating,
    setIsAnimating,
    isDragMode,
    peekIdx,
    peekDir,
    dragX,
    skipEnterAnim,
    hasMultiple,
    prevImage,
    nextImage,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
