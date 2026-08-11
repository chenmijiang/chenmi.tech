import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLocale, type Locale, ui } from "./ui";

const locales = Object.keys(ui) as Locale[];
const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

function stripTrailingSlash(path: string): string {
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function getLocale(locale: string | undefined): Locale {
  return locale && locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export function localePath(locale: Locale, path = ""): string {
  return stripTrailingSlash(getRelativeLocaleUrl(locale, path.replace(/^\//, "")));
}

export function localePathname(pathname: string): string {
  return pathname.replace(localePrefix, "") || "/";
}

export function localePathFromPathname(locale: Locale, pathname: string): string {
  return localePath(locale, localePathname(pathname));
}

export function legacyBlogPath(pathname: string): string | null {
  const path = localePathname(pathname);
  if (!path.startsWith("/blog")) return null;
  const locale = pathname.match(localePrefix)?.[1];
  return localePath(getLocale(locale), path.replace(/^\/blog/, "/posts"));
}

export function getAlternateLocalePaths(pathname: string): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, localePathFromPathname(locale, pathname)])
  ) as Record<Locale, string>;
}

export function getRootLocaleRedirect({
  pathname,
  navigatorLanguage,
  storedLocale,
}: {
  pathname: string;
  navigatorLanguage?: string;
  storedLocale?: string | null;
}): string | null {
  if (pathname !== "/" && pathname !== "") return null;
  if (storedLocale && locales.includes(storedLocale as Locale)) {
    return storedLocale === defaultLocale ? null : localePath(storedLocale as Locale);
  }
  return navigatorLanguage?.toLowerCase().startsWith("zh") ? localePath("zh") : null;
}
