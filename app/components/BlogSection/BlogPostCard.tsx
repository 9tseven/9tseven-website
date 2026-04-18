import Image from "next/image";
import type { BlogPost } from "./constants";

export default function BlogPostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <article className="sticky top-0 bg-white border-t border-black flex flex-col md:flex-row" style={{ zIndex: (index + 1) * 10 }}>
      {/* Left: text content */}
      <div className="flex gap-5 p-5 md:w-1/2 shrink-0">
        <span className="font-mono text-sm tracking-[-0.05em] text-black shrink-0 w-36">{post.tag}</span>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-semibold text-xl tracking-[-0.05em] text-black whitespace-pre-wrap">{post.title}</h3>
          <p className="text-base tracking-[-0.05em] text-black whitespace-pre-wrap leading-relaxed">{post.body}</p>
        </div>
      </div>

      {/* Right: image */}
      <div className="relative h-64 md:flex-1 md:min-h-150">
        <Image src={post.image} alt={post.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    </article>
  );
}
