import Link from "next/link";
import { ArrowRight, BookOpen, PencilLine, SpellCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { fmt } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries/ar";
import { STATUS_TONE, type CaseStatus } from "@/lib/constants";
import { sectionsWithItems, splitList } from "@/lib/assessment";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import { MODE_ICONS } from "@/components/assessment/summary";

const SECTION_ICON = { WRITING: PencilLine, SPELLING: SpellCheck, READING: BookOpen };

/** Case list shared by the review team (all cases) and specialists (assigned cases). */
export async function StaffCaseList({ where, hrefBase, t, locale, empty }: { where: Prisma.CaseWhereInput; hrefBase: string; t: Dict; locale: string; empty: string }) {
  const cases = await db.case.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { child: { select: { firstName: true } }, difficultyAssessment: { select: { items: true, consultationMode: true } } },
  });
  if (!cases.length) return <EmptyState title={empty} />;

  return (
    <ul className="reveal-stagger space-y-3">
      {cases.map((c) => {
        const sections = c.difficultyAssessment ? sectionsWithItems(splitList(c.difficultyAssessment.items)) : [];
        const mode = c.difficultyAssessment?.consultationMode as keyof typeof MODE_ICONS | null | undefined;
        const ModeIcon = mode ? MODE_ICONS[mode] : null;
        return (
          <li key={c.id} className="card card-hover spotlight rounded-[1.5rem]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`${hrefBase}/${c.id}`} className="font-mono text-lg font-extrabold after:absolute after:inset-0 hover:text-primary">
                  {c.reference}
                </Link>
                <p className="text-sm text-muted">
                  {c.child.firstName} · {fmt(t.staffCase.submittedOn, { date: formatDate(c.createdAt, locale) })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sections.map((s) => {
                  const Icon = SECTION_ICON[s];
                  return (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                      <Icon className="size-3.5" />
                      {t.assessment.sections[s].title}
                    </span>
                  );
                })}
                {mode && ModeIcon && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold">
                    <ModeIcon className="size-3.5" />
                    {t.assessment.modes[mode].title}
                  </span>
                )}
                <Badge tone={STATUS_TONE[c.status as CaseStatus]}>{t.labels.status[c.status as CaseStatus]}</Badge>
                <ArrowRight className="size-4 text-muted rtl:rotate-180" />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
