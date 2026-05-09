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
    <div className="flex justify-center mt-8 w-full px-6">
      <div className="md:w-3/4 w-full max-w-4xl min-w-60">
        {/* Segmented progress bar */}
        <div className="flex gap-1.5 w-full">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                if (i !== current) onGoTo(i);
              }}
              className="flex-1 h-7 flex items-end group"
              aria-label={`Go to page ${i + 1}`}
            >
              <div
                className="w-full h-0.5 group-hover:h-1.5 [transition:height_200ms_ease,background-color_300ms_ease]"
                style={{
                  backgroundColor: i === current ? "var(--color-ink)" : "var(--color-tint-hover)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Counter + arrows */}
        <div className="flex items-center justify-between mt-4 pointer-events-auto">
          <span className="font-mono text-sm tracking-eyebrow tabular-nums text-ink-muted">
            {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;
            {String(pageCount).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-5">
            <button type="button" onClick={onPrev} aria-label="Previous product" className="text-ink-muted hover:text-ink transition-colors duration-base">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button type="button" onClick={onNext} aria-label="Next product" className="text-ink-muted hover:text-ink transition-colors duration-base">
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
