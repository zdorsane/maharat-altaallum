import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { SCHOOL_LANGUAGES, SCHOOL_LEVELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui";
import { ChildForm } from "@/components/parent/child-form";
import { BackLink } from "@/components/parent/bits";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.childForm.titleNew };
}

export default async function NewChildPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [, { t }, { next }] = await Promise.all([requireParent(), getI18n(), searchParams]);
  const f = t.parent.childForm;
  return (
    <div className="max-w-3xl">
      <BackLink href="/parent/children">{t.parent.child.back}</BackLink>
      <PageHeader title={f.titleNew} subtitle={t.childExtra.privacy} />
      <div className="card rounded-[1.5rem] p-6 sm:p-8">
        <ChildForm
          t={f}
          extra={t.childExtra}
          levels={SCHOOL_LEVELS.map((k) => [k, t.labels.schoolLevels[k]])}
          languages={SCHOOL_LANGUAGES.map((k) => [k, t.labels.schoolLanguages[k]])}
          next={next === "case" ? "case" : undefined}
          cancelHref="/parent/children"
        />
      </div>
    </div>
  );
}
