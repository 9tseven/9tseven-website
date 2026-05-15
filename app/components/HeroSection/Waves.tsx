"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  wave: { x: number; y: number };
}

interface WavesProps {
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
}

export function Waves({ className = "", strokeColor = "#ffffff", strokeWidth = 1, backgroundColor = "transparent" }: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let lines: Point[][] = [];
    let paths: SVGPathElement[] = [];
    let bounding: DOMRect | null = null;
    let raf = 0;
    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const svgNS = "http://www.w3.org/2000/svg";
    const linesGroup = svg.querySelector<SVGGElement>("[data-waves-lines]");
    if (!linesGroup) return;

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

      const xGap = 13;
      const yGap = 17;
      const oWidth = width + 400;
      const oHeight = height + 600;
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
          });
        }
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", String(strokeWidth));
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        linesGroup!.appendChild(path);
        paths.push(path);
        lines.push(points);
      }
    }

    function onResize() {
      setSize();
      setLines();
    }

    function movePoints(time: number) {
      lines.forEach((points) => {
        points.forEach((p) => {
          const t = time * 0.0001;
          const n1 = Math.sin(p.x * 0.013 + t * 1.5);
          const n2 = Math.sin(p.y * 0.0083 - t * 1.1);
          const n3 = Math.sin((p.x - p.y) * 0.0071 + t * 0.7);
          const n4 = Math.cos((p.x + p.y * 0.7) * 0.0049 + t * 2.1);
          const swirl = n1 + n2 * 0.8 + n3 * 0.6 + n4 * 0.5;
          const angle = swirl * Math.PI * 0.65;
          const amp = 20 + n3 * 6;
          p.wave.x = Math.cos(angle) * amp;
          p.wave.y = Math.sin(angle * 1.3) * amp * 0.6;
        });
      });
    }

    function drawLines() {
      lines.forEach((points, lIndex) => {
        if (points.length < 2 || !paths[lIndex]) return;
        const x0 = points[0].x + points[0].wave.x;
        const y0 = points[0].y + points[0].wave.y;
        let d = `M ${x0} ${y0}`;
        for (let i = 1; i < points.length - 1; i++) {
          const p = points[i];
          const next = points[i + 1];
          const cx = p.x + p.wave.x;
          const cy = p.y + p.wave.y;
          const mx = (cx + next.x + next.wave.x) / 2;
          const my = (cy + next.y + next.wave.y) / 2;
          d += ` Q ${cx} ${cy} ${mx} ${my}`;
        }
        const last = points[points.length - 1];
        d += ` T ${last.x + last.wave.x} ${last.y + last.wave.y}`;
        paths[lIndex].setAttribute("d", d);
      });
    }

    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      if (time - lastFrame < FRAME_INTERVAL) return;
      lastFrame = time;
      movePoints(time);
      drawLines();
    }

    setSize();
    setLines();

    window.addEventListener("resize", onResize);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => {
      if (motionQuery.matches) {
        movePoints(0);
        drawLines();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    const onMotionChange = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      start();
    };
    motionQuery.addEventListener("change", onMotionChange);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
      paths.forEach((p) => p.remove());
    };
  }, [strokeColor, strokeWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <svg
        ref={svgRef}
        className="block w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }}
      >
        <g data-waves-lines />
      </svg>
    </div>
  );
}
