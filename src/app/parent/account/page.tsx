import Link from "next/link";
import { Bell, CalendarDays, FolderOpen, ShieldCheck, UserRound, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { WILAYAS } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";
import { PageHeader, Section, StatCard } from "@/components/ui";
import { AccountForm, PasswordForm } from "./forms";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.account.title };
}

export default async function AccountPage() {
  const [user, { t, locale }] = await Promise.all([requireParent(), getI18n()]);
  const a = t.account;
  const [me, children, cases, upcoming, unread] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id }, select: { fullName: true, email: true, phone: true, createdAt: true, parentProfile: { select: { wilaya: true } } } }),
    db.child.count({ where: { parentId: user.parentProfileId } }),
    db.case.count({ where: { child: { parentId: user.parentProfileId } } }),
    db.appointment.count({ where: { child: { parentId: user.parentProfileId }, scheduledAt: { gte: new Date() }, status: { in: ["PROPOSED", "CONFIRMED"] } } }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const wilayas = WILAYAS.map(([code, ar, latin]) => [code, `${code} — ${locale === "ar" ? ar : latin}`] as [string, string]);

  return (
    <>
      <PageHeader title={a.title} subtitle={a.subtitle} />
      <div className="card mb-6 flex flex-wrap items-center gap-4 rounded-[1.5rem]">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary text-xl font-extrabold text-on-primary">{initials(me.fullName)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold">{me.fullName}</p>
          <p className="text-sm text-muted">{fmt(a.memberSince, { date: formatDate(me.createdAt, locale) })}</p>
        </div>
        <Link href="/parent/children" className="btn-ghost">
          <Users className="size-4" />
          {a.manageChildren}
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={a.children} value={children} tone="primary" icon={<Users className="size-[18px]" />} />
        <StatCard label={a.cases} value={cases} tone="violet" icon={<FolderOpen className="size-[18px]" />} />
        <StatCard label={a.upcoming} value={upcoming} tone="mint" icon={<CalendarDays className="size-[18px]" />} />
        <StatCard label={a.unread} value={unread} tone="sun" icon={<Bell className="size-[18px]" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={a.personal} action={<UserRound className="size-5 text-primary" />}>
          <AccountForm t={a} values={{ fullName: me.fullName, email: me.email, phone: me.phone ?? "", wilaya: me.parentProfile?.wilaya ?? "" }} wilayas={wilayas} />
        </Section>
        <Section title={a.security} action={<ShieldCheck className="size-5 text-primary" />} className="h-fit">
          <PasswordForm t={a} common={t.common} hint={t.auth.register.passwordHint} />
        </Section>
      </div>
    </>
  );
}
