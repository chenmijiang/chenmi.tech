import { describe, expect, it } from "vitest";
import { type Locale, ui } from "@/i18n/ui";
import { getCurrentLocale, stripTrailingSlash, t } from "@/i18n/utils";

/**
 * Recursively collect all leaf keys from a nested object.
 * Returns dot-separated paths like "nav.blog", "datetime.months.january".
 */
function getLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getLeafKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n translation coverage", () => {
  const locales = Object.keys(ui) as Locale[];
  const enKeys = getLeafKeys(ui.en as unknown as Record<string, unknown>);
  const zhKeys = getLeafKeys(ui.zh as unknown as Record<string, unknown>);

  it("should have at least 2 locales (en, zh)", () => {
    expect(locales).toContain("en");
    expect(locales).toContain("zh");
    expect(locales.length).toBeGreaterThanOrEqual(2);
  });

  it("should have all en keys present in zh", () => {
    const missingInZh = enKeys.filter((key) => !zhKeys.includes(key));
    expect(missingInZh, `Missing in zh: ${missingInZh.join(", ")}`).toEqual([]);
  });

  it("should have all zh keys present in en", () => {
    const missingInEn = zhKeys.filter((key) => !enKeys.includes(key));
    expect(missingInEn, `Missing in en: ${missingInEn.join(", ")}`).toEqual([]);
  });

  it("should have no empty string values in en", () => {
    const emptyKeys = enKeys.filter((key) => t("en", key) === "");
    expect(emptyKeys, `Empty values in en: ${emptyKeys.join(", ")}`).toEqual([]);
  });

  it("should have no empty string values in zh", () => {
    const emptyKeys = zhKeys.filter((key) => t("zh", key) === "");
    expect(emptyKeys, `Empty values in zh: ${emptyKeys.join(", ")}`).toEqual([]);
  });

  it("t() should return the key itself for missing translations (fallback)", () => {
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
    expect(t("zh", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("t() should return correct translations for known keys", () => {
    expect(t("en", "nav.blog")).toBe("Blog");
    expect(t("zh", "nav.blog")).toBe("博客");
    expect(t("en", "home.greeting")).toBe("Hi, I'm chenmi.");
    expect(t("zh", "home.greeting")).toBe("你好，我是 chenmi。");
  });

  it("getCurrentLocale should return valid locale or default", () => {
    expect(getCurrentLocale("en")).toBe("en");
    expect(getCurrentLocale("zh")).toBe("zh");
    expect(getCurrentLocale(undefined)).toBe("en");
    expect(getCurrentLocale("fr")).toBe("en");
  });

  it("en and zh should have the same number of keys", () => {
    expect(enKeys.length).toBe(zhKeys.length);
  });

  // Verify specific translation categories exist
  const expectedCategories = [
    "nav",
    "pagination",
    "footer",
    "datetime",
    "search",
    "notFound",
    "card",
    "home",
    "posts",
    "tags",
    "share",
    "newsletter",
    "code",
    "archives",
  ];

  for (const category of expectedCategories) {
    it(`should have translations for category "${category}" in both locales`, () => {
      const enCategoryKeys = enKeys.filter((k) => k.startsWith(`${category}.`));
      const zhCategoryKeys = zhKeys.filter((k) => k.startsWith(`${category}.`));
      expect(enCategoryKeys.length, `Category "${category}" missing in en`).toBeGreaterThan(0);
      expect(zhCategoryKeys.length, `Category "${category}" missing in zh`).toBeGreaterThan(0);
      expect(enCategoryKeys.length).toBe(zhCategoryKeys.length);
    });
  }
});

describe("stripTrailingSlash", () => {
  it("should remove trailing slash from paths", () => {
    expect(stripTrailingSlash("/zh/")).toBe("/zh");
    expect(stripTrailingSlash("/zh/posts/")).toBe("/zh/posts");
    expect(stripTrailingSlash("/posts/")).toBe("/posts");
  });

  it("should not modify root path", () => {
    expect(stripTrailingSlash("/")).toBe("/");
  });

  it("should not modify paths without trailing slash", () => {
    expect(stripTrailingSlash("/zh")).toBe("/zh");
    expect(stripTrailingSlash("/zh/posts")).toBe("/zh/posts");
    expect(stripTrailingSlash("/posts")).toBe("/posts");
  });

  it("should handle empty string", () => {
    expect(stripTrailingSlash("")).toBe("");
  });
});
