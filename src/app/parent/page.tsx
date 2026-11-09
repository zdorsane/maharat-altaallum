import Link from "next/link";
import { CalendarDays, Check, ClipboardList, FolderOpen, Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { Badge, Disclaimer, EmptyState, PageHeader, Section, StatCard, TextLink } from "@/components/ui";
import { STATUS_TONE, type CaseStatus } from "@/lib/constants";
import { ageLabel, cn, formatDateTime, initials } from "@/lib/utils";
import { startAssessmentAction } from "./assessment-actions";

export default async function ParentHome() {
  const [user, { t, locale }] = await Promise.all([requireRole("PARENT"), getI18n()]);
  const d = t.dash.parent;
  const parentId = user.parentProfileId ?? "-";
  const [children, openCases, upcoming] = await Promise.all([
    db.child.findMany({ where: { parentId }, orderBy: { createdAt: "asc" }, include: {
        cases: { orderBy: { createdAt: "desc" }, take: 1 },
        difficultyAssessments: { orderBy: { updatedAt: "desc" }, select: { id: true, status: true, case: { select: { id: true, status: true } } } },
      },
    }),
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
        <Section title={t.assessment.journey.title} action={<TextLink href="/parent/children">{t.common.viewAll}</TextLink>}>
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
            <ul className="space-y-4">
              {children.map((c) => {
                const draft = c.difficultyAssessments.find((x) => x.status === "DRAFT");
                const sent = c.difficultyAssessments.find((x) => x.status === "SUBMITTED");
                const last = c.cases[0];
                // 0 profile · 1 assessment · 2 submitted · 3 follow-up
                const stage = sent ? (sent.case && sent.case.status !== "RECEIVED" ? 3 : 2) : 1;
                return (
                  <li key={c.id} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Link href={`/parent/children/${c.id}`} className="flex items-center gap-3 hover:text-primary">
                        <span className="grid size-10 place-items-center rounded-xl bg-sun font-bold text-[#29204D]">{initials(c.firstName)}</span>
                        <span>
                          <span className="block font-extrabold">{c.firstName}</span>
                          <span className="text-xs text-muted">{ageLabel(c.birthDate, t.common)}</span>
                        </span>
                      </Link>
                      {last ? <Badge tone={STATUS_TONE[last.status as CaseStatus]}>{t.labels.status[last.status as CaseStatus]}</Badge> : <Badge>{d.noCase}</Badge>}
                    </div>
                    <ol className="my-4 grid grid-cols-4 gap-1.5">
                      {t.assessment.journey.steps.map((label, i) => (
                        <li key={label} className="text-center">
                          <span
                            className={cn(
                              "mx-auto mb-1 grid size-7 place-items-center rounded-full text-xs font-extrabold",
                              i < stage ? "bg-primary text-on-primary" : i === stage ? "bg-primary-soft text-primary ring-2 ring-primary/40" : "bg-surface-2 text-muted",
                            )}
                          >
                            {i < stage ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                          </span>
                          <span className={cn("block text-[11px] leading-tight font-semibold", i === stage ? "text-primary" : "text-muted")}>{label}</span>
                        </li>
                      ))}
                    </ol>
                    {draft ? (
                      <Link href={`/parent/assessments/${draft.id}`} className="btn-primary w-full">
                        <ClipboardList className="size-4" />
                        {t.assessment.continue}
                      </Link>
                    ) : sent?.case ? (
                      <Link href={`/parent/cases/${sent.case.id}`} className="btn-ghost w-full">
                        {t.assessment.view}
                      </Link>
                    ) : (
                      <form action={startAssessmentAction}>
                        <input type="hidden" name="childId" value={c.id} />
                        <button className="btn-primary w-full">
                          <ClipboardList className="size-4" />
                          {t.assessment.start}
                        </button>
                      </form>
                    )}
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
