"use client";

import { useEffect, useRef, useState } from "react";

const CURSOR_BLEND = 0.18;
const SPRING_STIFFNESS = 210;
const SPRING_DAMPING = 26;
const EDGE_INTERPOLATION_WIDTH = 0.2;
const POSITION_EPSILON = 0.001;
const VELOCITY_EPSILON = 0.01;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

interface UseImageSliderOptions {
  images: readonly string[];
}

export function useImageSlider({ images }: UseImageSliderOptions) {
  const [hoverIdx, setHoverIdx] = useState(0);
  const [slidePosition, setSlidePosition] = useState(0);
  const hasDragged = useRef(false);
  const pointerStartX = useRef(0);
  const hoverIdxRef = useRef(0);
  const targetPositionRef = useRef(0);
  const renderedPositionRef = useRef(0);
  const velocityRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const hasMultiple = images.length > 1;

  const stopAnimation = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    lastFrameTimeRef.current = null;
  };

  const animateToTarget = (time: number) => {
    const dtMs = lastFrameTimeRef.current === null ? 16 : time - lastFrameTimeRef.current;
    const dt = Math.min(dtMs, 32) / 1000;
    lastFrameTimeRef.current = time;

    const delta = targetPositionRef.current - renderedPositionRef.current;
    const acceleration = delta * SPRING_STIFFNESS - velocityRef.current * SPRING_DAMPING;

    velocityRef.current += acceleration * dt;
    renderedPositionRef.current += velocityRef.current * dt;

    if (Math.abs(delta) < POSITION_EPSILON && Math.abs(velocityRef.current) < VELOCITY_EPSILON) {
      renderedPositionRef.current = targetPositionRef.current;
      velocityRef.current = 0;
      setSlidePosition(targetPositionRef.current);
      stopAnimation();
      return;
    }

    setSlidePosition(renderedPositionRef.current);
    frameRef.current = requestAnimationFrame(animateToTarget);
  };

  const startAnimation = () => {
    if (!hasMultiple || frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(animateToTarget);
  };

  const setTargetPosition = (nextPosition: number) => {
    targetPositionRef.current = clamp(nextPosition, 0, images.length - 1);
    startAnimation();
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!hasMultiple) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = clamp(relX / rect.width, 0, 0.9999);
    const zonePosition = ratio * images.length;
    const nextHoverIdx = Math.min(images.length - 1, Math.floor(zonePosition));
    const zoneProgress = zonePosition - nextHoverIdx;

    let edgeOffset = 0;
    if (zoneProgress < EDGE_INTERPOLATION_WIDTH) {
      const edgeProgress = 1 - zoneProgress / EDGE_INTERPOLATION_WIDTH;
      edgeOffset = -0.5 * smoothStep(edgeProgress);
    } else if (zoneProgress > 1 - EDGE_INTERPOLATION_WIDTH) {
      const edgeProgress = (zoneProgress - (1 - EDGE_INTERPOLATION_WIDTH)) / EDGE_INTERPOLATION_WIDTH;
      edgeOffset = 0.5 * smoothStep(edgeProgress);
    }

    const hybridTarget = nextHoverIdx + edgeOffset * CURSOR_BLEND;

    hoverIdxRef.current = nextHoverIdx;
    setHoverIdx((current) => (current === nextHoverIdx ? current : nextHoverIdx));
    setTargetPosition(hybridTarget);
  };

  const handleCardMouseLeave = () => {
    if (!hasMultiple) return;
    setTargetPosition(hoverIdxRef.current);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    hasDragged.current = false;
    pointerStartX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (Math.abs(e.clientX - pointerStartX.current) > 8) hasDragged.current = true;
  };

  return { hoverIdx, slidePosition, hasMultiple, hasDragged, handleCardMouseMove, handleCardMouseLeave, handlePointerDown, handlePointerMove };
}
