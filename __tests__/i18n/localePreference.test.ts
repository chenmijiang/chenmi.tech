import { describe, expect, it } from "vitest";
import {
  getLocalePreference,
  getRootLocaleRedirect,
  saveLocalePreference,
} from "@/i18n/localePreference";

describe("localePreference", () => {
  it("persists the manually selected locale in localStorage", () => {
    const storage = new Map<string, string>();

    saveLocalePreference(
      {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
      "zh"
    );

    expect(storage.get("locale-preference")).toBe("zh");
    expect(
      getLocalePreference({
        getItem: (key) => storage.get(key) ?? null,
      })
    ).toBe("zh");
  });

  it("redirects the root path using the saved locale preference before browser language", () => {
    expect(
      getRootLocaleRedirect({
        pathname: "/",
        navigatorLanguage: "en-US",
        storedLocale: "zh",
      })
    ).toBe("/zh");
  });

  it("does not redirect Chinese browsers away from root when English was manually selected", () => {
    expect(
      getRootLocaleRedirect({
        pathname: "/",
        navigatorLanguage: "zh-CN",
        storedLocale: "en",
      })
    ).toBeNull();
  });
});
