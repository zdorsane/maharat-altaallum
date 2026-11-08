import { Baby, FolderOpen, Stethoscope, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { PageHeader, Section, StatCard } from "@/components/ui";
import { CASE_STATUSES } from "@/lib/constants";

export default async function AdminHome() {
  const [, { t }] = await Promise.all([requireRole("SUPER_ADMIN", "ADMIN"), getI18n()]);
  const d = t.dash.admin;
  const [parents, specialists, children, cases, byStatus, unhandled] = await Promise.all([
    db.user.count({ where: { role: "PARENT" } }),
    db.specialist.count({ where: { isDemo: false } }),
    db.child.count(),
    db.case.count(),
    db.case.groupBy({ by: ["status"], _count: { _all: true } }),
    db.contactMessage.count({ where: { handled: false } }),
  ]);
  const counts = new Map(byStatus.map((s) => [s.status, s._count._all]));
  const max = Math.max(1, ...counts.values());

  return (
    <>
      <PageHeader title={d.title} subtitle={d.subtitle} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={d.stats.parents} value={parents} tone="primary" icon={<Users className="size-[18px]" />} />
        <StatCard label={d.stats.specialists} value={specialists} tone="mint" hint={d.stats.specialistsHint} icon={<Stethoscope className="size-[18px]" />} />
        <StatCard label={d.stats.children} value={children} tone="violet" icon={<Baby className="size-[18px]" />} />
        <StatCard
          label={d.stats.cases}
          value={cases}
          tone="sun"
          hint={unhandled ? fmt(d.stats.unhandled, { n: unhandled }) : undefined}
          icon={<FolderOpen className="size-[18px]" />}
        />
      </div>
      <Section title={d.byStatus}>
        <ul className="space-y-3.5">
          {CASE_STATUSES.map((s, i) => {
            const n = counts.get(s) ?? 0;
            return (
              <li key={s} className="grid grid-cols-[minmax(7rem,11rem)_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="truncate text-muted">{t.labels.status[s]}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="animate-grow block h-full rounded-full bg-linear-to-r from-primary to-teal"
                    style={{ width: `${(n / max) * 100}%`, animationDelay: `${i * 60}ms` }}
                  />
                </span>
                <span className="text-end font-semibold tabular-nums">{n}</span>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
