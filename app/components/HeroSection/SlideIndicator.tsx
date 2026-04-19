import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SLIDES } from "./constants";

interface SlideIndicatorProps {
  current: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export default function SlideIndicator({ current, onPrev, onNext, onGoTo }: SlideIndicatorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="absolute bottom-8 right-8 w-1/4 z-10 pointer-events-none">
      {/* Segmented progress bar */}
      <div className="flex gap-1 w-full pointer-events-auto">
        {SLIDES.map((slide, i) => (
          <button
            type="button"
            key={i}
            onClick={() => {
              if (i !== current) onGoTo(i);
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex-1 group"
            aria-label={`Go to slide ${i + 1}`}
          >
            {/* Segment bar — thumbnail slides up from here via absolute positioning */}
            <div className="relative h-10 flex items-end">
              {/* Thumbnail — desktop only, absolutely positioned above the bar */}
              <div
                className="hidden md:flex absolute bottom-0 left-0 w-full flex-col overflow-hidden transition-[opacity,max-height] duration-200 ease-in-out"
                style={{
                  maxHeight: hoveredIndex === i ? "120px" : "0px",
                  opacity: hoveredIndex === i ? 1 : 0,
                }}
              >
                {/* Top framing line — matches hovered indicator style */}
                <div
                  className="w-full h-1.25 shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                />
                {/* Thumbnail image */}
                <div className="relative w-full grow" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={slide.image}
                    alt={`Slide ${i + 1} preview`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 5vw, 0px"
                  />
                </div>
              </div>

              <div
                className="w-full h-px group-hover:h-1.25 [transition:height_200ms_ease,background-color_300ms_ease]"
                style={{
                  backgroundColor: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)",
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Counter + arrows */}
      <div className="flex items-center justify-between mt-4 pointer-events-auto">
        <span className="font-mono text-white/40 text-[0.65rem] tracking-[0.2em] tabular-nums">
          {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
          {String(SLIDES.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={onPrev} aria-label="Previous slide" className="text-white/40 hover:text-white transition-colors duration-200">
            <ChevronLeft size={13} strokeWidth={1.25} />
          </button>
          <button onClick={onNext} aria-label="Next slide" className="text-white/40 hover:text-white transition-colors duration-200">
            <ChevronRight size={13} strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
