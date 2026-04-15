import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardArrowsProps {
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export default function ProductCardArrows({ onPrev, onNext }: ProductCardArrowsProps) {
  return (
    <>
      <button
        type="button"
        className="absolute left-0 top-0 bottom-0 w-[15%] z-10
                   hidden md:flex items-center justify-center
                   md:opacity-0
                   md:group-hover:opacity-100 md:hover:bg-black/10
                   focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:-outline-offset-2
                   transition-all duration-200"
        onClick={onPrev}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Previous image"
      >
        <ChevronLeft size={18} strokeWidth={1.25} className="text-white drop-shadow" />
      </button>
      <button
        type="button"
        className="absolute right-0 top-0 bottom-0 w-[15%] z-10
                   hidden md:flex items-center justify-center
                   md:opacity-0
                   md:group-hover:opacity-100 md:hover:bg-black/10
                   focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:-outline-offset-2
                   transition-all duration-200"
        onClick={onNext}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Next image"
      >
        <ChevronRight size={18} strokeWidth={1.25} className="text-white drop-shadow" />
      </button>
    </>
  );
}
