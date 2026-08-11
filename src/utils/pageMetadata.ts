import { getAlternateLocalePaths } from "@/i18n/routing";
import type { Locale } from "@/i18n/ui";

export function getPageMetadata({
  url,
  locale,
  canonicalURL,
  ogImage,
  siteOgImage,
}: {
  url: URL;
  locale: Locale;
  canonicalURL?: string;
  ogImage?: string;
  siteOgImage?: string;
}) {
  const canonical = canonicalURL || new URL(url.pathname, url).href;
  const image = new URL(ogImage || siteOgImage || "/og.png", url).href;
  const alternatePaths = getAlternateLocalePaths(url.pathname);
  const alternates = Object.fromEntries(
    Object.entries(alternatePaths).map(([alternateLocale, path]) => [
      alternateLocale,
      new URL(path, url).href,
    ])
  ) as Record<Locale, string>;

  return { locale, canonical, image, alternates };
}

export function getWebSite({
  title,
  website,
  description,
  author,
}: {
  title: string;
  website: string;
  description: string;
  author: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    url: website,
    description,
    author: { "@type": "Person", name: author },
    potentialAction: {
      "@type": "SearchAction",
      target: `${website}search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getPerson({
  author,
  website,
  description,
  image,
  socialLinks,
}: {
  author: string;
  website: string;
  description: string;
  image: string;
  socialLinks: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author,
    url: website,
    image,
    sameAs: socialLinks,
    jobTitle: "Full-Stack Developer",
    description,
  };
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
