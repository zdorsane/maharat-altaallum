import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type Tone = "default" | "light";

/**
 * Brand symbol: an open book on a deep-teal tile with a warm-yellow spark.
 * `light` inverts the tile for use on teal backgrounds. Same geometry as src/app/icon.svg.
 */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: Tone }) {
  const tile = tone === "light" ? "#F7F5EF" : "#245B73";
  const page = tone === "light" ? "#245B73" : "#F7F5EF";
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("size-10 shrink-0", className)}>
      <rect width="48" height="48" rx="14" fill={tile} />
      <path d="M9.5 15.6c4.7-2 9.2-1.7 13 1.2v17.6c-3.8-2.7-8.3-3-13-1.2Z" fill={page} />
      <path d="M38.5 15.6c-4.7-2-9.2-1.7-13 1.2v17.6c3.8-2.7 8.3-3 13-1.2Z" fill={page} fillOpacity=".78" />
      <path d="M13 21.5c2.6-.8 4.8-.6 6.6.5M13 25.8c2.6-.8 4.8-.6 6.6.5" stroke={tile} strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M38 5.5l1.5 4.4 4.5 1.6-4.5 1.6L38 17.5l-1.5-4.4-4.5-1.6 4.5-1.6Z" fill="#F3C969" className="animate-twinkle origin-center [transform-box:fill-box]" />
    </svg>
  );
}

/** Full logo: symbol + name in the page's script, with the other script as a quiet subtitle. */
export function Logo({ locale, tone = "default", hideTextOnMobile = false }: { locale: Locale; tone?: Tone; hideTextOnMobile?: boolean }) {
  const isAr = locale === "ar";
  const light = tone === "light";
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tone={tone} />
      <span className={cn("flex-col leading-none", hideTextOnMobile ? "hidden sm:flex" : "flex")}>
        <span className={cn("text-[1.15rem] font-extrabold tracking-tight", light ? "text-white" : "text-primary")}>
          {isAr ? "مهارات التعلم" : "Maharat"}
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold whitespace-nowrap",
            isAr ? "tracking-[0.2em] uppercase" : "tracking-normal",
            light ? "text-white/75" : "text-muted",
          )}
        >
          {isAr ? "Maharat Al Taallum" : "مهارات التعلم"}
        </span>
      </span>
    </span>
  );
}
