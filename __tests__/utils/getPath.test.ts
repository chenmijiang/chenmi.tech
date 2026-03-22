import { describe, expect, it } from "vitest";
import { getPath } from "@/utils/getPath";

describe("getPath", () => {
  it("returns base path when no filePath", () => {
    const result = getPath("my-post", undefined);
    expect(result).toBe("/posts/my-post");
  });

  it("returns path with segments from filePath", () => {
    const result = getPath("my-post", "src/content/blog/tech/my-post.md");
    expect(result).toBe("/posts/tech/my-post");
  });

  it("excludes underscore-prefixed directories", () => {
    const result = getPath("my-post", "src/content/blog/_drafts/my-post.md");
    expect(result).toBe("/posts/my-post");
  });
});
