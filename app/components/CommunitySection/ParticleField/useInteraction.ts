"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { PointerState } from "./particleSystem";

/**
 * Attaches pointer + touch listeners to the given canvas and exposes a
 * pointer state ref that the RAF loop reads each frame.
 */
export function useInteraction(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const pointerRef = useRef<PointerState>({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function toLocal(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const { x, y } = toLocal(e.clientX, e.clientY);
      pointerRef.current.active = true;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onPointerLeave() {
      pointerRef.current.active = false;
    }

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = toLocal(t.clientX, t.clientY);
      pointerRef.current.active = true;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = toLocal(t.clientX, t.clientY);
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    }

    function onTouchEnd() {
      pointerRef.current.active = false;
    }

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [canvasRef]);

  return pointerRef;
}
