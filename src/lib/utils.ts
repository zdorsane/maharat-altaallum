import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const intlLocale: Record<string, string> = { ar: "ar-DZ-u-nu-latn", fr: "fr-DZ", en: "en-GB" };

export function formatDate(d: Date | string, locale = "ar", opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale[locale] ?? "ar-DZ-u-nu-latn", opts ?? { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export function formatDateTime(d: Date | string, locale = "ar") {
  return formatDate(d, locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ageInYears(birthDate: Date | string) {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function lines(text: string | null | undefined) {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Localised age, e.g. "7 سنوات" / "7 ans" / "7 years old". */
export function ageLabel(birthDate: Date | string, t: { ageFew: string; ageMany: string }) {
  const n = ageInYears(birthDate);
  const tpl = n >= 3 && n <= 10 ? t.ageFew : t.ageMany;
  return tpl.replace("{n}", String(n));
}
