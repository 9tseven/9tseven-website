"use client";

import { useState, useCallback, useRef } from "react";
import { useLenis } from "lenis/react";
import type { BlogPost } from "./constants";
import BlogPostCard from "./BlogPostCard";

const NAVBAR_H = 60;

interface Props {
  posts: BlogPost[];
}

export default function BlogStack({ posts }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lenis = useLenis();

  const [peekHeights, setPeekHeights] = useState<number[]>(() => new Array(posts.length).fill(72));

  const updatePeek = useCallback((index: number, height: number) => {
    setPeekHeights((prev) => {
      if (prev[index] === height) return prev;
      const next = [...prev];
      next[index] = height;
      return next;
    });
  }, []);

  const tops = posts.map((_, i) => NAVBAR_H + peekHeights.slice(0, i).reduce((a, b) => a + b, 0));

  const handleCardClick = (index: number) => {
    if (!sectionRef.current || !headerRef.current) return;

    const scroll = lenis?.scroll ?? window.scrollY;
    const sectionDocTop = sectionRef.current.getBoundingClientRect().top + scroll;
    const headerH = headerRef.current.offsetHeight;

    let sumPrevCardHeights = 0;
    for (let i = 0; i < index; i++) {
      sumPrevCardHeights += cardRefs.current[i]?.offsetHeight ?? 0;
    }

    const naturalCardTop = sectionDocTop + headerH + sumPrevCardHeights;
    const targetScroll = naturalCardTop - tops[index];

    lenis?.scrollTo(targetScroll, { duration: 1.2 });
  };

  return (
    <section ref={sectionRef} data-nav-theme="light" className="relative bg-fg">
      <div ref={headerRef} className="p-5 md:p-0 flex items-start justify-between">
        <div className="hidden md:block md:w-1/2 h-22" />
        <div className="flex flex-col justify-center gap-1 h-22 py-2 md:w-1/2">
          <h2 className="text-2xl font-bold text-ink">Journal</h2>
          <p className="text-xl text-ink">Recent work, moments, and ongoing process.</p>
        </div>
      </div>

      {posts.map((post, index) => (
        <BlogPostCard
          key={post.id}
          post={post}
          index={index}
          top={tops[index]}
          onPeekHeight={(h) => updatePeek(index, h)}
          articleRef={(el) => {
            cardRefs.current[index] = el;
          }}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </section>
  );
}
