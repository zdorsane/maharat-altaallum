"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, CheckCircle2, ChevronDown, FileText, LoaderCircle, Send, UserPlus } from "lucide-react";
import { submitQuickAssessmentAction } from "@/app/parent/assessment-actions";
import { DIFFICULTY_SECTIONS, SECTION_KEYS, type SectionKey } from "@/lib/assessment";
import { fmt } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { cn, initials } from "@/lib/utils";

const ICONS: Record<SectionKey, string> = { WRITING: "✍️", SPELLING: "📝", READING: "📖" };
const TONES: Record<SectionKey, { soft: string; ring: string; chip: string }> = {
  WRITING: { soft: "bg-violet-soft", ring: "ring-violet/30 border-violet", chip: "bg-violet text-white dark:text-[#120e26]" },
  SPELLING: { soft: "bg-sun-soft", ring: "ring-sun/40 border-sun", chip: "bg-sun text-[#29204D]" },
  READING: { soft: "bg-primary-soft", ring: "ring-primary/30 border-primary", chip: "bg-primary text-on-primary" },
};

// Mobile: card1, its list, card2, its list, card3, its list. Desktop: natural order, list last.
const CARD_ORDER = ["order-1 md:order-none", "order-3 md:order-none", "order-5 md:order-none"];
const PANEL_ORDER = ["order-2", "order-4", "order-6"];

type Child = { id: string; firstName: string };

export function QuickAssessmentForm({
  q,
  itemLabels,
  kids,
  initial,
}: {
  q: Dict["quick"];
  itemLabels: Dict["assessment"]["items"];
  kids: Child[];
  initial: { childId: string; items: string[]; notes: string; assessmentId?: string };
}) {
  const editing = !!initial.assessmentId;
  const [childId, setChildId] = useState(initial.childId);
  const [items, setItems] = useState<string[]>(initial.items);
  const [notes, setNotes] = useState(initial.notes);
  const [open, setOpen] = useState<SectionKey | null>(initial.items.length ? null : "WRITING");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState(submitQuickAssessmentAction, null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Server-side validation errors are shown in the same places as client ones.
  useEffect(() => {
    if (state && !state.ok) setErrors(state.errors ?? {});
  }, [state]);

  const child = kids.find((k) => k.id === childId);
  const countIn = (s: SectionKey) => DIFFICULTY_SECTIONS[s].filter((k) => items.includes(k)).length;
  const groups = SECTION_KEYS.filter((s) => countIn(s) > 0);

  function toggle(key: string) {
    setItems((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
    setErrors((e) => ({ ...e, items: "" }));
  }

  function askConfirm() {
    const e: Record<string, string> = {};
    if (!childId) e.childId = q.errors.child;
    if (items.length === 0) e.items = q.errors.items;
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(e.childId ? "choose-child" : "choose-type")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    dialogRef.current?.showModal();
  }

  function confirmSubmit() {
    dialogRef.current?.close();
    const fd = new FormData();
    fd.set("childId", childId);
    items.forEach((k) => fd.append("items", k));
    fd.set("notes", notes);
    if (initial.assessmentId) fd.set("assessmentId", initial.assessmentId);
    startTransition(() => formAction(fd));
  }

  // ── Success screen ──
  if (state?.ok) {
    const d = state.data as { caseId: string; reference: string; updated?: boolean };
    return (
      <div role="status" className="animate-fade-up card mx-auto max-w-2xl rounded-[2rem] px-6 py-12 text-center sm:px-12">
        <span className="animate-pop mx-auto grid size-20 place-items-center rounded-full bg-mint-soft text-mint">
          <CheckCircle2 className="size-10" />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">{d.updated ? q.updatedTitle : q.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted">{q.successBody}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/parent/cases/${d.caseId}`} className="btn-primary btn-lg">
            <FileText className="size-5" />
            {fmt(q.viewFile, { ref: d.reference })}
          </Link>
          {!d.updated && kids.length > 1 && (
            <Link href="/parent/cases/new" className="btn-ghost btn-lg">
              {q.another}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1 ── Child */}
      <section id="choose-child" className="card scroll-mt-28 rounded-[1.75rem] p-6">
        <h2 className="mb-4 flex items-center gap-3 text-xl font-extrabold">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-on-primary">1</span>
          {q.chooseChild}
        </h2>
        {kids.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 p-4">
            <p className="text-sm text-muted">{q.noChildren}</p>
            <Link href="/parent/children/new?next=case" className="btn-primary">
              <UserPlus className="size-4" />
              {q.addChild}
            </Link>
          </div>
        ) : (
          <div role="radiogroup" aria-label={q.chooseChild} className="flex flex-wrap gap-3">
            {kids.map((k) => {
              const on = k.id === childId;
              return (
                <label
                  key={k.id}
                  className={cn(
                    "flex min-w-40 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25",
                    on ? "border-primary bg-primary-soft" : "border-line hover:border-primary/40",
                    editing && !on && "pointer-events-none opacity-40",
                  )}
                >
                  <input
                    type="radio"
                    name="child"
                    className="sr-only"
                    checked={on}
                    disabled={editing && !on}
                    onChange={() => {
                      setChildId(k.id);
                      setErrors((e) => ({ ...e, childId: "" }));
                    }}
                  />
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl font-extrabold", on ? "bg-primary text-on-primary" : "bg-sun text-[#29204D]")}>{initials(k.firstName)}</span>
                  <span className="font-extrabold">{k.firstName}</span>
                  {on && <Check className="ms-auto size-5 text-primary" strokeWidth={3} />}
                </label>
              );
            })}
          </div>
        )}
        {errors.childId && <p className="field-error mt-3 text-sm">{errors.childId}</p>}
      </section>

      {/* 2 ── Type of difficulty + problems */}
      <section id="choose-type" className="scroll-mt-28">
        <h2 className="flex items-center gap-3 text-xl font-extrabold">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-on-primary">2</span>
          {q.typeTitle}
        </h2>
        <p className="mt-1 mb-5 text-muted">{q.typeHint}</p>

        {/* One list only: on mobile it sits right under its card (CSS order), on desktop below the row. */}
        <div className="grid gap-4 md:grid-cols-3">
          {SECTION_KEYS.map((s, idx) => {
            const n = countIn(s);
            const isOpen = open === s;
            const c = q.cards[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setOpen(isOpen ? null : s)}
                aria-expanded={isOpen}
                aria-controls={`panel-${s}`}
                className={cn(
                  CARD_ORDER[idx],
                  "group relative flex cursor-pointer flex-col items-start gap-3 rounded-[1.5rem] border-2 bg-surface p-5 text-start transition duration-300",
                  isOpen ? cn("ring-4 shadow-[var(--shadow-float)]", TONES[s].ring) : n > 0 ? "border-primary/50" : "border-line hover:-translate-y-0.5 hover:border-primary/40",
                )}
              >
                <span className={cn("grid size-14 place-items-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110", TONES[s].soft)} aria-hidden>
                  {ICONS[s]}
                </span>
                <span>
                  <span className="block text-xl font-extrabold">{c.title}</span>
                  <span className="block text-sm font-bold text-primary">{c.subtitle}</span>
                </span>
                <span className="text-sm text-muted">{c.desc}</span>
                <span className="mt-auto flex w-full items-center justify-between gap-2 pt-1">
                  {n > 0 ? (
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", TONES[s].chip)}>
                      <Check className="size-3.5" strokeWidth={3} />
                      {fmt(q.selected, { n })}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted">{q.openHint}</span>
                  )}
                  <ChevronDown className={cn("size-5 text-muted transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
                </span>
              </button>
            );
          })}

        {open && (
          <fieldset
            id={`panel-${open}`}
            key={open}
            className={cn("animate-fade-up rounded-[1.5rem] border-2 p-5 sm:p-6 md:order-last md:col-span-3", PANEL_ORDER[SECTION_KEYS.indexOf(open)], TONES[open].ring.split(" ")[1], TONES[open].soft)}
          >
            <legend className="sr-only">{fmt(q.problemsOf, { type: q.cards[open].title })}</legend>
            <p className="mb-4 flex items-center gap-2 font-extrabold">
              <span aria-hidden className="text-xl">
                {ICONS[open]}
              </span>
              {fmt(q.problemsOf, { type: q.cards[open].title })}
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {DIFFICULTY_SECTIONS[open].map((key) => {
                const on = items.includes(key);
                return (
                  <label
                    key={key}
                    className={cn(
                      "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3 text-sm font-semibold transition select-none has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25",
                      on ? "border-primary text-primary" : "border-transparent hover:border-primary/30",
                    )}
                  >
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(key)} />
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg border-2 transition", on ? "border-primary bg-primary text-on-primary" : "border-muted/40")}>
                      {on && <Check className="size-4" strokeWidth={3.5} />}
                    </span>
                    {itemLabels[key as keyof typeof itemLabels]}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
        </div>
        {errors.items && (
          <p role="alert" className="mt-3 flex items-center gap-2 text-sm font-semibold text-coral">
            <AlertCircle className="size-4" />
            {errors.items}
          </p>
        )}
      </section>

      {/* 3 ── Automatic summary */}
      <section ref={summaryRef} aria-live="polite" className="overflow-hidden rounded-[1.75rem] border-2 border-primary/20 bg-surface shadow-[var(--shadow-card)]">
        <div className="bg-[linear-gradient(135deg,var(--primary),#6d4fe0)] px-6 py-4 text-white">
          <h2 className="flex items-center gap-3 text-xl font-extrabold">
            <span className="grid size-8 place-items-center rounded-full bg-white/20 text-sm">3</span>
            {q.summaryTitle}
          </h2>
        </div>
        <div className="space-y-5 p-6">
          <p className="text-lg">
            <strong>{q.childLabel}</strong> {child ? <span className="font-extrabold text-primary">{child.firstName}</span> : <span className="text-muted">{q.noChildSelected}</span>}
          </p>
          <div>
            <p className="mb-3 font-bold">{q.difficultiesLabel}</p>
            {groups.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{q.emptySummary}</p>
            ) : (
              <ol className="space-y-4">
                {groups.map((s, i) => (
                  <li key={s} className="animate-fade-in rounded-2xl bg-surface-2 p-4">
                    <p className="mb-2 font-extrabold">
                      {q.ordinals[i]} {q.cards[s].subtitle}
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {DIFFICULTY_SECTIONS[s]
                        .filter((k) => items.includes(k))
                        .map((k) => (
                          <li key={k} className="flex gap-2">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                            {itemLabels[k as keyof typeof itemLabels]}
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <label htmlFor="notes" className="label">
              {q.notes}
            </label>
            <textarea id="notes" dir="auto" rows={4} maxLength={3000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={q.notesPlaceholder} className="field text-base" />
          </div>
        </div>
      </section>

      {state?.message && !state.ok && (
        <p role="alert" className="rounded-2xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral">
          {state.message}
        </p>
      )}

      <div className="flex justify-center">
        <button type="button" onClick={askConfirm} disabled={pending || kids.length === 0} className="btn-primary btn-lg w-full max-w-md text-lg">
          {pending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5 rtl:-scale-x-100" />}
          {pending ? q.submitting : editing ? q.update : q.submit}
        </button>
      </div>

      {/* Confirmation */}
      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-[1.75rem] border border-line bg-surface p-0 text-ink shadow-[var(--shadow-float)] backdrop:bg-[#29204D]/50 backdrop:backdrop-blur-sm open:animate-pop-in"
      >
        <div className="p-6 sm:p-7">
          <h2 id="confirm-title" className="text-xl font-extrabold">
            {q.confirmTitle}
          </h2>
          <p className="mt-3 text-muted">{q.confirmBody}</p>
          <div className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm">
            <p>
              <strong>{q.childLabel}</strong> {child?.firstName}
            </p>
            <ul className="mt-2 space-y-1">
              {groups.map((s) => (
                <li key={s}>
                  <span aria-hidden>{ICONS[s]}</span> {q.cards[s].subtitle} — {fmt(q.selected, { n: countIn(s) })}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => dialogRef.current?.close()} className="btn-ghost">
              {q.cancel}
            </button>
            <button type="button" onClick={confirmSubmit} className="btn-primary" autoFocus>
              <Send className="size-4 rtl:-scale-x-100" />
              {q.confirm}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
