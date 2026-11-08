import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getI18n } from "@/lib/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getI18n();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#245B73] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span aria-hidden className="absolute -end-20 -top-20 size-72 rounded-full bg-[#F3C969]" />
        <span aria-hidden className="absolute -start-16 bottom-24 size-64 rounded-full border-[32px] border-[#67B7A5]/45" />
        <div aria-hidden dir="rtl" className="pointer-events-none absolute end-12 top-[38%] flex gap-3 select-none">
          {[
            { ch: "أ", bg: "bg-[#F3C969]", d: "0s", r: "-rotate-6" },
            { ch: "ب", bg: "bg-[#F2A69B]", d: "-2s", r: "rotate-3" },
            { ch: "ت", bg: "bg-[#F7F5EF]", d: "-4s", r: "-rotate-3" },
          ].map((l) => (
            <span key={l.ch} className="animate-float inline-block" style={{ animationDelay: l.d }}>
              <span className={`grid size-16 place-items-center rounded-2xl text-3xl font-extrabold text-[#283C48] shadow-lg ${l.bg} ${l.r}`}>{l.ch}</span>
            </span>
          ))}
        </div>

        <Link href="/" className="relative">
          <Logo locale={locale} tone="light" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold">{t.auth.sideTitle}</h2>
          <p className="mt-4 text-lg text-white/80">{t.auth.sideBody}</p>
          <ul className="mt-8 space-y-3">
            {t.auth.sidePoints.map((p, i) => (
              <li key={p} className="animate-fade-up flex items-center gap-3 font-medium" style={{ animationDelay: `${300 + i * 120}ms` }}>
                <span className="grid size-7 place-items-center rounded-full bg-[#67B7A5] text-[#283C48]">
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
