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
    { href: "/#how", label: t.nav.how },
    { href: "/#areas", label: t.nav.areas },
    { href: "/specialists", label: t.nav.specialists },
    { href: "/learn", label: t.nav.learn },
    { href: "/contact", label: t.nav.contact },
  ];
  const account = user ? { href: ROLE_HOME[user.role], label: t.common.mySpace } : { href: "/register", label: t.common.register };

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 shadow-[0_10px_30px_-18px_rgb(14_22_40/0.35)] sm:px-4">
        <Link href="/" aria-label={t.meta.title}>
          <Logo locale={locale} />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} label={t.common.language} />
          <ThemeToggle label={t.common.themeToggle} />
          {!user && (
            <Link href="/login" className="btn-ghost hidden md:inline-flex">
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
        { href: "/learn", label: t.nav.learn },
      ],
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
    <footer className="mt-24 border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo locale={locale} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="mb-4 text-sm font-semibold">{c.title}</p>
            <ul className="space-y-2.5 text-sm text-muted">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <div className="flex gap-2">
            <LocaleSwitcher locale={locale} label={t.common.language} placement="top" />
            <ThemeToggle label={t.common.themeToggle} />
          </div>
        </div>
      </div>
    </footer>
  );
}
