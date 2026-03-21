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
