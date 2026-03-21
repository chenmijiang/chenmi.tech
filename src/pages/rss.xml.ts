import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import rss from "@astrojs/rss";
import { SITE } from "@/config";
import { defaultLocale } from "@/i18n/ui";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  const siteURL = new URL(SITE.website);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    customData: `<atom:link href="${SITE.website}zh/rss.xml" rel="alternate" type="application/rss+xml" hreflang="zh" />`,
    items: sortedPosts.map(({ data, id, filePath }) => {
      const postPath = getPath(id, filePath);
      const localePath = getRelativeLocaleUrl(defaultLocale, postPath.replace(/^\//, ""));
      return {
        link: new URL(localePath, siteURL).toString(),
        title: data.title,
        description: data.description,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      };
    }),
  });
}
