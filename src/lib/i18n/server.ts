import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirOf, isLocale, type Locale } from "./config";
import { ar, type Dict } from "./dictionaries/ar";
import { fr } from "./dictionaries/fr";
import { en } from "./dictionaries/en";

export const DICTS: Record<Locale, Dict> = { ar, fr, en };

/** Cookie choice first, then the browser's Accept-Language, then Arabic. */
export const getLocale = cache(async (): Promise<Locale> => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
});

export async function getI18n() {
  const locale = await getLocale();
  return { locale, dir: dirOf(locale), t: DICTS[locale] };
}

export type { Dict, Locale };
