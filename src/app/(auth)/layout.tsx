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
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-[#1b37c4] via-[#2448e0] to-[#0d9b8a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div aria-hidden className="animate-blob pointer-events-none absolute -end-24 top-1/3 size-96 rounded-full bg-[#0fb3a0]/40 blur-3xl" />
        <div aria-hidden dir="rtl" className="pointer-events-none absolute end-10 top-1/4 font-[family-name:var(--font-display)] text-[9rem] leading-none font-bold text-white/10 select-none">
          <span className="animate-float inline-block">أ</span>
          <span className="animate-float inline-block [animation-delay:-2s]">ب</span>
          <span className="animate-float inline-block [animation-delay:-4s]">ت</span>
        </div>

        <Link href="/" className="relative">
          <Logo locale={locale} tone="light" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold">{t.auth.sideTitle}</h2>
          <p className="mt-4 text-lg text-white/75">{t.auth.sideBody}</p>
          <ul className="mt-8 space-y-3">
            {t.auth.sidePoints.map((p, i) => (
              <li key={p} className="animate-fade-up flex items-center gap-3" style={{ animationDelay: `${300 + i * 120}ms` }}>
                <span className="grid size-7 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">{t.common.disclaimer}</p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
          <Link href="/" className="lg:hidden">
            <Logo locale={locale} />
          </Link>
          <Link href="/" className="group hidden items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink lg:inline-flex">
            <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0 rtl:group-hover:translate-x-0.5" />
            {t.auth.backHome}
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} label={t.common.language} />
            <ThemeToggle label={t.common.themeToggle} />
          </div>
        </div>
        <main className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="animate-fade-up w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
