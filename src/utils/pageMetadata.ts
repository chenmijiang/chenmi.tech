import { getAlternateLocalePaths } from "@/i18n/routing";
import type { Locale } from "@/i18n/ui";

export function getPageMetadata({
  url,
  canonicalURL,
  ogImage,
  siteOgImage,
}: {
  url: URL;
  canonicalURL?: string;
  ogImage?: string;
  siteOgImage?: string;
}) {
  const canonical = canonicalURL || new URL(url.pathname, url).href;
  const image = new URL(ogImage || siteOgImage || "/og.png", url).href;
  const alternates = Object.fromEntries(
    Object.entries(getAlternateLocalePaths(url.pathname)).map(([locale, path]) => [
      locale,
      new URL(path, url).href,
    ])
  ) as Record<Locale, string>;

  return { canonical, image, alternates };
}

export function getBlogPosting({
  title,
  description,
  author,
  profile,
  pubDatetime,
  modDatetime,
  canonical,
  image,
  tags,
  wordCount,
  readingTime,
}: {
  title: string;
  description: string;
  author: string;
  profile?: string;
  pubDatetime: Date;
  modDatetime?: Date | null;
  canonical: string;
  image: string;
  tags?: string[];
  wordCount?: number;
  readingTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: { "@type": "Person", name: author, ...(profile && { url: profile }) },
    datePublished: pubDatetime.toISOString(),
    dateModified: (modDatetime || pubDatetime).toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    image,
    ...(tags && { articleSection: tags[0] || "Technology", keywords: tags.join(", ") }),
    ...(wordCount && { wordCount }),
    ...(readingTime && { timeRequired: readingTime }),
  };
}
