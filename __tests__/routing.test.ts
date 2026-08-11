import { describe, expect, it } from "vitest";
import {
  getAlternateLocalePaths,
  getLocale,
  getRootLocaleRedirect,
  localePath,
  localePathFromPathname,
  localePathname,
} from "@/i18n/routing";

describe("locale routing", () => {
  it("uses the default locale for root and invalid locales", () => {
    expect(getLocale(undefined)).toBe("en");
    expect(getLocale("fr")).toBe("en");
    expect(localePath("en")).toBe("/");
  });

  it("prefixes non-default nested paths without trailing slashes", () => {
    expect(localePath("zh", "/posts/example/")).toBe("/zh/posts/example");
  });

  it("normalizes prefixed pagination inputs for either locale", () => {
    expect(localePathFromPathname("zh", "/zh/page/2/")).toBe("/zh/page/2");
    expect(localePathFromPathname("en", "/zh/page/2/")).toBe("/page/2");
  });

  it("returns root alternates", () => {
    expect(getAlternateLocalePaths("/")).toEqual({ en: "/", zh: "/zh" });
  });

  it("switches languages for nested paths and roots", () => {
    expect(localePathname("/zh/posts/example")).toBe("/posts/example");
    expect(localePathFromPathname("zh", "/posts/example/")).toBe("/zh/posts/example");
    expect(localePathFromPathname("en", "/zh")).toBe("/");
  });

  it("redirects only the root to a non-default preference", () => {
    expect(getRootLocaleRedirect({ pathname: "/", storedLocale: "zh" })).toBe("/zh");
    expect(getRootLocaleRedirect({ pathname: "/", storedLocale: "en" })).toBeNull();
    expect(getRootLocaleRedirect({ pathname: "/posts", navigatorLanguage: "zh-CN" })).toBeNull();
  });
});
