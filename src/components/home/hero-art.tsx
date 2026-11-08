import Image from "next/image";
import { BarChart3, BookOpen, ClipboardCheck, UsersRound } from "lucide-react";
import type { Dict } from "@/lib/i18n/server";
import { Cloud, GoldStar, HorizonArc, Pencil, Sparkle } from "@/components/brand/decor";
import { LogoMark } from "@/components/logo";

const SERVICE_ICONS = [ClipboardCheck, BookOpen, UsersRound, BarChart3];

/**
 * Hero composition: the brand illustration (child reading) in a soft lavender halo, a laptop
 * previewing the AFAQ interface, and floating brand elements (stars, letters, pencil, clouds).
 */
export function HeroArt({ t }: { t: Dict["home"]["preview"] }) {
  return (
    <figure className="animate-fade-up relative mx-auto aspect-[10/9] w-full max-w-[36rem] [animation-delay:150ms]" aria-label={t.label}>
      {/* flowing backdrop */}
      <div aria-hidden className="absolute inset-[4%] rounded-[45%_55%_48%_52%/52%_45%_55%_48%] bg-[radial-gradient(circle_at_35%_30%,#EDE6FF,#D9CCFF_55%,#C7E4FB)] opacity-90 dark:opacity-25" />
      <HorizonArc className="absolute start-[6%] top-[3%] w-[46%] rtl:-scale-x-100" />
      <Cloud className="animate-float absolute start-[-2%] bottom-[14%] w-[22%] text-white/90 [animation-delay:-3s] dark:text-white/20" />
      <Cloud className="animate-float absolute end-[2%] top-[4%] w-[18%] text-white/90 [animation-delay:-5s] dark:text-white/20" />

      {/* brand illustration */}
      <div className="absolute start-[4%] top-[8%] w-[56%]">
        <Image
          src="/brand/afaq-hero-child.webp"
          alt=""
          width={332}
          height={468}
          priority
          sizes="(max-width: 640px) 55vw, 330px"
          className="h-auto w-full [mask-image:radial-gradient(ellipse_56%_60%_at_52%_46%,black_58%,transparent_97%)]"
        />
      </div>

      {/* laptop previewing the platform */}
      <div aria-hidden className="animate-float absolute end-[0%] bottom-[6%] w-[60%] [animation-delay:-2s] [animation-duration:9s]">
        <div className="rounded-[14px] bg-[#2b2253] p-[5px] shadow-[0_30px_60px_-24px_rgb(41_32_77/0.6)]">
          <div className="overflow-hidden rounded-[10px] bg-white text-[#29204D]">
            <div className="flex items-center justify-between gap-2 border-b border-[#efe9ff] px-2.5 py-1.5">
              <span dir="ltr" className="flex items-center gap-1 text-[8px] font-extrabold text-[#4B2CBF]">
                <LogoMark className="h-3.5 w-auto" />
                AFAQ | آفاق
              </span>
              <span className="hidden gap-2 text-[6.5px] font-semibold text-[#5e5680] min-[420px]:flex">
                {t.nav.map((n, i) => (
                  <span key={n} className={i === 0 ? "rounded-full bg-[#4B2CBF] px-1.5 py-0.5 text-white" : ""}>
                    {n}
                  </span>
                ))}
              </span>
            </div>
            <div className="grid grid-cols-[1.3fr_1fr] items-center gap-2 bg-[linear-gradient(135deg,#F5F0FF,#EAF4FE)] px-3 py-3">
              <div>
                <p className="text-[10px] leading-tight font-extrabold text-[#29204D]">{t.headline}</p>
                <span className="mt-2 inline-block rounded-full bg-[#4B2CBF] px-2 py-0.5 text-[7px] font-bold text-white">{t.cta} →</span>
              </div>
              <div className="relative h-14 overflow-hidden rounded-lg bg-[#E8DEFF]">
                <GoldStar className="absolute end-1.5 top-1 w-4" />
                <div className="absolute inset-x-0 bottom-0 h-6 rounded-t-[50%] bg-[#C7B5FB]" />
                <div className="absolute inset-x-3 bottom-0 h-4 rounded-t-[50%] bg-[#F6B94D]/80" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-2">
              {t.services.map((s, i) => {
                const Icon = SERVICE_ICONS[i];
                return (
                  <div key={s} className="flex flex-col items-center gap-1 rounded-lg bg-[#F5F0FF] px-1 py-1.5 text-center">
                    <Icon className="size-3 text-[#4B2CBF]" />
                    <span className="text-[5.5px] leading-tight font-semibold">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mx-auto h-[7px] w-[112%] -translate-x-[5%] rounded-b-xl bg-[linear-gradient(#d9d3ec,#b8afd6)] rtl:translate-x-[5%]" />
      </div>

      {/* floating brand elements */}
      <GoldStar className="animate-float absolute end-[24%] top-[2%] w-[11%] [animation-duration:6s]" />
      <Sparkle className="animate-twinkle absolute end-[12%] top-[22%] w-[4%]" color="#60B5F5" />
      <Sparkle className="animate-twinkle absolute start-[50%] top-[12%] w-[3%] [animation-delay:-1.2s]" color="#A78BFA" />
      <span aria-hidden className="animate-float absolute end-[36%] top-[16%] text-[clamp(1.5rem,4vw,2.6rem)] font-extrabold text-[#4B2CBF] [animation-delay:-1s] dark:text-[#C9B8FF]">
        A
      </span>
      <span aria-hidden className="animate-float absolute end-[8%] top-[38%] font-[family-name:var(--font-alexandria)] text-[clamp(1.4rem,3.6vw,2.3rem)] font-bold text-[#7C5CE6] [animation-delay:-4s] dark:text-[#C9B8FF]">
        ب
      </span>
      <Pencil className="animate-float absolute end-[20%] top-[24%] w-[5%] rotate-[28deg] [animation-delay:-2.5s]" />

      <div aria-hidden className="animate-pop absolute start-[2%] top-[56%] flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-[var(--shadow-float)] backdrop-blur dark:border-white/10 dark:bg-[#1b1636]/90">
        <GoldStar className="w-5" />
        <span className="text-sm font-extrabold text-[#4B2CBF] dark:text-[#C9B8FF]">{t.cheer}</span>
      </div>
    </figure>
  );
}
