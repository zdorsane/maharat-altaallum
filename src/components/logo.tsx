import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type Tone = "default" | "light";

/*
 * Maharat brand symbol, vectorised from the official logo (public/brand/maharat-logo.png):
 * a three-layer open book (teal / mint / yellow) with a child rising from its spine,
 * and the letters أ ب ت floating above. Drawn in the source artwork's pixel space.
 * `tone="light"` swaps the teal ink for ivory on dark/teal backgrounds.
 */
export function LogoMark({ className, tone = "default", letters = true }: { className?: string; tone?: Tone; letters?: boolean }) {
  const ink = tone === "light" ? "#F7F5EF" : "var(--primary)";
  const viewBox = letters ? "440 120 660 400" : "440 260 660 260";
  return (
    <svg viewBox={viewBox} aria-hidden className={cn("shrink-0", className)}>
      {letters && (
        <g fontFamily="var(--font-plex-arabic), sans-serif" fontWeight="700">
          <path d="M630 156l20 20M662 130l10 28" stroke="#F3C969" strokeWidth="11" strokeLinecap="round" />
          <text x="618" y="292" fontSize="128" fill="#F3C969" transform="rotate(-16 618 250)" textAnchor="middle">
            أ
          </text>
          <text x="772" y="212" fontSize="118" fill="#67B7A5" textAnchor="middle">
            ب
          </text>
          <text x="922" y="282" fontSize="118" fill="#F2A69B" transform="rotate(16 922 240)" textAnchor="middle">
            ت
          </text>
        </g>
      )}
      {/* top (yellow) pages */}
      <path d="M525 320C622 326 692 370 730 430 662 382 600 360 520 352Z" fill="#F3C969" />
      <path d="M1015 320C918 326 848 370 810 430 878 382 940 360 1020 352Z" fill="#F3C969" />
      {/* middle (mint) pages */}
      <path d="M470 362C592 350 692 400 744 466 672 422 572 402 460 410Z" fill="#67B7A5" />
      <path d="M1070 362C948 350 848 400 796 466 868 422 968 402 1080 410Z" fill="#67B7A5" />
      {/* cover (teal) */}
      <path d="M450 430C576 404 700 424 762 490Q770 498 770 514 700 470 580 455 470 478Z" fill={ink} />
      <path d="M1090 430C964 404 840 424 778 490Q770 498 770 514 840 470 960 455 1070 478Z" fill={ink} />
      {/* child rising from the spine */}
      <path d="M645 312C735 330 782 385 772 468 757 405 715 350 645 312Z" fill={ink} />
      <path d="M895 312C805 330 758 385 768 468 783 405 825 350 895 312Z" fill={ink} />
      <circle cx="770" cy="302" r="33" fill={ink} />
    </svg>
  );
}

/** Horizontal lockup for navigation bars: symbol + name in the page's script, other script as subtitle. */
export function Logo({ locale, tone = "default", hideTextOnMobile = false }: { locale: Locale; tone?: Tone; hideTextOnMobile?: boolean }) {
  const isAr = locale === "ar";
  const light = tone === "light";
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tone={tone} className="h-10 w-auto" />
      <span className={cn("flex-col leading-none", hideTextOnMobile ? "hidden sm:flex" : "flex")}>
        <span className={cn("text-[1.2rem] font-extrabold tracking-tight", light ? "text-white" : "text-primary")}>{isAr ? "مهارات التعلم" : "Maharat"}</span>
        <span dir="ltr" className={cn("mt-1 text-[9.5px] font-bold tracking-[0.32em] uppercase", isAr && "text-end", light ? "text-white/75" : "text-muted")}>
          {isAr ? "Maharat Al Taallum" : "Al Taallum"}
        </span>
      </span>
    </span>
  );
}

/** Stacked lockup matching the official artwork: symbol, "Maharat", ruled "AL TAALLUM", Arabic name. */
export function LogoStacked({ tone = "default", className }: { tone?: Tone; className?: string }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex flex-col items-center text-center", className)}>
      <LogoMark tone={tone} className="h-20 w-auto" />
      <span dir="ltr" className={cn("mt-2 text-4xl leading-none font-extrabold tracking-tight", light ? "text-white" : "text-primary")}>
        Maharat
      </span>
      <span dir="ltr" className={cn("mt-2 flex items-center gap-3 text-xs font-bold tracking-[0.45em] uppercase", light ? "text-white/85" : "text-ink")}>
        <span className="h-0.5 w-8 rounded-full bg-teal" aria-hidden />
        Al Taallum
        <span className="h-0.5 w-8 rounded-full bg-teal" aria-hidden />
      </span>
      <span lang="ar" className={cn("mt-1 font-[family-name:var(--font-plex-arabic)] text-2xl font-bold", light ? "text-white" : "text-primary")}>
        مهارات التعلم
      </span>
    </span>
  );
}
