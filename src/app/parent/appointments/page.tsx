import Link from "next/link";
import { CalendarDays, Clock, MapPin, Video } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { cn, formatDate } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, Section } from "@/components/ui";
import { AppointmentActions } from "@/components/parent/forms";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.appointments.title };
}

const TONE = { PROPOSED: "warn", CONFIRMED: "success", CANCELLED: "neutral", COMPLETED: "info" } as const;

export default async function AppointmentsPage() {
  const [user, { t, locale }] = await Promise.all([requireParent(), getI18n()]);
  const p = t.parent.appointments;
  const now = new Date();
  const all = await db.appointment.findMany({
    where: { child: { parentId: user.parentProfileId } },
    orderBy: { scheduledAt: "asc" },
    include: { child: { select: { firstName: true } }, specialist: { select: { displayName: true } }, case: { select: { id: true, reference: true } } },
  });
  const upcoming = all.filter((a) => a.scheduledAt >= now && a.status !== "CANCELLED");
  const past = all.filter((a) => a.scheduledAt < now || a.status === "CANCELLED").reverse();
  const time = (d: Date) => new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : locale, { hour: "2-digit", minute: "2-digit" }).format(d);

  const Card = ({ a, actionable }: { a: (typeof all)[number]; actionable: boolean }) => (
    <li className={cn("card flex flex-col gap-4 rounded-[1.5rem] sm:flex-row sm:items-center", !actionable && "opacity-80")}>
      <div className="grid w-20 shrink-0 place-items-center rounded-2xl bg-primary-soft py-3 text-center text-primary">
        <span className="text-2xl leading-none font-extrabold">{a.scheduledAt.getDate()}</span>
        <span className="text-xs font-bold">{new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : locale, { month: "short" }).format(a.scheduledAt)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-extrabold">
            {a.child.firstName} · {t.labels.appointmentKind[a.kind as keyof typeof t.labels.appointmentKind]}
          </p>
          <Badge tone={TONE[a.status as keyof typeof TONE] ?? "neutral"}>{t.labels.appointmentStatus[a.status as keyof typeof t.labels.appointmentStatus]}</Badge>
        </div>
        <p className="text-sm text-muted">{fmt(p.with, { name: a.specialist.displayName })}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDate(a.scheduledAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {time(a.scheduledAt)} · {fmt(p.duration, { n: a.durationMin })}
          </span>
          <span className="inline-flex items-center gap-1">
            {a.mode === "ONLINE" ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
            {a.mode === "ONLINE" ? p.online : (a.location ?? p.inPerson)}
          </span>
          {a.case && (
            <Link href={`/parent/cases/${a.case.id}`} className="font-mono text-primary hover:underline">
              {a.case.reference}
            </Link>
          )}
        </div>
      </div>
      {actionable && (a.status === "PROPOSED" || a.status === "CONFIRMED") && (
        <AppointmentActions id={a.id} canConfirm={a.status === "PROPOSED"} labels={{ confirm: p.confirm, cancel: p.cancel, cancelConfirm: p.cancelConfirm }} />
      )}
    </li>
  );

  return (
    <>
      <PageHeader title={p.title} subtitle={p.subtitle} />
      {all.length === 0 ? (
        <EmptyState title={p.empty} body={p.emptyBody} />
      ) : (
        <div className="space-y-6">
          <Section title={p.upcoming}>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">{t.parent.child.noAppointments}</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((a) => (
                  <Card key={a.id} a={a} actionable />
                ))}
              </ul>
            )}
          </Section>
          {past.length > 0 && (
            <Section title={p.past}>
              <ul className="space-y-3">
                {past.map((a) => (
                  <Card key={a.id} a={a} actionable={false} />
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </>
  );
}
