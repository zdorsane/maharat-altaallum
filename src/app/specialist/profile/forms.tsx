"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check, Plus, Upload } from "lucide-react";
import { addQualificationAction, updateSpecialistProfileAction, uploadPhotoAction, uploadSpecialistDocumentAction } from "./actions";
import { Field, FormMessage, Select, SubmitButton, TextArea } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { cn } from "@/lib/utils";

type P = Dict["specProfile"];

export type ProfileValues = {
  displayName: string;
  title: string;
  specialization: string;
  yearsExperience: string;
  wilaya: string;
  bio: string;
  services: string;
  availability: string;
  contactEmail: string;
  contactPhone: string;
  languages: string[];
  consultationModes: string[];
};

function Chips({ name, options, selected, error }: { name: string; options: [string, string][]; selected: string[]; error?: string }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => (
          <label
            key={value}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-surface px-4 py-2 text-sm font-semibold transition select-none has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20"
          >
            <input type="checkbox" name={name} value={value} defaultChecked={selected.includes(value)} className="peer sr-only" />
            <Check className="hidden size-4 peer-checked:block" strokeWidth={3} />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function ProfileForm({
  t,
  values,
  specializations,
  wilayas,
  languages,
  modes,
}: {
  t: P;
  values: ProfileValues;
  specializations: [string, string][];
  wilayas: [string, string][];
  languages: [string, string][];
  modes: [string, string][];
}) {
  const [state, action] = useActionState(updateSpecialistProfileAction, null);
  const kept = state?.data as Partial<Record<keyof ProfileValues, string | string[]>> | undefined;
  const v = (k: Exclude<keyof ProfileValues, "languages" | "consultationModes">) => String(kept?.[k] ?? values[k]);
  const list = (k: "languages" | "consultationModes") => (kept?.[k] as string[] | undefined) ?? values[k];
  const err = state?.errors ?? {};

  return (
    <form action={action} className="space-y-6" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="displayName" label={t.displayName} required state={state} defaultValue={v("displayName")} />
        <Field name="title" label={t.jobTitle} required state={state} defaultValue={v("title")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Select key={`sp-${v("specialization")}`} name="specialization" label={t.specialization} state={state} options={specializations} placeholder={t.specializationPlaceholder} defaultValue={v("specialization")} required />
        <Field name="yearsExperience" label={t.yearsExperience} type="number" min={0} max={60} required state={state} defaultValue={v("yearsExperience")} />
        <Select key={`w-${v("wilaya")}`} name="wilaya" label={t.wilaya} state={state} options={wilayas} defaultValue={v("wilaya")} required />
      </div>
      <TextArea name="bio" label={t.bio} hint={t.bioHint} rows={5} required state={state} defaultValue={v("bio")} dir="auto" />
      <div>
        <p className="label">{t.languages}</p>
        <Chips name="languages" options={languages} selected={list("languages")} error={err.languages} />
      </div>
      <div>
        <p className="label">{t.consultationModes}</p>
        <Chips name="consultationModes" options={modes} selected={list("consultationModes")} error={err.consultationModes} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextArea name="services" label={t.services} hint={t.servicesHint} rows={4} state={state} defaultValue={v("services")} dir="auto" />
        <TextArea name="availability" label={t.availability} hint={t.availabilityHint} rows={4} state={state} defaultValue={v("availability")} dir="auto" />
      </div>
      <fieldset className="rounded-2xl border border-line p-4">
        <legend className="px-1 text-sm font-bold">{t.contact}</legend>
        <p className="mb-4 text-xs text-muted">{t.contactHint}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="contactEmail" label={t.contactEmail} type="email" dir="ltr" state={state} defaultValue={v("contactEmail")} />
          <Field name="contactPhone" label={t.contactPhone} type="tel" dir="ltr" state={state} defaultValue={v("contactPhone")} />
        </div>
      </fieldset>
      <SubmitButton className="btn-lg" pendingText={t.saving}>
        {t.save}
      </SubmitButton>
    </form>
  );
}

function useResetOnSuccess(ok: boolean | undefined) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (ok) ref.current?.reset();
  }, [ok]);
  return ref;
}

export function PhotoForm({ t }: { t: P }) {
  const [state, action] = useActionState(uploadPhotoAction, null);
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        aria-label={t.photo}
        className="w-full text-sm file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary"
      />
      <p className="text-xs text-muted">{t.photoHint}</p>
      {state?.errors?.photo && <p className="field-error">{state.errors.photo}</p>}
      {state?.ok && <p className="text-xs font-semibold text-mint">{state.message}</p>}
      <SubmitButton pendingText={t.saving}>
        <Upload className="size-4" />
        {t.uploadPhoto}
      </SubmitButton>
    </form>
  );
}

export function QualificationForm({ t }: { t: P }) {
  const [state, action] = useActionState(addQualificationAction, null);
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} className="grid gap-3 rounded-2xl bg-surface-2 p-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end" noValidate>
      <Field name="qualTitle" label={t.qualTitle} state={state} defaultValue={String(state?.ok ? "" : (state?.data?.qualTitle ?? ""))} />
      <Field name="qualInstitution" label={t.qualInstitution} state={state} defaultValue={String(state?.ok ? "" : (state?.data?.qualInstitution ?? ""))} />
      <Field name="qualYear" label={t.qualYear} inputMode="numeric" dir="ltr" state={state} defaultValue={String(state?.ok ? "" : (state?.data?.qualYear ?? ""))} />
      <SubmitButton className={cn("sm:mb-[1px]")}>
        <Plus className="size-4" />
        {t.addQual}
      </SubmitButton>
    </form>
  );
}

export function DocumentForm({ t, kinds }: { t: P; kinds: [string, string][] }) {
  const [state, action] = useActionState(uploadSpecialistDocumentAction, null);
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} className="space-y-3 rounded-2xl bg-surface-2 p-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <Select name="kind" label={t.kind} state={state} options={kinds} defaultValue="CV" />
        <div>
          <label htmlFor="document" className="label">
            {t.documents}
          </label>
          <input
            id="document"
            name="document"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="w-full text-sm file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary"
          />
          {state?.errors?.document && <p className="field-error">{state.errors.document}</p>}
        </div>
      </div>
      <p className="text-xs text-muted">{t.documentsHint}</p>
      {state?.ok && <p className="text-xs font-semibold text-mint">{state.message}</p>}
      <SubmitButton pendingText={t.uploading}>
        <Upload className="size-4" />
        {t.upload}
      </SubmitButton>
    </form>
  );
}
