import { ChevronLeft, ChevronRight } from "lucide-react";
import { SLIDES } from "./constants";

interface SlideIndicatorProps {
  current: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function SlideIndicator({ current, onPrev, onNext }: SlideIndicatorProps) {
  return (
    <div className="absolute bottom-8 right-8 w-1/4 z-10 pointer-events-none">
      {/* Segmented progress bar */}
      <div className="flex gap-1 w-full">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-px transition-colors duration-300"
            style={{
              backgroundColor: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>

      {/* Counter + arrows */}
      <div className="flex items-center justify-between mt-4 pointer-events-auto">
        <span className="text-white/40 text-[0.65rem] tracking-[0.2em] tabular-nums">
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
