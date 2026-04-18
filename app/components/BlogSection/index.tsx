import { BLOG_POSTS } from "./constants";
import BlogPostCard from "./BlogPostCard";

export default function BlogSection() {
  return (
    <section data-nav-theme="light" className="bg-white">
      {/* Section header — title pinned to the right half, matching Figma offset layout */}
      <div className="flex items-end justify-between px-5 pt-12 pb-0">
        <div className="hidden md:block md:w-1/2" />
        <div className="flex flex-col gap-2.5 px-5 pb-5">
          <h2 className="font-mono text-[2rem] tracking-[-0.05em] text-black">Journal</h2>
          <p className="font-mono text-xl tracking-[-0.05em] text-black/70">
            Recent work, moments, and ongoing process.
          </p>
        </div>
      </div>

      {/* Stacking blog post cards */}
      {BLOG_POSTS.map((post, index) => (
        <BlogPostCard key={post.id} post={post} index={index} />
      ))}
    </section>
  );
}
