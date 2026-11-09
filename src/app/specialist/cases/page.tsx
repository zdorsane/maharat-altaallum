import { requireRole } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";
import { StaffCaseList } from "@/components/staff/case-list";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.staffCase.myCasesTitle };
}

export default async function SpecialistCasesPage() {
  const [user, { t, locale }] = await Promise.all([requireRole("SPECIALIST"), getI18n()]);
  return (
    <>
      <PageHeader title={t.staffCase.myCasesTitle} subtitle={t.staffCase.myCasesSubtitle} />
      {/* Only cases explicitly assigned to this specialist. */}
      <StaffCaseList where={{ assignedSpecialistId: user.specialistId ?? "-" }} hrefBase="/specialist/cases" t={t} locale={locale} empty={t.staffCase.emptySpecialist} />
    </>
  );
}
