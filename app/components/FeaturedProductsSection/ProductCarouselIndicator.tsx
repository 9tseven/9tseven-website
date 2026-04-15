import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselIndicatorProps {
  current: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export default function ProductCarouselIndicator({ current, pageCount, onPrev, onNext, onGoTo }: ProductCarouselIndicatorProps) {
  return (
    <div className="flex justify-end pr-[5%] mt-5 w-full">
      <div className="w-1/4 min-w-40">
        {/* Segmented progress bar */}
        <div className="flex gap-1 w-full">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className="flex-1 h-5 flex items-end group"
              aria-label={`Go to page ${i + 1}`}
            >
              <div
                className="w-full h-px group-hover:h-[5px] transition-all duration-200"
                style={{
                  backgroundColor: i === current ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.15)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Counter + arrows */}
        <div className="flex items-center justify-between mt-2.5 pointer-events-auto">
          <span className="text-[0.65rem] tracking-[0.2em] tabular-nums text-black/40">
            {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
            {String(pageCount).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onPrev} aria-label="Previous product" className="text-black/30 hover:text-black transition-colors duration-200">
              <ChevronLeft size={13} strokeWidth={1.25} />
            </button>
            <button onClick={onNext} aria-label="Next product" className="text-black/30 hover:text-black transition-colors duration-200">
              <ChevronRight size={13} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
