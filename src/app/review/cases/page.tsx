import { requireRole } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";
import { StaffCaseList } from "@/components/staff/case-list";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.staffCase.listTitle };
}

export default async function ReviewCasesPage() {
  const [, { t, locale }] = await Promise.all([requireRole("SUPER_ADMIN", "ADMIN", "REVIEWER"), getI18n()]);
  return (
    <>
      <PageHeader title={t.staffCase.listTitle} subtitle={t.staffCase.listSubtitle} />
      <StaffCaseList where={{}} hrefBase="/review/cases" t={t} locale={locale} empty={t.staffCase.empty} />
    </>
  );
}
