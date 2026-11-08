"use client";

import { useActionState, useState } from "react";
import { Check, FileText, Paperclip, X } from "lucide-react";
import { submitCaseAction } from "@/app/parent/actions";
import { FormMessage, Select, SubmitButton, TextArea, Field } from "@/components/form";
import { cn } from "@/lib/utils";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

const MAX_FILES = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card rounded-[1.5rem] p-6 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-on-primary">{n}</span>
        <h2 className="text-lg font-extrabold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

export function CaseForm({
  t,
  kids,
  categories,
  defaultChild,
}: {
  t: Dict["parent"]["caseForm"];
  kids: [string, string][];
  categories: [string, string][];
  defaultChild?: string;
}) {
  const [state, action] = useActionState(submitCaseAction, null);
  const kept = state?.data as Record<string, string | string[]> | undefined;
  const keptCats = (kept?.categories as string[] | undefined) ?? [];
  const [cats, setCats] = useState<string[]>(keptCats);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const err = state?.errors ?? {};
  const val = (k: string) => String(kept?.[k] ?? "");

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles(list);
    if (list.length > MAX_FILES) setFileError(t.errors.tooMany);
    else if (list.some((f) => f.size > MAX_BYTES)) setFileError(t.errors.fileSize);
    else if (list.some((f) => !ACCEPT.split(",").includes(f.type))) setFileError(t.errors.fileType);
    else setFileError(null);
  }

  const toggle = (k: string) => setCats((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  return (
    <form action={action} className="space-y-6" noValidate>
      <FormMessage state={state} />

      <Step n={1} title={t.sectionChild}>
        <Select key={`c-${val("childId") || defaultChild}`} name="childId" label={t.child} state={state} options={kids} placeholder={t.childPlaceholder} defaultValue={val("childId") || defaultChild || ""} required />
        <div>
          <p className="label">{t.areas}</p>
          <p className="mb-3 text-xs text-muted">{t.areasHint}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.areas}>
            {categories.map(([key, label]) => {
              const on = cats.includes(key);
              return (
                <label
                  key={key}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition select-none has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20",
                    on ? "border-primary bg-primary text-on-primary" : "border-line bg-surface hover:border-primary/40",
                  )}
                >
                  <input type="checkbox" name="categories" value={key} checked={on} onChange={() => toggle(key)} className="sr-only" />
                  {on && <Check className="size-4" strokeWidth={3} />}
                  {label}
                </label>
              );
            })}
          </div>
          {err.categories && <p className="field-error">{err.categories}</p>}
        </div>
        {cats.includes("OTHER") && <Field name="otherCategory" label={t.otherArea} state={state} defaultValue={val("otherCategory")} />}
      </Step>

      <Step n={2} title={t.sectionObservations}>
        <TextArea name="description" label={t.description} hint={t.descriptionHint} rows={5} required state={state} defaultValue={val("description")} />
        <Field name="firstNoticed" label={t.firstNoticed} hint={t.firstNoticedHint} required state={state} defaultValue={val("firstNoticed")} />
        <TextArea name="situations" label={t.situations} hint={t.situationsHint} rows={3} required state={state} defaultValue={val("situations")} />
      </Step>

      <Step n={3} title={t.sectionHistory}>
        <div>
          <p className="label">{t.priorSupport}</p>
          <div className="grid gap-2 sm:grid-cols-4" role="radiogroup" aria-label={t.priorSupport}>
            {(Object.entries(t.priorSupportOptions) as [string, string][]).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20"
              >
                <input type="radio" name="priorSupport" value={key} defaultChecked={val("priorSupport") === key} className="accent-[var(--primary)]" />
                {label}
              </label>
            ))}
          </div>
          {err.priorSupport && <p className="field-error">{err.priorSupport}</p>}
        </div>
        <TextArea name="priorSupportDetails" label={t.priorSupportDetails} rows={2} state={state} defaultValue={val("priorSupportDetails")} />
      </Step>

      <Step n={4} title={t.sectionDocuments}>
        <div>
          <label htmlFor="documents" className="label">
            {t.documents}
          </label>
          <label
            htmlFor="documents"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface-2/50 px-4 py-8 text-center transition hover:border-primary/50 hover:bg-primary-soft/40"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Paperclip className="size-5" />
            </span>
            <span className="text-sm text-muted">{t.documentsHint}</span>
          </label>
          <input id="documents" name="documents" type="file" multiple accept={ACCEPT} onChange={onFiles} className="sr-only" />
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f) => (
                <li key={f.name + f.size} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <span className={cn("shrink-0 text-xs", f.size > MAX_BYTES ? "text-coral" : "text-muted")}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                </li>
              ))}
            </ul>
          )}
          {(fileError || err.documents) && (
            <p className="field-error flex items-center gap-1">
              <X className="size-3.5" />
              {fileError || err.documents}
            </p>
          )}
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-4 text-sm transition hover:border-primary/40">
            <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" />
            <span>{t.consent}</span>
          </label>
          {err.consent && <p className="field-error">{err.consent}</p>}
        </div>
      </Step>

      <SubmitButton className="btn-lg w-full sm:w-auto" pendingText={t.submitting}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
