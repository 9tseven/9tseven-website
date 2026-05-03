"use client";

import ScrollVelocity from "./ScrollVelocity";

interface CategoryMarqueeProps {
  text: string;
}

export default function CategoryMarquee({ text }: CategoryMarqueeProps) {
  return (
    <div
      className="w-full overflow-hidden bg-white border-b border-black/8 py-4 select-none"
      aria-hidden="true"
    >
      <ScrollVelocity
        texts={[text]}
        velocity={60}
        className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black"
      />
      <ScrollVelocity
        texts={[text]}
        velocity={-60}
        className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black/20"
      />
    </div>
  );
}
