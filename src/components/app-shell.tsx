import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { db } from "@/lib/db";
import { initials } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { navFor, type Area } from "@/lib/nav";
import { logoutAction } from "@/app/(auth)/actions";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { PageTransition } from "./motion";

export async function AppShell({ user, area, children }: { user: CurrentUser; area: Area; children: React.ReactNode }) {
  const [{ t, locale }, unread] = await Promise.all([getI18n(), db.notification.count({ where: { userId: user.id, readAt: null } })]);
  const nav = navFor(area, user.role, t);

  const bell = (
    <Link href="/notifications" className="icon-btn relative" aria-label={t.common.notifications} title={t.common.notifications}>
      <Bell className="size-[18px]" />
      {unread > 0 && (
        <span className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] leading-5 font-bold text-surface ring-2 ring-surface">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-surface/60 backdrop-blur-xl lg:flex">
        <Link href="/" className="px-6 pt-6 pb-8">
          <Logo locale={locale} />
        </Link>
        <p className="px-6 pb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">{t.spaces[area]}</p>
        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks items={nav} />
        </div>
        <div className="m-3 rounded-2xl border border-line bg-surface p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-on-primary">
              {initials(user.fullName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted">{t.roles[user.role]}</p>
            </div>
            <form action={logoutAction}>
              <button className="icon-btn size-9 border-transparent" aria-label={t.common.logout} title={t.common.logout}>
                <LogOut className="size-4 rtl:rotate-180" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="glass sticky top-0 z-30 border-b">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <Link href="/" className="lg:hidden">
              <Logo locale={locale} hideTextOnMobile />
            </Link>
            <p className="hidden text-sm font-medium text-muted lg:block">{t.spaces[area]}</p>
            <div className="flex items-center gap-2">
              <LocaleSwitcher locale={locale} label={t.common.language} />
              <ThemeToggle label={t.common.themeToggle} />
              {bell}
              <form action={logoutAction} className="lg:hidden">
                <button className="icon-btn" aria-label={t.common.logout} title={t.common.logout}>
                  <LogOut className="size-[18px] rtl:rotate-180" />
                </button>
              </form>
            </div>
          </div>
          <div className="lg:hidden">
            <NavLinks items={nav} variant="bar" />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
