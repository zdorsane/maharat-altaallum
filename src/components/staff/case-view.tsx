import { Download, FileText, ImageIcon, Info } from "lucide-react";
import { db } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth";
import { fmt } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { STATUS_TONE, wilayaName, type CaseStatus, type CategoryKey } from "@/lib/constants";
import { ageLabel, cn, formatDate, formatDateTime } from "@/lib/utils";
import { Badge, Section } from "@/components/ui";
import { BackLink, Detail } from "@/components/parent/bits";
import { AssessmentSummary } from "@/components/assessment/summary";
import { StaffReplyForm } from "./reply-form";

/** Full case file for the review team and the assigned specialist (access is checked by the caller). */
export async function StaffCaseView({ caseId, viewer, t, locale, backHref }: { caseId: string; viewer: CurrentUser; t: Dict; locale: string; backHref: string }) {
  const s = t.staffCase;
  const c = await db.case.findUniqueOrThrow({
    where: { id: caseId },
    include: {
      child: { include: { parent: { select: { wilaya: true, user: { select: { id: true, fullName: true, email: true, phone: true } } } } } },
      categories: true,
      difficultyAssessment: true,
      documents: { orderBy: { createdAt: "desc" }, select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true } },
      events: { orderBy: { createdAt: "desc" } },
      assignedSpecialist: { select: { displayName: true } },
      assignedReviewer: { select: { fullName: true } },
    },
  });
  const parentUserId = c.child.parent.user.id;
  const messages = await db.message.findMany({
    where: { caseId: c.id, OR: [{ senderId: parentUserId }, { recipientId: parentUserId }] },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { fullName: true } } },
  });
  // Parent messages are stored once per staff recipient; show each once.
  const thread = messages.filter(
    (m, i, all) => m.senderId !== parentUserId || all.findIndex((x) => x.senderId === parentUserId && x.body === m.body && Math.abs(+x.createdAt - +m.createdAt) < 5000) === i,
  );
  await db.message.updateMany({ where: { caseId: c.id, recipientId: viewer.id, readAt: null }, data: { readAt: new Date() } });
  const status = c.status as CaseStatus;
  const child = c.child;

  return (
    <>
      <BackLink href={backHref}>{s.listTitle}</BackLink>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl font-extrabold">{c.reference}</h1>
          <p className="mt-1 text-muted">{fmt(s.submittedOn, { date: formatDateTime(c.createdAt, locale) })}</p>
        </div>
        <Badge tone={STATUS_TONE[status]} className="text-sm">
          {t.labels.status[status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Section title={s.assessment}>
            <p className="mb-4 flex items-center gap-2 rounded-xl bg-sun-soft px-3 py-2 text-xs font-semibold text-sun-ink">
              <Info className="size-4 shrink-0" />
              {s.observation}
            </p>
            {c.difficultyAssessment ? (
              <AssessmentSummary a={c.difficultyAssessment} t={t} />
            ) : (
              <>
                <p className="mb-3 text-sm text-muted">{s.legacy}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {c.categories.map((k) => (
                    <span key={k.key} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {k.key === "OTHER" && c.otherCategory ? c.otherCategory : t.labels.categories[k.key as CategoryKey]}
                    </span>
                  ))}
                </div>
                <dl className="space-y-3 text-sm">
                  <Detail label={s.summary}>{c.description}</Detail>
                  {c.firstNoticed && <Detail label={t.parent.case.firstNoticed}>{c.firstNoticed}</Detail>}
                  {c.situations && <Detail label={t.parent.case.situations}>{c.situations}</Detail>}
                </dl>
              </>
            )}
          </Section>

          <Section title={s.messages}>
            {thread.length === 0 ? (
              <p className="mb-3 text-sm text-muted">{s.noMessages}</p>
            ) : (
              <ul className="mb-4 max-h-[28rem] space-y-3 overflow-y-auto pe-1">
                {thread.map((m) => {
                  const fromParent = m.senderId === parentUserId;
                  return (
                    <li key={m.id} className={cn("flex", fromParent ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm", fromParent ? "rounded-es-md bg-surface-2" : "rounded-ee-md bg-primary text-on-primary")}>
                        <p className={cn("mb-0.5 text-[11px] font-bold", fromParent ? "text-primary" : "text-on-primary/80")}>{m.sender.fullName}</p>
                        <p dir="auto" className="whitespace-pre-line">
                          {m.body}
                        </p>
                        <p className={cn("mt-1 text-[10px]", fromParent ? "text-muted" : "text-on-primary/70")}>{formatDateTime(m.createdAt, locale)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {status !== "CLOSED" && <StaffReplyForm caseId={c.id} placeholder={s.reply} send={s.send} sending={s.sending} />}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={s.child}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label={s.child}>
                {child.firstName}
                {child.lastName ? ` ${child.lastName}` : ""}
              </Detail>
              <Detail label={t.parent.childForm.birthDate}>
                {formatDate(child.birthDate, locale)} · {ageLabel(child.birthDate, t.common)}
              </Detail>
              <Detail label={s.level}>{t.labels.schoolLevels[child.schoolLevel as keyof typeof t.labels.schoolLevels]}</Detail>
              <Detail label={s.language}>{t.labels.schoolLanguages[child.schoolLanguage as keyof typeof t.labels.schoolLanguages]}</Detail>
              {child.schoolName && <Detail label={s.school}>{child.schoolName}</Detail>}
              {child.gender && <Detail label={s.gender}>{t.childExtra.genders[child.gender as keyof typeof t.childExtra.genders]}</Detail>}
            </dl>
            <div className="mt-4 border-t border-line pt-4 text-sm">
              <p className="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{s.parent}</p>
              <p className="font-semibold">{child.parent.user.fullName}</p>
              <p className="text-muted" dir="ltr">
                {child.parent.user.email}
                {child.parent.user.phone ? ` · ${child.parent.user.phone}` : ""}
              </p>
              <p className="text-muted">{wilayaName(child.parent.wilaya, locale)}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <Detail label={s.assignedReviewer}>{c.assignedReviewer?.fullName ?? s.none}</Detail>
              <Detail label={s.assignedSpecialist}>{c.assignedSpecialist?.displayName ?? s.none}</Detail>
            </div>
          </Section>

          <Section title={s.documents}>
            {c.documents.length === 0 ? (
              <p className="text-sm text-muted">{s.noDocuments}</p>
            ) : (
              <ul className="space-y-2">
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
          </Section>

          <Section title={s.timeline}>
            <ol className="relative space-y-4 border-s-2 border-line ps-5">
              {c.events.map((e) => {
                const label =
                  e.type === "STATUS" && e.toStatus
                    ? fmt(t.parent.case.events.STATUS, { status: t.labels.status[e.toStatus as CaseStatus] ?? e.toStatus })
                    : e.type === "ASSESSMENT_UPDATED"
                      ? t.assessment.eventUpdated
                      : (t.parent.case.events[e.type as keyof typeof t.parent.case.events] ?? e.type);
                return (
                  <li key={e.id} className="relative">
                    <span className="absolute -start-[1.72rem] top-1 size-3 rounded-full border-2 border-surface bg-primary" />
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted">{formatDateTime(e.createdAt, locale)}</p>
                  </li>
                );
              })}
            </ol>
          </Section>
        </div>
      </div>
    </>
  );
}
