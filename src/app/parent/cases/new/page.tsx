import Link from "next/link";
import { ArrowRight, ClipboardList, FileClock, UserPlus } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { ageLabel, cn, formatDateTime, initials } from "@/lib/utils";
import { EmptyState, PageHeader } from "@/components/ui";
import { BackLink } from "@/components/parent/bits";
import { startAssessmentAction } from "@/app/parent/assessment-actions";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.assessment.chooseChild.title };
}

/** Entry point of the assessment: pick (or add) the child, then resume their draft or start one. */
export default async function NewCasePage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const [user, { t, locale }, { child }] = await Promise.all([requireParent(), getI18n(), searchParams]);
  const c = t.assessment.chooseChild;
  const children = await db.child.findMany({
    where: { parentId: user.parentProfileId },
    orderBy: { createdAt: "asc" },
    include: { difficultyAssessments: { where: { status: "DRAFT" }, orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } } },
  });

  return (
    <div className="max-w-3xl">
      <BackLink href="/parent/cases">{t.parent.case.back}</BackLink>
      <PageHeader title={c.title} subtitle={c.subtitle} />
      {children.length === 0 ? (
        <EmptyState
          title={t.parent.caseForm.needChildTitle}
          body={t.parent.caseForm.needChildBody}
          action={
            <Link href="/parent/children/new?next=case" className="btn-primary">
              <UserPlus className="size-4" />
              {t.parent.children.add}
            </Link>
          }
        />
      ) : (
        <ul className="reveal-stagger space-y-3">
          {children.map((k) => {
            const draft = k.difficultyAssessments[0];
            return (
              <li key={k.id}>
                <form action={startAssessmentAction}>
                  <input type="hidden" name="childId" value={k.id} />
                  <button
                    className={cn(
                      "card card-hover spotlight group flex w-full cursor-pointer items-center gap-4 rounded-[1.5rem] text-start",
                      child === k.id && "border-primary ring-4 ring-primary/15",
                    )}
                  >
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun text-xl font-extrabold text-[#29204D]">{initials(k.firstName)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-extrabold">{k.firstName}</span>
                      <span className="block text-sm text-muted">{ageLabel(k.birthDate, t.common)}</span>
                      {draft && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sun-ink">
                          <FileClock className="size-3.5" />
                          {fmt(t.assessment.lastSaved, { date: formatDateTime(draft.updatedAt, locale) })}
                        </span>
                      )}
                    </span>
                    <span className="btn-primary pointer-events-none">
                      <ClipboardList className="size-4" />
                      {draft ? t.assessment.continue : t.assessment.start}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </span>
                  </button>
                </form>
              </li>
            );
          })}
          <li>
            <Link href="/parent/children/new?next=case" className="btn-ghost w-full">
              <UserPlus className="size-4" />
              {t.parent.children.add}
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
