import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { canAccessCase } from "@/lib/rbac";
import { getI18n } from "@/lib/i18n/server";
import { StaffCaseView } from "@/components/staff/case-view";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.staffCase.myCasesTitle };
}

export default async function SpecialistCasePage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { t, locale }, { id }] = await Promise.all([requireRole("SPECIALIST"), getI18n(), params]);
  // canAccessCase only allows the specialist the case is assigned to.
  if (!(await canAccessCase(user, id))) notFound();
  return <StaffCaseView caseId={id} viewer={user} t={t} locale={locale} backHref="/specialist/cases" />;
}
