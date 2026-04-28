"use client";

interface CategoryMarqueeProps {
  text: string;
}

export default function CategoryMarquee({ text }: CategoryMarqueeProps) {
  // Two identical copies side-by-side. The animation translates -50% so the
  // second copy slides into view exactly where the first ended — zero gap.
  // Each copy ends with the same separator it uses internally, so the seam
  // between the two side-by-side copies matches the rhythm within a copy.
  const SEP = "\u00A0".repeat(8);
  const repeated = Array(12).fill(text).join(SEP) + SEP;

  return (
    <div
      className="w-full overflow-hidden bg-white border-b border-black/8 py-4 select-none"
      aria-hidden="true"
    >
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: "marquee-scroll 60s linear infinite",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Two copies — second picks up where first ends */}
        <span className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black shrink-0">
          {repeated}
        </span>
        <span className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black shrink-0">
          {repeated}
        </span>
      </div>
    </div>
  );
}
