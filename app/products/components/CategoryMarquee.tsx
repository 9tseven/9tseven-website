"use client";

import { useEffect, useRef, useState } from "react";
import ScrollVelocity from "./ScrollVelocity";

interface CategoryMarqueeProps {
  text: string;
}

const TEXT_CLASS = "text-5xl md:text-7xl font-bold uppercase tracking-tighter";

function CssTextMarquee({ text, direction, colorClass }: { text: string; direction: "left" | "right"; colorClass: string }) {
  const repeated = Array.from({ length: 6 }, () => text).join("   ");
  return (
    <div className="overflow-hidden">
      <div className={`text-marquee text-marquee--${direction}`}>
        <span className={`${TEXT_CLASS} ${colorClass}`}>{repeated}&nbsp;&nbsp;&nbsp;</span>
        <span className={`${TEXT_CLASS} ${colorClass}`} aria-hidden="true">
          {repeated}&nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
}

export default function CategoryMarquee({ text }: CategoryMarqueeProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const useJsVersion = isDesktop && inView;

  return (
    <div ref={containerRef} className="grid w-full overflow-hidden border-b border-black/8 py-0 md:py-4 select-none " aria-hidden="true">
      {useJsVersion ? (
        <>
          <div className="row-start-1 col-start-1 mt-12 md:mt-14">
            <ScrollVelocity texts={[text]} velocity={-60} className={`${TEXT_CLASS} text-black/20`} />
          </div>
          <div className="row-start-1 col-start-1">
            <ScrollVelocity texts={[text]} velocity={60} className={`${TEXT_CLASS} text-black`} />
          </div>
        </>
      ) : (
        <>
          <div className="row-start-1 col-start-1 mt-10 md:mt-14">
            <CssTextMarquee text={text} direction="right" colorClass="text-black/20" />
          </div>
          <div className="row-start-1 col-start-1">
            <CssTextMarquee text={text} direction="left" colorClass="text-black" />
          </div>
        </>
      )}
    </div>
  );
}
