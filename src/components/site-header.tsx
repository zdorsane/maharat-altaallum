import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu } from "./mobile-menu";

export async function SiteHeader() {
  const [user, { t, locale }] = await Promise.all([getCurrentUser(), getI18n()]);
  const links = [
    { href: "/", label: t.nav.home },
    { href: "/#about", label: t.nav.about },
    { href: "/#programs", label: t.nav.programs },
    { href: "/specialists", label: t.nav.specialists },
    { href: "/contact", label: t.nav.contact },
  ];
  const account = user ? { href: ROLE_HOME[user.role], label: t.common.mySpace } : { href: "/register", label: t.nav.getStarted };

  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border py-2 ps-3 pe-2 shadow-[var(--shadow-card)] sm:ps-4">
          <Link href="/" aria-label={t.meta.title} className="shrink-0">
            <Logo locale={locale} />
          </Link>
          <nav aria-label={t.common.menu} className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LocaleSwitcher locale={locale} label={t.common.language} />
            <ThemeToggle label={t.common.themeToggle} />
            {!user && (
              <Link href="/login" className="hidden rounded-full px-3 py-2 text-sm font-bold text-primary transition hover:bg-surface-2 md:inline-flex">
                {t.common.login}
              </Link>
            )}
            <Link href={account.href} className="btn-primary hidden sm:inline-flex">
              {account.label}
            </Link>
            <MobileMenu label={t.common.menu} links={[...links, ...(user ? [] : [{ href: "/login", label: t.common.login }]), { ...account, primary: true }]} />
          </div>
        </div>
      </header>
    </>
  );
}

export async function SiteFooter() {
  const { t, locale } = await getI18n();
  const cols = [
    {
      title: t.footer.navigation,
      links: [
        { href: "/", label: t.nav.home },
        { href: "/#about", label: t.nav.about },
        { href: "/specialists", label: t.nav.specialists },
        { href: "/learn", label: t.nav.resources },
        { href: "/privacy", label: t.nav.privacy },
      ],
    },
    {
      title: t.footer.programs,
      links: t.home.programs.slice(0, 3).map((p) => ({ href: "/#programs", label: p.title })),
    },
    {
      title: t.footer.resources,
      links: t.articles.map((a) => ({ href: `/learn/${a.slug}`, label: a.title })),
    },
  ];
  return (
    <footer className="relative mt-12 overflow-hidden bg-[#29204D] text-white/80">
      <svg aria-hidden viewBox="0 0 800 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-20 w-full opacity-25">
        <path d="M0 40C200 100 420 0 800 60V0H0Z" fill="#4B2CBF" />
      </svg>
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-20 pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{t.footer.tagline}</p>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#F6B94D]">
            {t.home.motto.map((m, i) => (
              <span key={m} className="inline-flex items-center gap-2">
                {i > 0 && <span className="size-1 rounded-full bg-white/50" aria-hidden />}
                {m}
              </span>
            ))}
          </p>
          <div className="mt-6 flex gap-2">
            <LocaleSwitcher locale={locale} label={t.common.language} placement="top" />
            <ThemeToggle label={t.common.themeToggle} />
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="mb-4 text-sm font-extrabold text-white">{c.title}</p>
            <ul className="space-y-3 text-sm">
              {c.links.map((l, i) => (
                <li key={l.href + i}>
                  <Link href={l.href} className="transition hover:text-[#F6B94D]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-white">{t.footer.contactTitle}</p>
            <p className="text-sm">{t.footer.contactBody}</p>
          </div>
          <Link href="/contact" className="btn-sun shrink-0">
            {t.footer.contactCta}
          </Link>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <p className="font-semibold">{t.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
