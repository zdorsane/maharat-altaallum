import Link from "next/link";
import { ArrowRight, MessageSquare, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { caseStage, requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { STATUS_TONE, type CaseStatus, type CategoryKey } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { CaseStages } from "@/components/parent/bits";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.cases.title };
}

export default async function CasesPage() {
  const [user, { t, locale }] = await Promise.all([requireParent(), getI18n()]);
  const p = t.parent.cases;
  const [cases, unread] = await Promise.all([
    db.case.findMany({
      where: { child: { parentId: user.parentProfileId } },
      orderBy: { createdAt: "desc" },
      include: { child: { select: { firstName: true } }, categories: true },
    }),
    db.message.groupBy({ by: ["caseId"], where: { recipientId: user.id, readAt: null }, _count: { _all: true } }),
  ]);
  const unreadBy = new Map(unread.map((u) => [u.caseId, u._count._all]));

  return (
    <>
      <PageHeader
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <Link href="/parent/cases/new" className="btn-primary">
            <Plus className="size-4" />
            {p.new}
          </Link>
        }
      />
      {cases.length === 0 ? (
        <EmptyState
          title={p.empty}
          body={p.emptyBody}
          action={
            <Link href="/parent/cases/new" className="btn-primary">
              {p.new}
            </Link>
          }
        />
      ) : (
        <ul className="reveal-stagger space-y-4">
          {cases.map((c) => {
            const n = unreadBy.get(c.id) ?? 0;
            return (
              <li key={c.id} className="card card-hover spotlight rounded-[1.5rem]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/parent/cases/${c.id}`} className="font-mono text-lg font-extrabold after:absolute after:inset-0 hover:text-primary">
                      {c.reference}
                    </Link>
                    <p className="text-sm text-muted">
                      {c.child.firstName} · {fmt(p.submittedOn, { date: formatDate(c.createdAt, locale) })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {n > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-coral-soft px-2.5 py-1 text-xs font-bold text-coral">
                        <MessageSquare className="size-3.5" />
                        {fmt(p.unread, { n })}
                      </span>
                    )}
                    <Badge tone={STATUS_TONE[c.status as CaseStatus]}>{t.labels.status[c.status as CaseStatus]}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.categories.map((k) => (
                    <span key={k.key} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {t.labels.categories[k.key as CategoryKey]}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-end gap-4">
                  <div className="flex-1">
                    <CaseStages stage={caseStage(c.status)} labels={t.parent.case.stages} closedLabel={t.parent.case.closed} />
                  </div>
                  <ArrowRight className="mb-2 hidden size-5 shrink-0 text-primary sm:block rtl:rotate-180" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
