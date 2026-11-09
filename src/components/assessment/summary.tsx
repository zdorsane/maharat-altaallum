import { BookOpen, Check, Handshake, MapPin, PencilLine, SpellCheck, Video } from "lucide-react";
import { DIFFICULTY_SECTIONS, SECTION_KEYS, splitList, type SectionKey } from "@/lib/assessment";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { cn } from "@/lib/utils";

export const SECTION_STYLE: Record<SectionKey, { Icon: typeof BookOpen; tone: string; chip: string }> = {
  WRITING: { Icon: PencilLine, tone: "bg-violet-soft", chip: "bg-violet text-white dark:text-[#120e26]" },
  SPELLING: { Icon: SpellCheck, tone: "bg-sun-soft", chip: "bg-sun text-[#29204D]" },
  READING: { Icon: BookOpen, tone: "bg-primary-soft", chip: "bg-primary text-on-primary" },
};

export const MODE_ICONS = { IN_PERSON: MapPin, ONLINE: Video, DIRECT: Handshake };

type AssessmentLike = {
  items: string;
  clearSections: string;
  summary: string | null;
  priorSupport: string | null;
  priorSupportDetails: string | null;
  consultationMode: string | null;
  consultationNote: string | null;
};

/** Read-only presentation of a parent's checklist, shared by parent, team and specialist views. */
export function AssessmentSummary({ a, t, showText = true }: { a: AssessmentLike; t: Dict; showText?: boolean }) {
  const items = splitList(a.items);
  const clear = splitList(a.clearSections);
  const mode = a.consultationMode as keyof typeof MODE_ICONS | null;
  const ModeIcon = mode ? MODE_ICONS[mode] : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {SECTION_KEYS.map((s) => {
          const { Icon, tone, chip } = SECTION_STYLE[s];
          const picked = DIFFICULTY_SECTIONS[s].filter((k) => items.includes(k));
          return (
            <section key={s} className={cn("rounded-2xl p-4", tone)}>
              <h3 className="mb-3 flex items-center gap-2 font-extrabold">
                <span className={cn("grid size-7 place-items-center rounded-lg", chip)}>
                  <Icon className="size-4" />
                </span>
                {t.assessment.sections[s].title}
              </h3>
              {picked.length ? (
                <ul className="space-y-1.5 text-sm">
                  {picked.map((k) => (
                    <li key={k} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} />
                      {t.assessment.items[k]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">{clear.includes(s) ? t.assessment.noneObservedShort : "—"}</p>
              )}
            </section>
          );
        })}
      </div>

      {showText && a.summary && (
        <div>
          <p className="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{t.assessment.summaryTitle}</p>
          <p dir="auto" className="rounded-2xl border border-line p-4 text-sm whitespace-pre-line">
            {a.summary}
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {a.priorSupport && (
          <div className="rounded-2xl border border-line p-4 text-sm">
            <p className="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{t.parent.caseForm.priorSupport}</p>
            <p dir="auto">
              {t.parent.caseForm.priorSupportOptions[a.priorSupport as keyof typeof t.parent.caseForm.priorSupportOptions]}
              {a.priorSupportDetails ? ` — ${a.priorSupportDetails}` : ""}
            </p>
          </div>
        )}
        {mode && ModeIcon && (
          <div className="flex items-start gap-3 rounded-2xl border border-line p-4 text-sm">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <ModeIcon className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-wide text-muted uppercase">{t.assessment.consultationPref}</p>
              <p className="font-bold">{t.assessment.modes[mode].title}</p>
              {a.consultationNote && (
                <p dir="auto" className="mt-1 text-muted">
                  {a.consultationNote}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
