"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "./constants";

interface Props {
  post: BlogPost;
  index: number;
  top: number;
  onPeekHeight: (height: number) => void;
  articleRef?: (el: HTMLElement | null) => void;
  onClick?: () => void;
}

export default function BlogPostCard({ post, index, top, onPeekHeight, articleRef, onClick }: Props) {
  const h3Ref = useRef<HTMLHeadingElement>(null);
  const onPeekHeightRef = useRef(onPeekHeight);
  onPeekHeightRef.current = onPeekHeight;

  useEffect(() => {
    const el = h3Ref.current;
    if (!el) return;

    const measure = () => {
      // border-t(1) + padding-top(20) + h3 height + padding-bottom(16)
      onPeekHeightRef.current(1 + 20 + el.offsetHeight + 16);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();

    return () => ro.disconnect();
  }, []);

  return (
    <article ref={articleRef} onClick={onClick} className="md:sticky bg-white border-t border-ink flex flex-col md:flex-row cursor-pointer" style={{ zIndex: index + 1, top: `${top}px` }}>
      <div className="md:flex gap-5 p-5 md:w-1/2 shrink-0">
        <div className="flex flex-row md:flex-col justify-between gap-2 w-full md:w-36 shrink-0 mb-2 md:mb-0">
          <span className="font-mono text-sm tracking-tight text-ink">{post.tag}</span>
          {post.date && <span className="font-mono text-sm tracking-tight text-ink">{post.date}</span>}
        </div>
        <div className="flex flex-col gap-2.5 items-start">
          <h3 ref={h3Ref} className="font-semibold text-xl tracking-tight text-ink whitespace-pre-wrap">
            {post.title}
          </h3>
          <p className="text-base tracking-tight text-ink whitespace-pre-wrap leading-relaxed">{post.body}</p>
          {post.link && (
            <Link href={post.link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="font-mono text-sm tracking-tight text-ink underline underline-offset-4 transition-opacity hover:opacity-50">
              {post.link.text.toUpperCase()}
            </Link>
          )}
        </div>
      </div>

      <div className="relative h-64 md:flex-1 md:min-h-150">
        <Image src={post.image} alt={post.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    </article>
  );
}
