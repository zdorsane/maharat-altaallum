import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { getOwnedChild, requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { SCHOOL_LANGUAGES, SCHOOL_LEVELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui";
import { ChildForm } from "@/components/parent/child-form";
import { BackLink } from "@/components/parent/bits";
import { ConfirmSubmit } from "@/components/parent/forms";
import { deleteChildAction } from "@/app/parent/actions";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.childForm.titleEdit };
}

export default async function EditChildPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { t }, { id }] = await Promise.all([requireParent(), getI18n(), params]);
  const child = await getOwnedChild(user.parentProfileId, id);
  const hasCases = (await db.case.count({ where: { childId: child.id } })) > 0;
  const f = t.parent.childForm;

  return (
    <div className="max-w-3xl">
      <BackLink href={`/parent/children/${child.id}`}>{child.firstName}</BackLink>
      <PageHeader title={f.titleEdit} subtitle={t.childExtra.privacy} />
      <div className="card rounded-[1.5rem] p-6 sm:p-8">
        <ChildForm
          t={f}
          extra={t.childExtra}
          levels={SCHOOL_LEVELS.map((k) => [k, t.labels.schoolLevels[k]])}
          languages={SCHOOL_LANGUAGES.map((k) => [k, t.labels.schoolLanguages[k]])}
          child={{
            id: child.id,
            firstName: child.firstName,
            lastName: child.lastName ?? "",
            gender: child.gender ?? "",
            birthDate: child.birthDate.toISOString().slice(0, 10),
            schoolLevel: child.schoolLevel,
            schoolLanguage: child.schoolLanguage,
            schoolName: child.schoolName ?? "",
            observations: child.observations ?? "",
            previousAssessments: child.previousAssessments ?? "",
          }}
          cancelHref={`/parent/children/${child.id}`}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-coral/30 bg-coral-soft/50 p-4">
        <p className="text-sm text-muted">{hasCases ? f.deleteBlocked : f.deleteConfirm}</p>
        {!hasCases && (
          <form action={deleteChildAction}>
            <input type="hidden" name="id" value={child.id} />
            <ConfirmSubmit message={f.deleteConfirm} className="btn-danger">
              <Trash2 className="size-4" />
              {f.delete}
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
