import Link from "next/link";
import { UserPlus } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { CATEGORY_KEYS } from "@/lib/constants";
import { EmptyState, PageHeader } from "@/components/ui";
import { CaseForm } from "@/components/parent/case-form";
import { BackLink } from "@/components/parent/bits";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.caseForm.title };
}

export default async function NewCasePage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const [user, { t }, { child }] = await Promise.all([requireParent(), getI18n(), searchParams]);
  const f = t.parent.caseForm;
  const children = await db.child.findMany({ where: { parentId: user.parentProfileId }, orderBy: { createdAt: "asc" }, select: { id: true, firstName: true } });
  // Pre-select only a child that actually belongs to this parent.
  const preset = children.find((c) => c.id === child)?.id ?? (children.length === 1 ? children[0].id : undefined);

  return (
    <div className="max-w-3xl">
      <BackLink href="/parent/cases">{t.parent.case.back}</BackLink>
      <PageHeader title={f.title} subtitle={f.subtitle} />
      {children.length === 0 ? (
        <EmptyState
          title={f.needChildTitle}
          body={f.needChildBody}
          action={
            <Link href="/parent/children/new?next=case" className="btn-primary">
              <UserPlus className="size-4" />
              {t.parent.children.add}
            </Link>
          }
        />
      ) : (
        <CaseForm
          t={f}
          kids={children.map((c) => [c.id, c.firstName])}
          categories={CATEGORY_KEYS.map((k) => [k, t.labels.categories[k]])}
          defaultChild={preset}
        />
      )}
    </div>
  );
}
