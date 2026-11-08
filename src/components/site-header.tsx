import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { Logo, LogoStacked } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu } from "./mobile-menu";

export async function SiteHeader() {
  const [user, { t, locale }] = await Promise.all([getCurrentUser(), getI18n()]);
  const links = [
    { href: "/#how", label: t.nav.how },
    { href: "/#areas", label: t.nav.areas },
    { href: "/specialists", label: t.nav.specialists },
    { href: "/learn", label: t.nav.resources },
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
            <Link href={account.href} className="btn-sun hidden sm:inline-flex">
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
      title: t.footer.platform,
      links: [
        { href: "/#how", label: t.nav.how },
        { href: "/#areas", label: t.nav.areas },
        { href: "/specialists", label: t.nav.specialists },
        { href: "/register", label: t.nav.getStarted },
      ],
    },
    {
      title: t.footer.resources,
      links: t.articles.map((a) => ({ href: `/learn/${a.slug}`, label: a.title })),
    },
    {
      title: t.footer.legal,
      links: [
        { href: "/privacy", label: t.nav.privacy },
        { href: "/contact", label: t.nav.contact },
        { href: "/login", label: t.common.login },
      ],
    },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.3fr_0.8fr]">
        <div className="flex flex-col items-start">
          <LogoStacked className="scale-90 origin-top-left rtl:origin-top-right" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
          <div className="mt-6 flex gap-2">
            <LocaleSwitcher locale={locale} label={t.common.language} placement="top" />
            <ThemeToggle label={t.common.themeToggle} />
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="mb-4 text-sm font-extrabold text-primary">{c.title}</p>
            <ul className="space-y-3 text-sm text-muted">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <p className="font-semibold">{t.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
