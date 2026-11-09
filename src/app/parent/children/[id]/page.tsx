import Link from "next/link";
import { CalendarDays, ClipboardList, Mail, Pencil, Phone, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { getOwnedChild, requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { STATUS_TONE, type CaseStatus } from "@/lib/constants";
import { ageLabel, formatDate, formatDateTime, initials, lines } from "@/lib/utils";
import { Badge, EmptyState, Section } from "@/components/ui";
import { BackLink, Detail } from "@/components/parent/bits";
import { AssessmentSummary } from "@/components/assessment/summary";
import { startAssessmentAction } from "@/app/parent/assessment-actions";
import { EDITABLE_CASE_STATUSES } from "@/lib/assessment";
import { wilayaName } from "@/lib/constants";

export default async function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { t, locale }, { id }] = await Promise.all([requireParent(), getI18n(), params]);
  const base = await getOwnedChild(user.parentProfileId, id);
  const c = t.parent.child;
  const child = await db.child.findUniqueOrThrow({
    where: { id: base.id },
    include: {
      cases: { orderBy: { createdAt: "desc" }, include: { categories: true } },
      appointments: {
        where: { scheduledAt: { gte: new Date() }, status: { in: ["PROPOSED", "CONFIRMED"] } },
        orderBy: { scheduledAt: "asc" },
        include: { specialist: { select: { displayName: true } } },
      },
      // Only what the specialist explicitly chose to share with the family.
      assessments: { where: { sharedWithParent: true }, orderBy: { date: "desc" }, include: { specialist: { select: { displayName: true } } } },
      supportPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, include: { specialist: { select: { displayName: true } } } },
      progress: { where: { sharedWithParent: true }, orderBy: { recordedAt: "desc" }, take: 10, include: { specialist: { select: { displayName: true } } } },
      difficultyAssessments: { orderBy: { updatedAt: "desc" }, include: { case: { select: { id: true, status: true, reference: true } } } },
      parent: { select: { wilaya: true, user: { select: { email: true, phone: true } } } },
    },
  });
  const draft = child.difficultyAssessments.find((x) => x.status === "DRAFT");
  const submitted = child.difficultyAssessments.filter((x) => x.status === "SUBMITTED");
  const ax = t.assessment;

  return (
    <>
      <BackLink href="/parent/children">{c.back}</BackLink>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-sun text-2xl font-extrabold text-[#29204D]">{initials(child.firstName)}</span>
          <div>
            <h1 className="text-3xl font-extrabold">
              {child.firstName}
              {child.lastName ? ` ${child.lastName}` : ""}
            </h1>
            <p className="text-muted">
              {ageLabel(child.birthDate, t.common)} · {t.labels.schoolLevels[child.schoolLevel as keyof typeof t.labels.schoolLevels]} ·{" "}
              {t.labels.schoolLanguages[child.schoolLanguage as keyof typeof t.labels.schoolLanguages]}
              {child.gender ? ` · ${t.childExtra.genders[child.gender as keyof typeof t.childExtra.genders]}` : ""}
              {child.schoolName ? ` · ${child.schoolName}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/parent/children/${child.id}/edit`} className="btn-ghost">
            <Pencil className="size-4" />
            {c.edit}
          </Link>
          <form action={startAssessmentAction}>
            <input type="hidden" name="childId" value={child.id} />
            <button className="btn-primary">
              <ClipboardList className="size-4" />
              {draft ? ax.continue : ax.start}
            </button>
          </form>
        </div>
      </div>

      <Section title={ax.sectionTitle} className="mb-6">
        {draft && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-sun/50 bg-sun-soft/60 p-4">
            <div>
              <Badge tone="warn">{ax.draftBadge}</Badge>
              <p className="mt-1 text-sm text-muted">{fmt(ax.lastSaved, { date: formatDateTime(draft.updatedAt, locale) })}</p>
            </div>
            <Link href={`/parent/assessments/${draft.id}`} className="btn-primary">
              {ax.continue}
            </Link>
          </div>
        )}
        {submitted.length === 0 && !draft && <EmptyState title={ax.noAssessment} />}
        <div className="space-y-6">
          {submitted.map((s) => (
            <article key={s.id} className="rounded-2xl border border-line p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">{ax.submittedBadge}</Badge>
                  {s.submittedAt && <span className="text-xs text-muted">{formatDate(s.submittedAt, locale)}</span>}
                  {s.case && <Badge tone={STATUS_TONE[s.case.status as CaseStatus]}>{t.labels.status[s.case.status as CaseStatus]}</Badge>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.case && EDITABLE_CASE_STATUSES.includes(s.case.status) && (
                    <Link href={`/parent/assessments/${s.id}`} className="btn-ghost">
                      <Pencil className="size-4" />
                      {ax.editAnswers}
                    </Link>
                  )}
                  {s.case && (
                    <Link href={`/parent/cases/${s.case.id}`} className="btn-ghost">
                      {ax.view} · <span className="font-mono">{s.case.reference}</span>
                    </Link>
                  )}
                </div>
              </div>
              <AssessmentSummary a={s} t={t} />
            </article>
          ))}
        </div>
      </Section>

      {(child.observations || child.previousAssessments) && (
        <dl className="card mb-6 grid gap-5 rounded-[1.5rem] sm:grid-cols-2">
          {child.observations && <Detail label={c.observations}>{child.observations}</Detail>}
          {child.previousAssessments && <Detail label={c.previousAssessments}>{child.previousAssessments}</Detail>}
        </dl>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={c.cases}>
          {child.cases.length === 0 ? (
            <EmptyState title={c.noCases} />
          ) : (
            <ul className="space-y-2">
              {child.cases.map((k) => (
                <li key={k.id}>
                  <Link href={`/parent/cases/${k.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3 transition hover:border-primary/40 hover:bg-surface-2">
                    <span>
                      <span className="block font-mono text-sm font-bold">{k.reference}</span>
                      <span className="text-xs text-muted">{formatDate(k.createdAt, locale)}</span>
                    </span>
                    <Badge tone={STATUS_TONE[k.status as CaseStatus]}>{t.labels.status[k.status as CaseStatus]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={c.appointments}>
          {child.appointments.length === 0 ? (
            <EmptyState title={c.noAppointments} />
          ) : (
            <ul className="space-y-2">
              {child.appointments.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <CalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{formatDateTime(a.scheduledAt, locale)}</p>
                    <p className="truncate text-xs text-muted">{fmt(t.parent.appointments.with, { name: a.specialist.displayName })}</p>
                  </div>
                  <Badge tone={a.status === "CONFIRMED" ? "success" : "warn"}>{t.labels.appointmentStatus[a.status as keyof typeof t.labels.appointmentStatus]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={c.plans}>
          {child.supportPlans.length === 0 ? (
            <EmptyState title={c.noPlans} />
          ) : (
            <div className="space-y-4">
              {child.supportPlans.map((p) => (
                <article key={p.id} className="rounded-2xl bg-surface-2 p-4">
                  <p className="font-extrabold">{p.title}</p>
                  <p className="text-xs text-muted">
                    {fmt(c.by, { name: p.specialist.displayName })} · {fmt(c.reviewDate, { date: formatDate(p.reviewDate, locale) })}
                  </p>
                  <p className="mt-3 text-xs font-bold text-muted uppercase">{c.objectives}</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {lines(p.objectives).map((o) => (
                      <li key={o} className="flex gap-2">
                        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                        {o}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm">
                    <span className="text-muted">{c.frequency}: </span>
                    {p.frequency}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section title={c.assessments}>
          {child.assessments.length === 0 ? (
            <EmptyState title={c.noAssessments} />
          ) : (
            <div className="space-y-4">
              {child.assessments.map((a) => (
                <article key={a.id} className="rounded-2xl border border-line p-4">
                  <p className="font-extrabold">{a.type}</p>
                  <p className="text-xs text-muted">
                    {formatDate(a.date, locale)} · {fmt(c.by, { name: a.specialist.displayName })}
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-line">{a.parentSummary || a.recommendations}</p>
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section title={t.childExtra.parentContact}>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <span dir="ltr">{child.parent.user.email}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              <span dir="ltr">{child.parent.user.phone ?? "—"}</span>
            </li>
            <li className="text-muted">{wilayaName(child.parent.wilaya, locale)}</li>
          </ul>
          <Link href="/parent/account" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
            {t.childExtra.editContact}
          </Link>
        </Section>

        <Section title={c.progress}>
          {child.progress.length === 0 ? (
            <EmptyState title={c.noProgress} />
          ) : (
            <ul className="space-y-3">
              {child.progress.map((r) => (
                <li key={r.id} className="rounded-xl border border-line p-3 text-sm">
                  <p className="font-semibold">{r.skill}</p>
                  <p className="mt-1">{r.parentNote || r.observation}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(r.recordedAt, locale)} · {r.specialist.displayName}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
