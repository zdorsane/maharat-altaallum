// Locale settings shared by server, client and middleware code.
export const LOCALES = ["ar", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "mt_locale";

export const LOCALE_NAMES: Record<Locale, string> = { ar: "العربية", fr: "Français", en: "English" };
export const LOCALE_SHORT: Record<Locale, string> = { ar: "ع", fr: "FR", en: "EN" };

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

/** Replaces `{key}` placeholders in a dictionary string. */
export function fmt(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
