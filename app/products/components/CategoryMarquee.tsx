"use client";

import ScrollVelocity from "./ScrollVelocity";

interface CategoryMarqueeProps {
  text: string;
}

export default function CategoryMarquee({ text }: CategoryMarqueeProps) {
  return (
    <div className="grid w-full overflow-hidden border-b border-black/8 py-4 select-none" aria-hidden="true">
      <div className="row-start-1 col-start-1 mt-14">
        <ScrollVelocity texts={[text]} velocity={-60} className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-black/20" />
      </div>
      <div className="row-start-1 col-start-1">
        <ScrollVelocity texts={[text]} velocity={60} className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-black" />
      </div>
    </div>
  );
}
