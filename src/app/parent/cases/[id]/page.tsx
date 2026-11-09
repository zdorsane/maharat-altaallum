import Link from "next/link";
import { AlertCircle, CalendarDays, Download, FileText, ImageIcon } from "lucide-react";
import { db } from "@/lib/db";
import { caseStage, getOwnedCase, requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { STATUS_TONE, type CaseStatus, type CategoryKey } from "@/lib/constants";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Badge, EmptyState, Section } from "@/components/ui";
import { BackLink, CaseStages, Detail } from "@/components/parent/bits";
import { MessageForm, UploadForm } from "@/components/parent/forms";
import { AssessmentSummary } from "@/components/assessment/summary";
import { EDITABLE_CASE_STATUSES } from "@/lib/assessment";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.cases.title };
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { t, locale }, { id }] = await Promise.all([requireParent(), getI18n(), params]);
  const owned = await getOwnedCase(user.parentProfileId, id);
  const p = t.parent.case;

  const [c, messages] = await Promise.all([
    db.case.findUniqueOrThrow({
      where: { id: owned.id },
      include: {
        child: true,
        categories: true,
        difficultyAssessment: true,
        // Parents only ever see events flagged visibleToParent; internal notes live elsewhere.
        events: { where: { visibleToParent: true }, orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" }, select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true } },
        appointments: { orderBy: { scheduledAt: "desc" }, include: { specialist: { select: { displayName: true } } } },
        assessments: { where: { sharedWithParent: true }, orderBy: { date: "desc" }, include: { specialist: { select: { displayName: true } } } },
      },
    }),
    db.message.findMany({
      where: { caseId: owned.id, OR: [{ senderId: user.id }, { recipientId: user.id }] },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { fullName: true } } },
    }),
  ]);

  // Opening the file marks the team's messages as read.
  await db.message.updateMany({ where: { caseId: c.id, recipientId: user.id, readAt: null }, data: { readAt: new Date() } });

  // Messages sent to several staff members are stored once per recipient; show each once.
  const thread = messages.filter((m, i, all) => m.senderId !== user.id || all.findIndex((x) => x.senderId === user.id && x.body === m.body && Math.abs(+x.createdAt - +m.createdAt) < 5000) === i);
  const status = c.status as CaseStatus;

  return (
    <>
      <BackLink href="/parent/cases">{p.back}</BackLink>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl font-extrabold">{c.reference}</h1>
          <p className="mt-1 text-muted">
            <Link href={`/parent/children/${c.child.id}`} className="font-semibold text-primary hover:underline">
              {c.child.firstName}
            </Link>{" "}
            · {fmt(t.parent.cases.submittedOn, { date: formatDate(c.createdAt, locale) })}
          </p>
        </div>
        <Badge tone={STATUS_TONE[status]} className="text-sm">
          {t.labels.status[status]}
        </Badge>
      </div>

      <div className="card mb-6 rounded-[1.5rem]">
        <CaseStages stage={caseStage(status)} labels={p.stages} closedLabel={p.closed} />
      </div>

      {status === "WAITING_INFO" && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-sun/40 bg-sun-soft p-4 text-sun-ink">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-extrabold">{p.infoRequested}</p>
            <p className="text-sm">{p.infoRequestedBody}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Section title={p.messages}>
            <div id="messages" className="space-y-3">
              {thread.length === 0 ? (
                <p className="text-sm text-muted">{p.noMessages}</p>
              ) : (
                <ul className="max-h-[28rem] space-y-3 overflow-y-auto pe-1">
                  {thread.map((m) => {
                    const mine = m.senderId === user.id;
                    return (
                      <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm", mine ? "rounded-ee-md bg-primary text-on-primary" : "rounded-es-md bg-surface-2")}>
                          <p className={cn("mb-0.5 text-[11px] font-bold", mine ? "text-on-primary/80" : "text-primary")}>{mine ? p.you : `${m.sender.fullName} · ${p.team}`}</p>
                          <p dir="auto" className="whitespace-pre-line">{m.body}</p>
                          <p className={cn("mt-1 text-[10px]", mine ? "text-on-primary/70" : "text-muted")}>{formatDateTime(m.createdAt, locale)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {status !== "CLOSED" && <MessageForm caseId={c.id} placeholder={p.writeMessage} send={p.send} sending={p.sending} label={p.messages} />}
            </div>
          </Section>

          <Section
            title={p.details}
            action={
              c.difficultyAssessment && EDITABLE_CASE_STATUSES.includes(status) ? (
                <Link href={`/parent/assessments/${c.difficultyAssessment.id}`} className="btn-ghost">
                  {t.assessment.editAnswers}
                </Link>
              ) : undefined
            }
          >
            {c.difficultyAssessment ? (
              <AssessmentSummary a={c.difficultyAssessment} t={t} />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {c.categories.map((k) => (
                    <span key={k.key} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {k.key === "OTHER" && c.otherCategory ? c.otherCategory : t.labels.categories[k.key as CategoryKey]}
                    </span>
                  ))}
                </div>
                <dl className="space-y-4 text-sm">
                  <Detail label={p.description}>{c.description}</Detail>
                  {c.firstNoticed && <Detail label={p.firstNoticed}>{c.firstNoticed}</Detail>}
                  {c.situations && <Detail label={p.situations}>{c.situations}</Detail>}
                  <Detail label={p.priorSupport}>
                    {t.parent.caseForm.priorSupportOptions[c.priorSupport as keyof typeof t.parent.caseForm.priorSupportOptions]}
                    {c.priorSupportDetails ? ` — ${c.priorSupportDetails}` : ""}
                  </Detail>
                </dl>
              </>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={p.documents}>
            {c.documents.length === 0 ? (
              <p className="mb-4 text-sm text-muted">{p.noDocuments}</p>
            ) : (
              <ul className="mb-5 space-y-2">
                {c.documents.map((d) => (
                  <li key={d.id}>
                    <a
                      href={`/api/documents/${d.id}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm transition hover:border-primary/40 hover:bg-surface-2"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        {d.mimeType.startsWith("image/") ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{d.fileName}</span>
                        <span className="text-xs text-muted">
                          {Math.max(1, Math.round(d.size / 1024))} KB · {formatDate(d.createdAt, locale)}
                        </span>
                      </span>
                      <Download className="size-4 shrink-0 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {status !== "CLOSED" && <UploadForm caseId={c.id} label={p.addDocuments} hint={t.parent.caseForm.documentsHint} upload={p.upload} uploading={p.uploading} />}
          </Section>

          {c.appointments.length > 0 && (
            <Section title={p.appointments}>
              <ul className="space-y-2">
                {c.appointments.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm">
                    <CalendarDays className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{formatDateTime(a.scheduledAt, locale)}</p>
                      <p className="truncate text-xs text-muted">{fmt(t.parent.appointments.with, { name: a.specialist.displayName })}</p>
                    </div>
                    <Badge tone={a.status === "CONFIRMED" ? "success" : a.status === "CANCELLED" ? "neutral" : "warn"}>
                      {t.labels.appointmentStatus[a.status as keyof typeof t.labels.appointmentStatus]}
                    </Badge>
                  </li>
                ))}
              </ul>
              <Link href="/parent/appointments" className="mt-3 inline-block text-sm font-bold text-primary hover:underline">
                {t.parent.appointments.title}
              </Link>
            </Section>
          )}

          {c.assessments.length > 0 && (
            <Section title={p.assessments}>
              {c.assessments.map((a) => (
                <article key={a.id} className="rounded-2xl bg-surface-2 p-4 text-sm">
                  <p className="font-extrabold">{a.type}</p>
                  <p className="text-xs text-muted">
                    {formatDate(a.date, locale)} · {a.specialist.displayName}
                  </p>
                  <p className="mt-2 whitespace-pre-line">{a.parentSummary || a.recommendations}</p>
                </article>
              ))}
            </Section>
          )}

          <Section title={p.timeline}>
            {c.events.length === 0 ? (
              <EmptyState title="—" />
            ) : (
              <ol className="relative space-y-4 border-s-2 border-line ps-5">
                {c.events.map((e) => {
                  const label =
                    e.type === "STATUS" && e.toStatus
                      ? fmt(p.events.STATUS, { status: t.labels.status[e.toStatus as CaseStatus] ?? e.toStatus })
                      : e.type === "ASSESSMENT_UPDATED"
                        ? t.assessment.eventUpdated
                        : (p.events[e.type as keyof typeof p.events] ?? e.type);
                  return (
                    <li key={e.id} className="relative">
                      <span className="absolute -start-[1.72rem] top-1 size-3 rounded-full border-2 border-surface bg-primary" />
                      <p className="text-sm font-semibold">{label}</p>
                      {e.message && e.type === "INFO_REQUEST" && <p className="mt-1 text-sm whitespace-pre-line text-muted">{e.message}</p>}
                      <p className="text-xs text-muted">{formatDateTime(e.createdAt, locale)}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}
