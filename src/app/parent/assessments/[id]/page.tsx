import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { EDITABLE_CASE_STATUSES, splitList } from "@/lib/assessment";
import { Badge, PageHeader } from "@/components/ui";
import { BackLink } from "@/components/parent/bits";
import { AssessmentWizard } from "@/components/assessment/wizard";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.assessment.title };
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { t, locale }, { id }] = await Promise.all([requireParent(), getI18n(), params]);
  const a = await db.difficultyAssessment.findFirst({
    where: { id, child: { parentId: user.parentProfileId } },
    include: { child: { select: { id: true, firstName: true } }, case: { select: { id: true, status: true } } },
  });
  if (!a) notFound();

  const submitted = a.status === "SUBMITTED";
  // Once the team starts working on the file, answers are frozen: show the file instead.
  if (submitted && (!a.case || !EDITABLE_CASE_STATUSES.includes(a.case.status))) redirect(a.case ? `/parent/cases/${a.case.id}` : `/parent/children/${a.child.id}`);

  return (
    <div className="max-w-5xl">
      <BackLink href={`/parent/children/${a.child.id}`}>{a.child.firstName}</BackLink>
      <PageHeader
        title={t.assessment.title}
        subtitle={fmt(t.assessment.subtitle, { name: a.child.firstName })}
        actions={<Badge tone={submitted ? "success" : "warn"}>{submitted ? t.assessment.submittedBadge : t.assessment.draftBadge}</Badge>}
      />
      <AssessmentWizard
        id={a.id}
        submitted={submitted}
        lastSaved={a.updatedAt.toISOString()}
        locale={locale}
        initial={{
          items: splitList(a.items),
          clearSections: splitList(a.clearSections),
          summary: a.summary ?? "",
          priorSupport: a.priorSupport ?? "",
          priorSupportDetails: a.priorSupportDetails ?? "",
          consultationMode: a.consultationMode ?? "",
          consultationNote: a.consultationNote ?? "",
        }}
        labels={{ a: t.assessment, cf: t.parent.caseForm }}
      />
    </div>
  );
}
