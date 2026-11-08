import Link from "next/link";
import { BadgeCheck, Languages, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { wilayaName } from "@/lib/constants";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { initials } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.specialistsPage.title, description: t.specialistsPage.subtitle };
}

export default async function SpecialistsPage() {
  const { t, locale } = await getI18n();
  const p = t.specialistsPage;
  // Only real, public profiles: demo profiles are never shown to visitors.
  const specialists = await db.specialist.findMany({ where: { isPublic: true, isDemo: false }, orderBy: { displayName: "asc" } });

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="eyebrow">
          <span className="h-0.5 w-6 rounded-full bg-sun" aria-hidden />
          {t.nav.specialists}
        </p>
        <h1 className="text-display mt-3 text-primary">{p.title}</h1>
        <p className="text-lead mt-4 text-muted">{p.subtitle}</p>
      </header>

      {specialists.length === 0 ? (
        <div className="reveal relative overflow-hidden rounded-[2rem] border border-dashed border-line bg-surface px-6 py-16 text-center">
          <span aria-hidden className="absolute -end-10 -top-10 size-32 rounded-full bg-sun-soft" />
          <span className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
            <BadgeCheck className="size-8" />
          </span>
          <h2 className="relative mt-5 text-2xl font-extrabold">{p.emptyTitle}</h2>
          <p className="relative mx-auto mt-2 max-w-md text-muted">{p.emptyBody}</p>
          <Link href="/contact" className="btn-primary relative mt-6">
            {p.join}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specialists.map((s, i) => (
            <li key={s.id} className="reveal card card-hover flex flex-col" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-on-primary">{initials(s.displayName)}</span>
                <div>
                  <p className="font-extrabold">{s.displayName}</p>
                  <p className="text-sm text-muted">{t.labels.specializations[s.specialization as keyof typeof t.labels.specializations] ?? s.title}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 flex-1 text-sm text-muted">{s.bio}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1">
                  <MapPin className="size-3.5" />
                  {wilayaName(s.wilaya, locale)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1">
                  <Languages className="size-3.5" />
                  {s.languages
                    .split(",")
                    .map((l) => t.labels.languages[l.trim() as keyof typeof t.labels.languages] ?? l)
                    .join(" · ")}
                </span>
                <span className="rounded-full bg-sun-soft px-2.5 py-1 text-sun-ink">{fmt(p.years, { n: s.yearsExperience })}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-mint">
                  <BadgeCheck className="size-3.5" />
                  {p.verified}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
