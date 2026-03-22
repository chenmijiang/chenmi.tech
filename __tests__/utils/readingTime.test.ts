import { describe, expect, it } from "vitest";
import { calculateReadingTime } from "@/utils/readingTime";

describe("calculateReadingTime", () => {
  it("should return only the number of minutes, no label", () => {
    const result = calculateReadingTime("a ".repeat(500));
    expect(result).toMatch(/^\d+$/);
    expect(result).not.toContain("min");
    expect(result).not.toContain("read");
  });

  it("should return at least 1 minute for short content", () => {
    const result = calculateReadingTime("Hello world");
    expect(result).toBe("1");
  });

  it("should return higher number for long content", () => {
    // ~1000 words → ~5 min at 200 wpm
    const result = calculateReadingTime("word ".repeat(1000));
    expect(Number(result)).toBeGreaterThanOrEqual(4);
  });
});
