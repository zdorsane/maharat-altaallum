import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type Tone = "default" | "light";

/*
 * AFAQ brand symbol: an open book (knowledge) from which a child (potential) rises and
 * reaches toward a golden star (success), framed by a golden horizon arc (new opportunities).
 * `tone="light"` renders the purple parts in white for dark/purple backgrounds.
 */
export function LogoMark({ className, tone = "default", title }: { className?: string; tone?: Tone; title?: string }) {
  const light = tone === "light";
  const deep = light ? "#FFFFFF" : "var(--logo-deep, #4B2CBF)";
  const lav = light ? "#D9CCFF" : "#A78BFA";
  return (
    <svg viewBox="0 0 200 150" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={cn("shrink-0", className)}>
      {/* horizon arc */}
      <path d="M36 72C58 34 104 14 150 22 108 22 70 42 44 76Z" fill="#F6B94D" />
      {/* sparkles */}
      <path d="M154 10l5 14 14 5-14 5-5 14-5-14-14-5 14-5Z" fill="#F6B94D" className="animate-twinkle origin-center [transform-box:fill-box]" />
      <path d="M70 44l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4Z" fill={lav} />
      <path d="M176 52l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#60B5F5" />
      {/* child reaching for the star */}
      <circle cx="93" cy="55" r="9.5" fill={deep} />
      <path
        d="M84 112C83 96 84 82 89 74C92 69 97 67 102 68L129 42C131 40 135 41 135 44C135 45 134.5 46 134 47L111 76C111.5 88 112 100 113 112Z"
        fill={deep}
      />
      {/* open book */}
      <path d="M100 114C84 96 58 88 30 90 28 86 27 82 26 77 58 73 86 83 100 101Z" fill="#60B5F5" />
      <path d="M100 114C116 96 142 88 170 90 172 86 173 82 174 77 142 73 114 83 100 101Z" fill="#F6B94D" />
      <path d="M100 132C80 112 50 104 16 108 14 102 12 96 12 89 48 85 82 95 100 117Z" fill={deep} />
      <path d="M100 132C120 112 150 104 184 108 186 102 188 96 188 89 152 85 118 95 100 117Z" fill={lav} />
    </svg>
  );
}

/** Horizontal lockup: symbol + "AFAQ | آفاق". */
export function Logo({ tone = "default", hideTextOnMobile = false, className }: { locale?: Locale; tone?: Tone; hideTextOnMobile?: boolean; className?: string }) {
  const light = tone === "light";
  return (
    <span dir="ltr" className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark tone={tone} className="h-11 w-auto" />
      <span className={cn("items-center gap-2.5", hideTextOnMobile ? "hidden sm:inline-flex" : "inline-flex", light ? "text-white" : "text-primary")}>
        <span className="font-[family-name:var(--font-jakarta)] text-[1.45rem] leading-none font-extrabold tracking-tight">AFAQ</span>
        <span className={cn("h-6 w-px", light ? "bg-white/50" : "bg-primary/30")} aria-hidden />
        <span lang="ar" className="font-[family-name:var(--font-alexandria)] text-[1.35rem] leading-none font-bold">
          آفاق
        </span>
      </span>
    </span>
  );
}

/** Stacked lockup with slogans, as on the brand board. */
export function LogoStacked({ locale, tone = "default", className }: { locale: Locale; tone?: Tone; className?: string }) {
  const light = tone === "light";
  const slogan = locale === "ar" ? "نفتح آفاق التعلم لكل طفل." : locale === "fr" ? "Un nouvel horizon pour chaque enfant." : "A new horizon for every child.";
  return (
    <span className={cn("inline-flex flex-col items-center text-center", className)}>
      <LogoMark tone={tone} className="h-20 w-auto" />
      <span dir="ltr" className={cn("mt-1 inline-flex items-center gap-3", light ? "text-white" : "text-primary")}>
        <span className="font-[family-name:var(--font-jakarta)] text-4xl leading-none font-extrabold tracking-tight">AFAQ</span>
        <span className={cn("h-8 w-px", light ? "bg-white/50" : "bg-primary/30")} aria-hidden />
        <span lang="ar" className="font-[family-name:var(--font-alexandria)] text-[2.1rem] leading-none font-bold">
          آفاق
        </span>
      </span>
      <span className={cn("mt-2 flex items-center gap-2 text-xs font-semibold", light ? "text-white/80" : "text-muted")}>
        <span className={cn("h-px w-6", light ? "bg-white/40" : "bg-primary/30")} aria-hidden />
        {slogan}
        <span className={cn("h-px w-6", light ? "bg-white/40" : "bg-primary/30")} aria-hidden />
      </span>
    </span>
  );
}
