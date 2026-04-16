"use client";

interface CategoryMarqueeProps {
  text: string;
}

export default function CategoryMarquee({ text }: CategoryMarqueeProps) {
  // Two identical copies side-by-side. The animation translates -50% so the
  // second copy slides into view exactly where the first ended — zero gap.
  const repeated = Array(12).fill(text).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

  return (
    <div
      className="w-full overflow-hidden bg-white border-b border-black/8 py-4 select-none"
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: "marquee-scroll 20s linear infinite",
          willChange: "transform",
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
