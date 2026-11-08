import { CalendarDays, ClipboardList, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { specialistChildWhere } from "@/lib/rbac";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { Badge, EmptyState, PageHeader, Section, StatCard } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SpecialistHome() {
  const [user, { t, locale }] = await Promise.all([requireRole("SPECIALIST"), getI18n()]);
  const d = t.dash.specialist;
  const sid = user.specialistId;
  if (!sid) return <EmptyState title={d.incompleteTitle} body={d.incompleteBody} />;

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const [childCount, activePlans, upcoming] = await Promise.all([
    db.child.count({ where: specialistChildWhere(sid) }),
    db.supportPlan.count({ where: { specialistId: sid, status: "ACTIVE" } }),
    db.appointment.findMany({
      where: { specialistId: sid, scheduledAt: { gte: startOfDay }, status: { in: ["PROPOSED", "CONFIRMED"] } },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      include: { child: true },
    }),
  ]);

  return (
    <>
      <PageHeader title={fmt(d.hello, { name: user.fullName })} subtitle={d.subtitle} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={d.stats.children} value={childCount} tone="primary" icon={<Users className="size-[18px]" />} />
        <StatCard label={d.stats.activePlans} value={activePlans} tone="mint" icon={<ClipboardList className="size-[18px]" />} />
        <StatCard label={d.stats.upcoming} value={upcoming.length} tone="violet" icon={<CalendarDays className="size-[18px]" />} />
      </div>
      <Section title={d.upcomingTitle}>
        {upcoming.length === 0 ? (
          <EmptyState title={d.noUpcoming} />
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">
                    {a.child.firstName} · {t.labels.appointmentKind[a.kind as keyof typeof t.labels.appointmentKind]}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(a.scheduledAt, locale)} · {a.mode === "ONLINE" ? d.online : (a.location ?? d.inPerson)}
                  </p>
                </div>
                <Badge tone={a.status === "CONFIRMED" ? "success" : "warn"}>
                  {t.labels.appointmentStatus[a.status as keyof typeof t.labels.appointmentStatus]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
