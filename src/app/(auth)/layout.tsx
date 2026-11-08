import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Logo, LogoStacked } from "@/components/logo";
import { GoldStar, Sparkle } from "@/components/brand/decor";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getI18n } from "@/lib/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getI18n();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#4B2CBF_0%,#3A2399_60%,#29204D_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span aria-hidden className="absolute -end-24 -top-24 size-72 rounded-full bg-[#A78BFA]/35 blur-2xl" />
        <GoldStar className="animate-float absolute end-16 top-16 w-14" />
        <Sparkle className="animate-twinkle absolute end-40 top-40 w-5" color="#60B5F5" />
        <svg aria-hidden viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full opacity-35"><path d="M0 150C200 80 380 90 540 120S760 160 800 130V200H0Z" fill="#A78BFA" /><path d="M0 185C220 130 420 140 600 165S760 185 800 175V200H0Z" fill="#60B5F5" /></svg>
        <Link href="/" className="relative self-start" aria-label={t.meta.title}>
          <LogoStacked locale={locale} tone="light" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold">{t.auth.sideTitle}</h2>
          <p className="mt-4 text-lg text-white/80">{t.auth.sideBody}</p>
          <ul className="mt-8 space-y-3">
            {t.auth.sidePoints.map((p, i) => (
              <li key={p} className="animate-fade-up flex items-center gap-3 font-medium" style={{ animationDelay: `${300 + i * 120}ms` }}>
                <span className="grid size-7 place-items-center rounded-full bg-[#F6B94D] text-[#29204D]">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative max-w-md text-sm text-white/70">{t.common.disclaimer}</p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
          <Link href="/" className="lg:hidden">
            <Logo locale={locale} />
          </Link>
          <Link href="/" className="group hidden items-center gap-1.5 text-sm font-bold text-primary lg:inline-flex">
            <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0 rtl:group-hover:translate-x-0.5" />
            {t.auth.backHome}
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} label={t.common.language} />
            <ThemeToggle label={t.common.themeToggle} />
          </div>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="animate-fade-up w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
