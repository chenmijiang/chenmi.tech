import { describe, expect, it } from "vitest";
import { formatDate } from "@/i18n/utils";

describe("formatDate", () => {
  const testDate = new Date("2026-03-20T15:55:00Z");

  it("should format date in English with English month abbreviation", () => {
    const result = formatDate("en", testDate);
    expect(result).toBe("20 Mar, 2026");
  });

  it("should format date in Chinese with Chinese month", () => {
    const result = formatDate("zh", testDate);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/3/);
    expect(result).toMatch(/20/);
    // Should NOT contain English month
    expect(result).not.toMatch(/Mar/);
  });

  it("should use Chinese date format (YYYY年M月D日)", () => {
    const result = formatDate("zh", testDate);
    expect(result).toBe("2026年3月20日");
  });

  it("should handle different months correctly in zh", () => {
    expect(formatDate("zh", new Date("2026-01-15"))).toBe("2026年1月15日");
    expect(formatDate("zh", new Date("2026-12-01"))).toBe("2026年12月1日");
  });

  it("should handle different months correctly in en", () => {
    expect(formatDate("en", new Date("2026-01-15"))).toBe("15 Jan, 2026");
    expect(formatDate("en", new Date("2026-12-01"))).toBe("1 Dec, 2026");
  });
});
