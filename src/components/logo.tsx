import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

/** Brand mark: an open book on a cobalt→teal tile, with a saffron spark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-grid size-10 shrink-0 place-items-center rounded-[14px] bg-linear-to-br from-[#2448e0] via-[#2a5cf0] to-[#0fb3a0] shadow-[0_8px_18px_-8px_rgb(36_72_224/0.7)] ring-1 ring-white/20 ring-inset",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[62%]">
        <path d="M3.4 6.3c3-1.3 5.8-1.1 8.2.8v11.7c-2.4-1.8-5.2-2-8.2-.8Z" fill="#fff" />
        <path d="M20.6 6.3c-3-1.3-5.8-1.1-8.2.8v11.7c2.4-1.8 5.2-2 8.2-.8Z" fill="#fff" fillOpacity=".72" />
      </svg>
      <svg viewBox="0 0 10 10" className="animate-twinkle absolute -end-1 -top-1 size-3.5 drop-shadow-sm">
        <path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2Z" fill="#f7b32b" />
      </svg>
    </span>
  );
}

/** Bilingual lockup: the name in the page's script, with the other script as a quiet subtitle. */
export function Logo({ locale, tone = "default", hideTextOnMobile = false }: { locale: Locale; tone?: "default" | "light"; hideTextOnMobile?: boolean }) {
  const isAr = locale === "ar";
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={cn("flex-col leading-none", hideTextOnMobile ? "hidden sm:flex" : "flex")}>
        <span className={cn("font-[family-name:var(--font-display)] text-lg font-bold tracking-tight", tone === "light" ? "text-white" : "text-ink")}>
          {isAr ? "مهارات التعلم" : "Maharat"}
        </span>
        <span
          className={cn("mt-1 text-[10px] font-medium whitespace-nowrap", isAr ? "tracking-[0.18em] uppercase" : "tracking-normal", tone === "light" ? "text-white/70" : "text-muted")}
        >
          {isAr ? "Maharat Al Taallum" : "مهارات التعلم"}
        </span>
      </span>
    </span>
  );
}
