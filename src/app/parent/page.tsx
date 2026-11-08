import Link from "next/link";
import { CalendarDays, FolderOpen, Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { Badge, Disclaimer, EmptyState, PageHeader, Section, StatCard, TextLink } from "@/components/ui";
import { STATUS_TONE, type CaseStatus } from "@/lib/constants";
import { ageLabel, formatDateTime, initials } from "@/lib/utils";

export default async function ParentHome() {
  const [user, { t, locale }] = await Promise.all([requireRole("PARENT"), getI18n()]);
  const d = t.dash.parent;
  const parentId = user.parentProfileId ?? "-";
  const [children, openCases, upcoming] = await Promise.all([
    db.child.findMany({ where: { parentId }, orderBy: { createdAt: "asc" }, include: { cases: { orderBy: { createdAt: "desc" }, take: 1 } } }),
    db.case.count({ where: { child: { parentId }, status: { not: "CLOSED" } } }),
    db.appointment.findMany({
      where: { child: { parentId }, scheduledAt: { gte: new Date() }, status: { in: ["PROPOSED", "CONFIRMED"] } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
      include: { child: true, specialist: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={fmt(d.hello, { name: user.fullName.split(" ")[0] })}
        subtitle={d.subtitle}
        actions={
          <Link href={children.length ? "/parent/cases/new" : "/parent/children/new"} className="btn-primary">
            <Plus className="size-4" />
            {children.length ? d.newCase : d.addChild}
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={d.stats.children} value={children.length} tone="primary" icon={<Users className="size-[18px]" />} />
        <StatCard label={d.stats.openCases} value={openCases} tone="violet" icon={<FolderOpen className="size-[18px]" />} />
        <StatCard label={d.stats.upcoming} value={upcoming.length} tone="mint" icon={<CalendarDays className="size-[18px]" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={d.myChildren} action={<TextLink href="/parent/children">{t.common.viewAll}</TextLink>}>
          {children.length === 0 ? (
            <EmptyState
              title={d.noChildTitle}
              body={d.noChildBody}
              action={
                <Link href="/parent/children/new" className="btn-primary">
                  {d.addChild}
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2">
              {children.map((c) => {
                const last = c.cases[0];
                return (
                  <li key={c.id}>
                    <Link href={`/parent/children/${c.id}`} className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition hover:bg-surface-2">
                      <span className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-sun-soft font-bold text-sun-ink">{initials(c.firstName)}</span>
                        <span>
                          <span className="block font-semibold">{c.firstName}</span>
                          <span className="text-xs text-muted">{ageLabel(c.birthDate, t.common)}</span>
                        </span>
                      </span>
                      {last ? (
                        <Badge tone={STATUS_TONE[last.status as CaseStatus]}>{t.labels.status[last.status as CaseStatus]}</Badge>
                      ) : (
                        <Badge>{d.noCase}</Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title={d.upcomingTitle} action={<TextLink href="/parent/appointments">{d.allAppointments}</TextLink>}>
          {upcoming.length === 0 ? (
            <EmptyState title={d.noUpcoming} />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-mint-soft text-mint">
                    <CalendarDays className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{fmt(d.withSpecialist, { child: a.child.firstName, specialist: a.specialist.displayName })}</p>
                    <p className="text-sm text-muted">{formatDateTime(a.scheduledAt, locale)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
      <Disclaimer className="mt-6" />
    </>
  );
}
