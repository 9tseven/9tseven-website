"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";

interface Point {
  x: number;
  y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
}

interface WavesProps {
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  pointerSize?: number;
  showPointerDot?: boolean;
}

export function Waves({
  className = "",
  strokeColor = "#ffffff",
  strokeWidth = 1,
  backgroundColor = "transparent",
  pointerSize = 0.5,
  showPointerDot = true,
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const noise = createNoise2D();
    const mouse = {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    };
    let lines: Point[][] = [];
    let paths: SVGPathElement[] = [];
    let bounding: DOMRect | null = null;
    let raf = 0;

    function setSize() {
      bounding = container!.getBoundingClientRect();
      svg!.style.width = `${bounding.width}px`;
      svg!.style.height = `${bounding.height}px`;
    }

    function setLines() {
      if (!bounding) return;
      const { width, height } = bounding;

      paths.forEach((p) => p.remove());
      paths = [];
      lines = [];

      const xGap = 8;
      const yGap = 8;
      const oWidth = width + 200;
      const oHeight = height + 30;
      const totalLines = Math.ceil(oWidth / xGap);
      const totalPoints = Math.ceil(oHeight / yGap);
      const xStart = (width - xGap * totalLines) / 2;
      const yStart = (height - yGap * totalPoints) / 2;

      for (let i = 0; i < totalLines; i++) {
        const points: Point[] = [];
        for (let j = 0; j < totalPoints; j++) {
          points.push({
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", String(strokeWidth));
        svg!.appendChild(path);
        paths.push(path);
        lines.push(points);
      }
    }

    function updateMousePosition(x: number, y: number) {
      if (!bounding) return;
      mouse.x = x - bounding.left;
      mouse.y = y - bounding.top + window.scrollY;
      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.set = true;
      }
      container!.style.setProperty("--x", `${mouse.sx}px`);
      container!.style.setProperty("--y", `${mouse.sy}px`);
    }

    function onResize() {
      setSize();
      setLines();
    }
    function onMouseMove(e: MouseEvent) {
      updateMousePosition(e.pageX, e.pageY);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const t = e.touches[0];
      updateMousePosition(t.clientX, t.clientY);
    }

    function movePoints(time: number) {
      lines.forEach((points) => {
        points.forEach((p) => {
          const move =
            noise(
              (p.x + time * 0.008) * 0.003,
              (p.y + time * 0.003) * 0.002,
            ) * 8;
          p.wave.x = Math.cos(move) * 12;
          p.wave.y = Math.sin(move) * 6;

          const dx = p.x - mouse.sx;
          const dy = p.y - mouse.sy;
          const d = Math.hypot(dx, dy);
          const l = Math.max(175, mouse.vs);
          if (d < l) {
            const s = 1 - d / l;
            const f = Math.cos(d * 0.001) * s;
            p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035;
            p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035;
          }

          p.cursor.vx += (0 - p.cursor.x) * 0.01;
          p.cursor.vy += (0 - p.cursor.y) * 0.01;
          p.cursor.vx *= 0.95;
          p.cursor.vy *= 0.95;
          p.cursor.x += p.cursor.vx;
          p.cursor.y += p.cursor.vy;
          p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x));
          p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y));
        });
      });
    }

    function moved(p: Point, withCursor = true) {
      return {
        x: p.x + p.wave.x + (withCursor ? p.cursor.x : 0),
        y: p.y + p.wave.y + (withCursor ? p.cursor.y : 0),
      };
    }

    function drawLines() {
      lines.forEach((points, lIndex) => {
        if (points.length < 2 || !paths[lIndex]) return;
        const first = moved(points[0], false);
        let d = `M ${first.x} ${first.y}`;
        for (let i = 1; i < points.length; i++) {
          const c = moved(points[i]);
          d += `L ${c.x} ${c.y}`;
        }
        paths[lIndex].setAttribute("d", d);
      });
    }

    function tick(time: number) {
      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;

      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const d = Math.hypot(dx, dy);

      mouse.v = d;
      mouse.vs += (d - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy, dx);

      container!.style.setProperty("--x", `${mouse.sx}px`);
      container!.style.setProperty("--y", `${mouse.sy}px`);

      movePoints(time);
      drawLines();
      raf = requestAnimationFrame(tick);
    }

    setSize();
    setLines();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchmove", onTouchMove, { passive: false });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
      paths.forEach((p) => p.remove());
    };
  }, [strokeColor, strokeWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          backgroundColor,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          "--x": "-0.5rem",
          "--y": "50%",
        } as React.CSSProperties
      }
    >
      <svg
        ref={svgRef}
        className="block w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      />
      {showPointerDot && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${pointerSize}rem`,
            height: `${pointerSize}rem`,
            background: strokeColor,
            borderRadius: "50%",
            transform: "translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)",
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
}
