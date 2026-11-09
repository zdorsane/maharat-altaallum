"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createChildAction, updateChildAction } from "@/app/parent/actions";
import { Field, FormMessage, Select, SubmitButton, TextArea } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

type ChildValues = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  schoolLevel: string;
  schoolLanguage: string;
  schoolName: string;
  observations: string;
  previousAssessments: string;
};

export function ChildForm({
  t,
  extra,
  levels,
  languages,
  child,
  next,
  cancelHref,
}: {
  t: Dict["parent"]["childForm"];
  extra: Dict["childExtra"];
  levels: [string, string][];
  languages: [string, string][];
  child?: ChildValues;
  next?: string;
  cancelHref: string;
}) {
  const [state, action] = useActionState(child ? updateChildAction : createChildAction, null);
  const v = (k: keyof ChildValues) => String(state?.data?.[k] ?? child?.[k] ?? "");
  const today = new Date();
  const max = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const min = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-5" noValidate>
      {child && <input type="hidden" name="id" value={child.id} />}
      {next && <input type="hidden" name="next" value={next} />}
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label={t.firstName} autoComplete="off" required state={state} defaultValue={v("firstName")} />
        <Field name="lastName" label={extra.lastName} autoComplete="off" state={state} defaultValue={v("lastName")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="birthDate" label={t.birthDate} type="date" min={min} max={max} required state={state} defaultValue={v("birthDate")} />
        <Select key={`s-${v("gender")}`} name="gender" label={extra.gender} state={state} options={[["", extra.genderPlaceholder], ...(Object.entries(extra.genders) as [string, string][])]} defaultValue={v("gender")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Select key={`l-${v("schoolLevel")}`} name="schoolLevel" label={t.schoolLevel} state={state} options={levels} placeholder={t.schoolLevelPlaceholder} defaultValue={v("schoolLevel")} required />
        <Select key={`g-${v("schoolLanguage")}`} name="schoolLanguage" label={t.schoolLanguage} state={state} options={languages} placeholder={t.schoolLanguagePlaceholder} defaultValue={v("schoolLanguage")} required />
      </div>
      <Field name="schoolName" label={extra.schoolName} autoComplete="off" state={state} defaultValue={v("schoolName")} />
      <TextArea name="observations" label={t.observations} hint={t.observationsHint} rows={3} state={state} defaultValue={v("observations")} />
      <TextArea name="previousAssessments" label={t.previousAssessments} hint={t.previousAssessmentsHint} rows={3} state={state} defaultValue={v("previousAssessments")} />
      <div className="flex flex-wrap gap-3 pt-2">
        <SubmitButton className="btn-lg" pendingText={t.saving}>
          {child ? t.save : t.create}
        </SubmitButton>
        <Link href={cancelHref} className="btn-ghost btn-lg">
          {t.cancel}
        </Link>
      </div>
    </form>
  );
}
