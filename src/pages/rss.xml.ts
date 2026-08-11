import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE } from "@/config";
import { localePath } from "@/i18n/routing";
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
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    customData: `<atom:link href="${SITE.website}rss.xml" rel="self" type="application/rss+xml" /><atom:link href="${SITE.website}zh/rss.xml" rel="alternate" type="application/rss+xml" hreflang="zh" />`,
    items: sortedPosts.map(({ data, id, filePath }) => {
      const postPath = getPath(id, filePath);
      const postLocalePath = localePath(defaultLocale, postPath);
      return {
        link: new URL(postLocalePath, siteURL).toString(),
        title: data.title,
        description: data.description,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      };
    }),
  });
}
