import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getLocale, localePath } from "@/i18n/routing";
import getSortedPosts from "@/utils/getSortedPosts";

export const GET: APIRoute = async ({ currentLocale }) => {
  const locale = getLocale(currentLocale);
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);

  let markdownContent = `# Archives\n\n`;
  markdownContent += `Total posts: ${sortedPosts.length}\n\n`;

  // Group posts by year
  const postsByYear = sortedPosts.reduce(
    (acc, post) => {
      const year = post.data.pubDatetime.getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    },
    {} as Record<number, typeof sortedPosts>
  );

  // Sort years descending
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  markdownContent += `## Posts by Year\n\n`;

  for (const year of years) {
    const count = postsByYear[Number(year)].length;
    markdownContent += `- [${year}](${localePath(locale, "posts.md")}#${year}) (${count} post${count !== 1 ? "s" : ""})\n`;
  }

  markdownContent += `\n---\n\n[Back to Home](${localePath(locale, "index.md")}) | [All Posts](${localePath(locale, "posts.md")})`;

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
