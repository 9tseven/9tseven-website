import { BLOG_POSTS } from "./constants";
import BlogPostCard from "./BlogPostCard";

export default function BlogSection() {
  return (
    <section data-nav-theme="light" className="bg-white">
      {/* Section header — title pinned to the right half, matching Figma offset layout */}
      <div className="flex items-start justify-between">
        <div className="hidden md:block md:w-1/2 h-22" />
        <div className="flex flex-col justify-center gap-1 h-22 py-2 md:w-1/2">
          <h2 className="text-2xl font-bold text-black">Journal</h2>
          <p className="text-xl text-black">Recent work, moments, and ongoing process.</p>
        </div>
      </div>

      {/* Stacking blog post cards */}
      {BLOG_POSTS.map((post, index) => (
        <BlogPostCard key={post.id} post={post} index={index} />
      ))}
    </section>
  );
}
