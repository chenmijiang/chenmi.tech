import { describe, expect, it } from "vitest";
import {
  alternateLocalePath,
  getAlternateLocalePaths,
  getLocale,
  getRootLocaleRedirect,
  localePath,
  localePathname,
} from "@/i18n/routing";

describe("locale routing", () => {
  it("uses the default locale for root and invalid locales", () => {
    expect(getLocale(undefined)).toBe("en");
    expect(getLocale("fr")).toBe("en");
    expect(localePath("en", "")).toBe("/");
  });

  it("prefixes non-default locales without trailing slashes", () => {
    expect(localePath("zh", "")).toBe("/zh");
    expect(localePath("zh", "/posts/example/")).toBe("/zh/posts/example");
  });

  it("switches nested paths between the site locales", () => {
    expect(localePathname("/zh/posts/example")).toBe("/posts/example");
    expect(alternateLocalePath("en", "/zh/posts/example")).toBe("/posts/example");
    expect(getAlternateLocalePaths("/posts/example/")).toEqual({
      en: "/posts/example",
      zh: "/zh/posts/example",
    });
  });

  it("redirects only the root to a non-default preference", () => {
    expect(getRootLocaleRedirect({ pathname: "/", storedLocale: "zh" })).toBe("/zh");
    expect(getRootLocaleRedirect({ pathname: "/", storedLocale: "en" })).toBeNull();
    expect(getRootLocaleRedirect({ pathname: "/posts", navigatorLanguage: "zh-CN" })).toBeNull();
  });
});
