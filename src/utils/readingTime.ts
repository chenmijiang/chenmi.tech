import { getCollection } from "astro:content";
import readingTime from "reading-time";

export function calculateReadingTime(content: string): string {
  const stats = readingTime(content);
  const minutes = Math.ceil(stats.minutes);
  return `${minutes}`;
}

export async function getReadingTime(postId: string): Promise<string> {
  const posts = await getCollection("blog");
  const post = posts.find((p) => p.id === postId);

  if (!post || !post.body) {
    return "5"; // fallback
  }

  return calculateReadingTime(post.body);
}
