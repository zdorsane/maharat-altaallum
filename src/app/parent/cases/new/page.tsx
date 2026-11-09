import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { EDITABLE_CASE_STATUSES, splitList } from "@/lib/assessment";
import { PageHeader } from "@/components/ui";
import { BackLink } from "@/components/parent/bits";
import { QuickAssessmentForm } from "@/components/assessment/quick-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.quick.title };
}

/** Learning-difficulty assessment: child → type → problems → automatic summary → submit. */
export default async function NewAssessmentPage({ searchParams }: { searchParams: Promise<{ child?: string; assessment?: string }> }) {
  const [user, { t }, sp] = await Promise.all([requireParent(), getI18n(), searchParams]);
  const kids = await db.child.findMany({ where: { parentId: user.parentProfileId }, orderBy: { createdAt: "asc" }, select: { id: true, firstName: true } });

  // Edit mode: only the parent's own submitted assessment, and only before the review starts.
  let initial = { childId: kids.find((k) => k.id === sp.child)?.id ?? (kids.length === 1 ? kids[0].id : ""), items: [] as string[], notes: "", assessmentId: undefined as string | undefined };
  if (sp.assessment) {
    const a = await db.difficultyAssessment.findFirst({
      where: { id: sp.assessment, status: "SUBMITTED", child: { parentId: user.parentProfileId } },
      include: { case: { select: { id: true, status: true } } },
    });
    if (!a?.case) redirect("/parent/cases");
    if (!EDITABLE_CASE_STATUSES.includes(a.case.status)) redirect(`/parent/cases/${a.case.id}`);
    initial = { childId: a.childId, items: splitList(a.items), notes: a.summary ?? "", assessmentId: a.id };
  }
  const editingName = initial.assessmentId ? kids.find((k) => k.id === initial.childId)?.firstName : null;

  return (
    <div className="max-w-5xl">
      <BackLink href="/parent">{t.navs.parent.home}</BackLink>
      <PageHeader title={editingName ? fmt(t.quick.editing, { name: editingName }) : t.quick.title} subtitle={t.quick.subtitle} />
      <p className="mb-8 flex items-start gap-2 rounded-2xl border border-sun/40 bg-sun-soft px-4 py-3 text-sm text-sun-ink">
        <Info className="mt-0.5 size-4 shrink-0" />
        {t.assessment.disclaimer}
      </p>
      <QuickAssessmentForm q={t.quick} itemLabels={t.assessment.items} kids={kids} initial={initial} />
    </div>
  );
}
