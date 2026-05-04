import { getBlogPosts } from "@/app/lib/blogPosts";
import BlogStack from "./BlogStack";

export default async function BlogSection() {
  const posts = await getBlogPosts();
  return <BlogStack posts={posts} />;
}
