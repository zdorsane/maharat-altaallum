import { Award, CheckCircle2, Circle, Eye, EyeOff, FileText, ImageIcon, Trash2, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { SPECIALIZATION_KEYS, WILAYAS } from "@/lib/constants";
import { CONSULTATION_MODES, SPECIALIST_DOC_KINDS, splitList } from "@/lib/assessment";
import { cn, formatDate, initials } from "@/lib/utils";
import { PageHeader, Section } from "@/components/ui";
import { ConfirmSubmit } from "@/components/parent/forms";
import { DocumentForm, PhotoForm, ProfileForm, QualificationForm } from "./forms";
import { deleteSpecialistDocumentAction, removePhotoAction, removeQualificationAction } from "./actions";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.specProfile.title };
}

export default async function SpecialistProfilePage() {
  const [user, { t, locale }] = await Promise.all([requireRole("SPECIALIST"), getI18n()]);
  const p = t.specProfile;
  const s = user.specialistId
    ? await db.specialist.findUnique({
        where: { id: user.specialistId },
        include: {
          qualifications: { orderBy: { year: "desc" } },
          documents: { orderBy: { createdAt: "desc" }, select: { id: true, kind: true, fileName: true, mimeType: true, size: true, createdAt: true } },
        },
      })
    : null;

  // Completeness checklist (drives the progress meter and the to-do list).
  const tasks = [
    { key: "photo", done: !!s?.photoUrl, label: p.tasks.photo },
    { key: "bio", done: (s?.bio.length ?? 0) >= 40, label: p.tasks.bio },
    { key: "qual", done: (s?.qualifications.length ?? 0) > 0, label: p.tasks.qual },
    { key: "cv", done: !!s?.documents.some((d) => d.kind === "CV"), label: p.tasks.cv },
    { key: "modes", done: splitList(s?.consultationModes).length > 0, label: p.tasks.modes },
  ];
  const pct = Math.round((tasks.filter((x) => x.done).length / tasks.length) * 100);
  const visible = !!s && s.isPublic && !s.isDemo;

  return (
    <>
      <PageHeader title={p.title} subtitle={p.subtitle} />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card flex items-center gap-5 rounded-[1.5rem]">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-3xl bg-primary-soft">
            {s?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photoUrl} alt={s.displayName} className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-3xl font-extrabold text-primary">{initials(s?.displayName ?? user.fullName)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold">{s?.displayName ?? user.fullName}</p>
            <p className="text-sm text-muted">{s ? t.labels.specializations[s.specialization as keyof typeof t.labels.specializations] : "—"}</p>
            <p className={cn("mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", visible ? "bg-mint-soft text-mint" : "bg-sun-soft text-sun-ink")}>
              {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              {visible ? p.publicYes : p.publicNo}
            </p>
          </div>
        </div>
        <div className="card rounded-[1.5rem]">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>{fmt(p.completeness, { n: pct })}</span>
            <span className="text-primary">{pct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--blush))] transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {tasks.map((x) => (
              <li key={x.key} className={cn("flex items-center gap-2 text-sm", x.done ? "text-muted line-through" : "font-semibold")}>
                {x.done ? <CheckCircle2 className="size-4 shrink-0 text-mint" /> : <Circle className="size-4 shrink-0 text-line" />}
                {x.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Section title={p.identity} action={<UserRound className="size-5 text-primary" />}>
          <ProfileForm
            t={p}
            values={{
              displayName: s?.displayName ?? user.fullName,
              title: s?.title ?? "",
              specialization: s?.specialization ?? "",
              yearsExperience: String(s?.yearsExperience ?? 0),
              wilaya: s?.wilaya ?? "16",
              bio: s?.bio ?? "",
              services: s?.services ?? "",
              availability: s?.availability ?? "",
              contactEmail: s?.contactEmail ?? "",
              contactPhone: s?.contactPhone ?? "",
              languages: splitList(s?.languages),
              consultationModes: splitList(s?.consultationModes),
            }}
            specializations={SPECIALIZATION_KEYS.map((k) => [k, t.labels.specializations[k]])}
            wilayas={WILAYAS.map(([code, ar, latin]) => [code, `${code} — ${locale === "ar" ? ar : latin}`])}
            languages={(["ar", "fr", "en", "tz"] as const).map((k) => [k, t.labels.languages[k]])}
            modes={CONSULTATION_MODES.map((m) => [m, t.assessment.modes[m].title])}
          />
        </Section>

        <div className="space-y-6">
          <Section title={p.photo} action={<ImageIcon className="size-5 text-primary" />}>
            <PhotoForm t={p} />
            {s?.photoUrl && (
              <form action={removePhotoAction} className="mt-3">
                <button className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-coral hover:underline">
                  <Trash2 className="size-4" />
                  {p.removePhoto}
                </button>
              </form>
            )}
          </Section>

          <Section title={p.qualifications} action={<Award className="size-5 text-primary" />}>
            {s?.qualifications.length ? (
              <ul className="mb-4 space-y-2">
                {s.qualifications.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-bold" dir="auto">
                        {q.title}
                      </p>
                      <p className="truncate text-xs text-muted" dir="auto">
                        {q.institution}
                        {q.year ? ` · ${q.year}` : ""}
                      </p>
                    </div>
                    <form action={removeQualificationAction}>
                      <input type="hidden" name="id" value={q.id} />
                      <button className="icon-btn size-8 border-transparent text-coral" aria-label={p.removeQual} title={p.removeQual}>
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-muted">{p.noQual}</p>
            )}
            <QualificationForm t={p} />
          </Section>

          <Section title={p.documents} action={<FileText className="size-5 text-primary" />}>
            {s?.documents.length ? (
              <ul className="mb-4 space-y-2">
                {s.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm">
                    <a href={`/api/specialist-documents/${d.id}`} target="_blank" rel="noopener" className="flex min-w-0 flex-1 items-center gap-3 hover:text-primary">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        <FileText className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{d.fileName}</span>
                        <span className="text-xs text-muted">
                          {p.kinds[d.kind as keyof typeof p.kinds]} · {Math.max(1, Math.round(d.size / 1024))} KB · {formatDate(d.createdAt, locale)}
                        </span>
                      </span>
                    </a>
                    <form action={deleteSpecialistDocumentAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <ConfirmSubmit message={p.deleteConfirm} className="icon-btn size-8 border-transparent text-coral">
                        <Trash2 className="size-4" />
                        <span className="sr-only">{p.deleteDoc}</span>
                      </ConfirmSubmit>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-muted">{p.noDocs}</p>
            )}
            <DocumentForm t={p} kinds={SPECIALIST_DOC_KINDS.map((k) => [k, p.kinds[k]])} />
          </Section>
        </div>
      </div>
    </>
  );
}
