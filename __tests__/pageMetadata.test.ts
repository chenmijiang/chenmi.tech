import { describe, expect, it } from "vitest";
import { getBlogPosting, getPageMetadata } from "@/utils/pageMetadata";

describe("page metadata", () => {
  it("uses a normalized canonical and matching language alternates", () => {
    expect(
      getPageMetadata({
        url: new URL("https://chenmi.tech/zh/posts/example/"),
        locale: "zh",
        siteOgImage: "/site.png",
      })
    ).toMatchObject({
      canonical: "https://chenmi.tech/zh/posts/example/",
      image: "https://chenmi.tech/site.png",
      alternates: {
        en: "https://chenmi.tech/posts/example",
        zh: "https://chenmi.tech/zh/posts/example",
      },
    });
  });

  it("preserves canonical overrides and gives article images precedence", () => {
    expect(
      getPageMetadata({
        url: new URL("https://chenmi.tech/posts/example"),
        locale: "en",
        canonicalURL: "https://example.com/original",
        ogImage: "https://images.example.com/post.png",
        siteOgImage: "/site.png",
      })
    ).toMatchObject({
      canonical: "https://example.com/original",
      image: "https://images.example.com/post.png",
    });
  });

  it("makes BlogPosting reference its canonical URL", () => {
    const canonical = "https://chenmi.tech/posts/example";
    const posting = getBlogPosting({
      title: "Example",
      description: "Description",
      author: "chenmi",
      pubDatetime: new Date("2026-01-02T03:04:05Z"),
      canonical,
      image: "https://chenmi.tech/post.png",
    });

    expect(posting.mainEntityOfPage["@id"]).toBe(canonical);
    expect(posting.image).toBe("https://chenmi.tech/post.png");
  });
});
