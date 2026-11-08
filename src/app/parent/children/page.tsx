import Link from "next/link";
import { FolderPlus, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { STATUS_TONE, type CaseStatus } from "@/lib/constants";
import { ageLabel, initials } from "@/lib/utils";
import { Badge, EmptyState, PageHeader } from "@/components/ui";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.children.title };
}

export default async function ChildrenPage() {
  const [user, { t }] = await Promise.all([requireParent(), getI18n()]);
  const p = t.parent.children;
  const children = await db.child.findMany({
    where: { parentId: user.parentProfileId },
    orderBy: { createdAt: "asc" },
    include: { cases: { orderBy: { createdAt: "desc" }, select: { status: true } } },
  });

  return (
    <>
      <PageHeader
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <Link href="/parent/children/new" className="btn-primary">
            <Plus className="size-4" />
            {p.add}
          </Link>
        }
      />
      {children.length === 0 ? (
        <EmptyState
          title={p.empty}
          body={p.emptyBody}
          action={
            <Link href="/parent/children/new" className="btn-primary">
              {p.add}
            </Link>
          }
        />
      ) : (
        <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((c) => {
            const last = c.cases[0];
            return (
              <li key={c.id} className="card card-hover spotlight flex flex-col rounded-[1.5rem]">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun text-xl font-extrabold text-[#29204D]">{initials(c.firstName)}</span>
                  <div className="min-w-0">
                    <Link href={`/parent/children/${c.id}`} className="block truncate text-lg font-extrabold after:absolute after:inset-0 hover:text-primary">
                      {c.firstName}
                    </Link>
                    <p className="text-sm text-muted">{ageLabel(c.birthDate, t.common)}</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{p.level}</dt>
                    <dd className="font-semibold">{t.labels.schoolLevels[c.schoolLevel as keyof typeof t.labels.schoolLevels] ?? c.schoolLevel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{p.language}</dt>
                    <dd className="font-semibold">{t.labels.schoolLanguages[c.schoolLanguage as keyof typeof t.labels.schoolLanguages] ?? c.schoolLanguage}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
                  {last ? (
                    <Badge tone={STATUS_TONE[last.status as CaseStatus]}>{t.labels.status[last.status as CaseStatus]}</Badge>
                  ) : (
                    <Badge>{p.noCase}</Badge>
                  )}
                  <span className="text-xs font-semibold text-muted">{fmt(p.casesCount, { n: c.cases.length })}</span>
                </div>
                <Link href={`/parent/cases/new?child=${c.id}`} className="btn-ghost relative z-10 mt-4">
                  <FolderPlus className="size-4" />
                  {p.newCase}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
