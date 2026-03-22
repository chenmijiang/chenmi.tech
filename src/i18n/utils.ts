import { defaultLocale, type Locale, ui } from "./ui";

export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: unknown = ui[locale];
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof value === "string" ? value : key;
}

export function getCurrentLocale(locale: string | undefined): Locale {
  const supportedLocales = Object.keys(ui) as Locale[];
  return locale && supportedLocales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

/**
 * Remove trailing slash from a path, except for the root "/".
 * Use this to wrap getRelativeLocaleUrl() output when trailingSlash is "never".
 */
export function stripTrailingSlash(path: string): string {
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}
