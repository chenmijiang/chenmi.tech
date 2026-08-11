import { type Locale, ui } from "./ui";

export const LOCALE_PREFERENCE_KEY = "locale-preference";

type StorageLike = Pick<Storage, "getItem">;
type WritableStorageLike = StorageLike & Pick<Storage, "setItem">;

function isLocale(value: string | null | undefined): value is Locale {
  if (!value) {
    return false;
  }

  return (Object.keys(ui) as Locale[]).includes(value as Locale);
}

export function getLocalePreference(storage: StorageLike): Locale | null {
  const locale = storage.getItem(LOCALE_PREFERENCE_KEY);
  return isLocale(locale) ? locale : null;
}

export function saveLocalePreference(storage: WritableStorageLike, locale: Locale): void {
  storage.setItem(LOCALE_PREFERENCE_KEY, locale);
}
