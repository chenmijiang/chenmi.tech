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

const enMonthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * Format a date according to locale.
 * en: "20 Mar, 2026"
 * zh: "2026年3月20日"
 */
export function formatDate(locale: Locale, date: Date): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth(); // 0-based
  const year = d.getFullYear();

  if (locale === "zh") {
    return `${year}年${month + 1}月${day}日`;
  }

  return `${day} ${enMonthsShort[month]}, ${year}`;
}
