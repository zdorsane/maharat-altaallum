"use client";

import { startTransition, useActionState, useRef, useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Info, LoaderCircle, Paperclip, Pencil, Save } from "lucide-react";
import { saveAssessmentAction, submitAssessmentAction, type AssessmentInput } from "@/app/parent/assessment-actions";
import { CONSULTATION_MODES, DIFFICULTY_SECTIONS, SECTION_KEYS, sectionDone, type SectionKey } from "@/lib/assessment";
import { fmt } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { cn } from "@/lib/utils";
import { MODE_ICONS, SECTION_STYLE } from "./summary";

type Labels = {
  a: Dict["assessment"];
  cf: Dict["parent"]["caseForm"];
};

export function AssessmentWizard({
  id,
  initial,
  submitted,
  lastSaved,
  locale,
  labels: { a, cf },
}: {
  id: string;
  initial: AssessmentInput;
  submitted: boolean;
  lastSaved: string;
  locale: string;
  labels: Labels;
}) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<AssessmentInput>(initial);
  const [savedAt, setSavedAt] = useState<string>(lastSaved);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [state, formAction, submitting] = useActionState(submitAssessmentAction, null);
  const topRef = useRef<HTMLDivElement>(null);

  const done = SECTION_KEYS.filter((s) => sectionDone(s, v.items, v.clearSections)).length;
  const time = (iso: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  function save(next?: AssessmentInput) {
    return new Promise<boolean>((resolve) => {
      startSaving(async () => {
        const r = await saveAssessmentAction(id, next ?? v);
        if (r.ok && r.savedAt) {
          setSavedAt(r.savedAt);
          setSaveError(null);
        } else setSaveError(r.error ?? a.errors.generic);
        resolve(r.ok);
      });
    });
  }

  // ── Section toggles ──
  function toggleItem(section: SectionKey, key: string) {
    setV((cur) => {
      const items = cur.items.includes(key) ? cur.items.filter((k) => k !== key) : [...cur.items, key];
      return { ...cur, items, clearSections: cur.clearSections.filter((s) => s !== section) };
    });
    setStepError(null);
  }
  function toggleNone(section: SectionKey) {
    setV((cur) => {
      const on = cur.clearSections.includes(section);
      const own = DIFFICULTY_SECTIONS[section] as readonly string[];
      return {
        ...cur,
        clearSections: on ? cur.clearSections.filter((s) => s !== section) : [...cur.clearSections, section],
        items: on ? cur.items : cur.items.filter((k) => !own.includes(k)),
      };
    });
    setStepError(null);
  }

  // ── Step validation (gentle, mirrors the server rules) ──
  function stepProblem(s: number): string | null {
    if (s === 0) {
      if (done < SECTION_KEYS.length) return a.errors.sections;
      if (v.items.length === 0) return a.errors.noItem;
    }
    if (s === 1) {
      if (v.summary.trim().length < 30) return a.errors.summary;
      if (!v.priorSupport) return cf.errors.priorSupport;
    }
    if (s === 2 && !v.consultationMode) return a.errors.mode;
    return null;
  }

  async function go(to: number) {
    if (to > step) {
      const problem = stepProblem(step);
      if (problem) {
        setStepError(problem);
        return;
      }
    }
    setStepError(null);
    await save();
    setStep(to);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (await save()) startTransition(() => formAction(fd));
  }

  const serverErrors = state?.errors ?? {};
  const furthest = [0, 1, 2].findIndex((s) => stepProblem(s) !== null);
  const reachable = furthest === -1 ? 3 : furthest;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Stepper */}
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={a.title}>
        {a.steps.map((label, i) => {
          const current = i === step;
          const complete = i < step || (i < 3 && stepProblem(i) === null && i < reachable + 1 && i !== step);
          return (
            <li key={label}>
              <button
                type="button"
                disabled={i > reachable}
                onClick={() => go(i)}
                aria-current={current ? "step" : undefined}
                className="group flex w-full cursor-pointer flex-col items-center gap-2 text-center disabled:cursor-not-allowed"
              >
                <span className="flex w-full items-center">
                  <span className={cn("h-1 flex-1 rounded-full transition-colors", i === 0 ? "bg-transparent" : i <= step ? "bg-primary" : "bg-line")} />
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold transition",
                      current && "bg-primary text-on-primary ring-4 ring-primary/20",
                      !current && complete && "bg-primary text-on-primary",
                      !current && !complete && "bg-surface-2 text-muted group-enabled:group-hover:bg-primary-soft",
                    )}
                  >
                    {!current && complete ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn("h-1 flex-1 rounded-full transition-colors", i === a.steps.length - 1 ? "bg-transparent" : i < step ? "bg-primary" : "bg-line")} />
                </span>
                <span className={cn("hidden text-xs font-bold sm:block", current ? "text-primary" : "text-muted")}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mb-6 flex items-start gap-2 rounded-2xl border border-sun/40 bg-sun-soft px-4 py-3 text-sm text-sun-ink">
        <Info className="mt-0.5 size-4 shrink-0" />
        {a.disclaimer}
      </p>

      <div key={step} className="animate-page">
        {/* ── Step 1: difficulties ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="card flex flex-wrap items-center gap-4 rounded-[1.5rem]">
              <div className="flex-1">
                <p className="text-sm font-bold">{fmt(a.sectionsProgress, { done, total: SECTION_KEYS.length })}</p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={done}>
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--blush))] transition-[width] duration-500" style={{ width: `${(done / SECTION_KEYS.length) * 100}%` }} />
                </div>
              </div>
              <div className="flex gap-1.5">
                {SECTION_KEYS.map((s) => (
                  <span key={s} className={cn("grid size-8 place-items-center rounded-full transition", sectionDone(s, v.items, v.clearSections) ? "bg-mint-soft text-mint" : "bg-surface-2 text-muted")}>
                    {sectionDone(s, v.items, v.clearSections) ? <Check className="size-4" strokeWidth={3} /> : SECTION_KEYS.indexOf(s) + 1}
                  </span>
                ))}
              </div>
            </div>

            {SECTION_KEYS.map((s) => {
              const { Icon, tone, chip } = SECTION_STYLE[s];
              const count = DIFFICULTY_SECTIONS[s].filter((k) => v.items.includes(k)).length;
              const none = v.clearSections.includes(s);
              const complete = sectionDone(s, v.items, v.clearSections);
              return (
                <fieldset key={s} className={cn("overflow-hidden rounded-[1.5rem] border-2 bg-surface transition-colors", complete ? "border-primary/30" : "border-line")}>
                  <legend className="sr-only">{a.sections[s].title}</legend>
                  <div className={cn("flex flex-wrap items-center justify-between gap-3 px-5 py-4", tone)}>
                    <div className="flex items-center gap-3">
                      <span className={cn("grid size-10 place-items-center rounded-xl", chip)}>
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-extrabold">{a.sections[s].title}</h2>
                        <p className="text-xs text-muted">{a.sections[s].hint}</p>
                      </div>
                    </div>
                    {complete && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-bold text-mint">
                        <CheckCircle2 className="size-3.5" />
                        {count ? fmt(a.selectedCount, { n: count }) : a.noneObservedShort}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 p-4 sm:grid-cols-2">
                    {DIFFICULTY_SECTIONS[s].map((key) => {
                      const on = v.items.includes(key);
                      return (
                        <label
                          key={key}
                          className={cn(
                            "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition select-none has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25",
                            on ? "border-primary bg-primary-soft text-primary" : "border-line hover:border-primary/40 hover:bg-surface-2",
                          )}
                        >
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleItem(s, key)} />
                          <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg border-2 transition", on ? "border-primary bg-primary text-on-primary" : "border-muted/40 bg-surface")}>
                            {on && <Check className="size-4" strokeWidth={3.5} />}
                          </span>
                          <span dir="auto">{a.items[key]}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="border-t border-line px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted has-[:focus-visible]:text-primary">
                      <input type="checkbox" checked={none} onChange={() => toggleNone(s)} className="size-4 accent-[var(--primary)]" />
                      {a.noneObserved}
                    </label>
                  </div>
                </fieldset>
              );
            })}
          </div>
        )}

        {/* ── Step 2: summary ── */}
        {step === 1 && (
          <div className="space-y-5">
            <section className="card rounded-[1.5rem] p-6">
              <h2 className="text-xl font-extrabold">{a.summaryTitle}</h2>
              <div className="mt-3 rounded-2xl bg-surface-2 p-4 text-sm">
                <p className="font-bold">{a.summaryGuide}</p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {a.summaryGuideItems.map((g) => (
                    <li key={g} className="flex gap-2 text-muted">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <label htmlFor="summary" className="label mt-5">
                {a.summaryLabel}
              </label>
              <textarea
                id="summary"
                dir="auto"
                rows={8}
                value={v.summary}
                onChange={(e) => {
                  setV({ ...v, summary: e.target.value });
                  setStepError(null);
                }}
                placeholder={a.summaryPlaceholder}
                maxLength={5000}
                className="field min-h-48 text-base leading-relaxed"
                aria-invalid={!!serverErrors.summary}
              />
              <p className={cn("mt-1 text-end text-xs", v.summary.trim().length < 30 ? "text-muted" : "text-mint")}>{v.summary.trim().length} / 5000</p>
            </section>

            <section className="card rounded-[1.5rem] p-6">
              <p className="label">{cf.priorSupport}</p>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={cf.priorSupport}>
                {(Object.entries(cf.priorSupportOptions) as [string, string][]).map(([key, label]) => (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25",
                      v.priorSupport === key ? "border-primary bg-primary-soft text-primary" : "border-line hover:border-primary/40",
                    )}
                  >
                    <input type="radio" name="priorSupportUi" className="size-4 accent-[var(--primary)]" checked={v.priorSupport === key} onChange={() => setV({ ...v, priorSupport: key })} />
                    {label}
                  </label>
                ))}
              </div>
              {v.priorSupport && v.priorSupport !== "NONE" && (
                <div className="mt-4">
                  <label htmlFor="priorSupportDetails" className="label">
                    {cf.priorSupportDetails}
                  </label>
                  <textarea id="priorSupportDetails" dir="auto" rows={2} value={v.priorSupportDetails} onChange={(e) => setV({ ...v, priorSupportDetails: e.target.value })} className="field" />
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Step 3: consultation ── */}
        {step === 2 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold">{a.consultationTitle}</h2>
              <p className="mt-1 text-muted">{a.consultationSubtitle}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label={a.consultationTitle}>
              {CONSULTATION_MODES.map((m) => {
                const Icon = MODE_ICONS[m];
                const on = v.consultationMode === m;
                return (
                  <label
                    key={m}
                    className={cn(
                      "relative flex cursor-pointer flex-col gap-3 rounded-[1.5rem] border-2 bg-surface p-5 transition duration-300 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25",
                      on ? "border-primary shadow-[var(--shadow-float)]" : "border-line hover:-translate-y-0.5 hover:border-primary/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="consultationModeUi"
                      className="sr-only"
                      checked={on}
                      onChange={() => {
                        setV({ ...v, consultationMode: m });
                        setStepError(null);
                      }}
                    />
                    <span className={cn("grid size-12 place-items-center rounded-2xl transition", on ? "bg-primary text-on-primary" : "bg-primary-soft text-primary")}>
                      <Icon className="size-6" />
                    </span>
                    <span className="text-lg font-extrabold">{a.modes[m].title}</span>
                    <span className="text-sm text-muted">{a.modes[m].body}</span>
                    {on && (
                      <span className="absolute end-4 top-4 grid size-7 place-items-center rounded-full bg-primary text-on-primary">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="card rounded-[1.5rem]">
              <label htmlFor="consultationNote" className="label">
                {a.consultationNote}
              </label>
              <input
                id="consultationNote"
                dir="auto"
                value={v.consultationNote}
                onChange={(e) => setV({ ...v, consultationNote: e.target.value })}
                placeholder={a.consultationNotePlaceholder}
                maxLength={500}
                className="field"
              />
              <p className="mt-3 flex items-start gap-2 text-xs text-muted">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {a.noSlotNote}
              </p>
            </div>
          </section>
        )}

        {/* ── Step 4: review & submit ── */}
        {step === 3 && (
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <input type="hidden" name="id" value={id} />
            <div>
              <h2 className="text-xl font-extrabold">{a.reviewTitle}</h2>
              <p className="mt-1 text-muted">{a.reviewSubtitle}</p>
            </div>

            {Object.keys(serverErrors).length > 0 && (
              <div role="alert" className="rounded-2xl bg-coral-soft p-4 text-sm text-coral">
                <p className="flex items-center gap-2 font-bold">
                  <AlertCircle className="size-4" />
                  {a.errors.generic}
                </p>
                <ul className="mt-2 list-inside list-disc">
                  {Object.entries(serverErrors).map(([k, msg]) => (
                    <li key={k}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            {state?.message && !state.ok && <p className="rounded-2xl bg-coral-soft p-4 text-sm text-coral">{state.message}</p>}

            <ReviewBlock title={a.steps[0]} onEdit={() => go(0)} edit={a.edit}>
              <div className="grid gap-3 md:grid-cols-3">
                {SECTION_KEYS.map((s) => {
                  const picked = DIFFICULTY_SECTIONS[s].filter((k) => v.items.includes(k));
                  return (
                    <div key={s} className={cn("rounded-2xl p-4", SECTION_STYLE[s].tone)}>
                      <p className="mb-2 font-extrabold">{a.sections[s].title}</p>
                      {picked.length ? (
                        <ul className="space-y-1 text-sm">
                          {picked.map((k) => (
                            <li key={k} className="flex gap-2">
                              <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} />
                              {a.items[k]}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">{a.noneObservedShort}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </ReviewBlock>

            <ReviewBlock title={a.steps[1]} onEdit={() => go(1)} edit={a.edit}>
              <p dir="auto" className="text-sm whitespace-pre-line">
                {v.summary}
              </p>
              <p className="mt-3 text-sm">
                <span className="text-muted">{cf.priorSupport} </span>
                <strong>{cf.priorSupportOptions[v.priorSupport as keyof typeof cf.priorSupportOptions]}</strong>
                {v.priorSupportDetails ? ` — ${v.priorSupportDetails}` : ""}
              </p>
            </ReviewBlock>

            <ReviewBlock title={a.steps[2]} onEdit={() => go(2)} edit={a.edit}>
              {v.consultationMode && (
                <p className="text-sm">
                  <strong>{a.modes[v.consultationMode as keyof typeof a.modes].title}</strong>
                  {v.consultationNote ? ` — ${v.consultationNote}` : ""}
                </p>
              )}
            </ReviewBlock>

            <section className="card rounded-[1.5rem] p-6">
              <label htmlFor="documents" className="label flex items-center gap-2">
                <Paperclip className="size-4 text-primary" />
                {cf.documents}
              </label>
              <input
                id="documents"
                name="documents"
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="w-full text-sm file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary"
              />
              <p className="mt-1.5 text-xs text-muted">{cf.documentsHint}</p>
              {serverErrors.documents && <p className="field-error">{serverErrors.documents}</p>}

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 text-sm transition hover:border-primary/40">
                <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]" />
                <span>{cf.consent}</span>
              </label>
              {serverErrors.consent && <p className="field-error">{serverErrors.consent}</p>}
            </section>

            <button type="submit" disabled={submitting || saving} className="btn-primary btn-lg w-full sm:w-auto">
              {submitting ? <LoaderCircle className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
              {submitting ? a.submitting : submitted ? a.resubmit : a.submit}
            </button>
          </form>
        )}
      </div>

      {stepError && (
        <p role="alert" className="animate-fade-up mt-5 flex items-center gap-2 rounded-2xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral">
          <AlertCircle className="size-4 shrink-0" />
          {stepError}
        </p>
      )}

      {/* Footer navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="btn-ghost">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {a.back}
            </button>
          )}
          <button type="button" onClick={() => save()} disabled={saving} className="btn-ghost">
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? a.saving : a.saveDraft}
          </button>
        </div>
        <p className="text-xs text-muted" aria-live="polite">
          {saveError ? <span className="text-coral">{saveError}</span> : savedAt ? `${a.saved} · ${time(savedAt)}` : ""}
        </p>
        {step < 3 && (
          <button type="button" onClick={() => go(step + 1)} disabled={saving} className="btn-primary">
            {a.next}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewBlock({ title, edit, onEdit, children }: { title: string; edit: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="card rounded-[1.5rem] p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-extrabold">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-primary hover:underline">
          <Pencil className="size-3.5" />
          {edit}
        </button>
      </div>
      {children}
    </section>
  );
}
