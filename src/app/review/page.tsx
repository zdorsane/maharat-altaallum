import Link from "next/link";
import { Clock, Inbox, UserCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { Badge, EmptyState, PageHeader, Section, StatCard, TextLink } from "@/components/ui";
import { STATUS_TONE, type CaseStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function ReviewHome() {
  const [user, { t, locale }] = await Promise.all([requireRole("SUPER_ADMIN", "ADMIN", "REVIEWER"), getI18n()]);
  const d = t.dash.review;
  const [received, mine, waiting, queue] = await Promise.all([
    db.case.count({ where: { status: "RECEIVED" } }),
    db.case.count({ where: { assignedReviewerId: user.id, status: { not: "CLOSED" } } }),
    db.case.count({ where: { status: "WAITING_INFO" } }),
    db.case.findMany({
      where: { status: { in: ["RECEIVED", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: { child: true, assignedReviewer: { select: { fullName: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title={d.title} subtitle={d.subtitle} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={d.stats.new} value={received} tone="coral" icon={<Inbox className="size-[18px]" />} />
        <StatCard label={d.stats.assigned} value={mine} tone="primary" icon={<UserCheck className="size-[18px]" />} />
        <StatCard label={d.stats.waiting} value={waiting} tone="sun" icon={<Clock className="size-[18px]" />} />
      </div>
      <Section title={d.queue} action={<TextLink href="/review/cases">{d.allCases}</TextLink>}>
        {queue.length === 0 ? (
          <EmptyState title={d.emptyQueue} />
        ) : (
          <ul className="divide-y divide-line">
            {queue.map((c) => (
              <li key={c.id}>
                <Link href={`/review/cases/${c.id}`} className="-mx-2 flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-surface-2">
                  <div>
                    <p className="font-semibold">
                      <span className="font-mono text-xs text-muted">{c.reference}</span> · {c.child.firstName}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(c.createdAt, locale)} · {c.assignedReviewer?.fullName ?? d.unassigned}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[c.status as CaseStatus]}>{t.labels.status[c.status as CaseStatus]}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
