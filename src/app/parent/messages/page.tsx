import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/parent";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { cn, formatDateTime } from "@/lib/utils";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { MessageForm } from "@/components/parent/forms";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.parent.messages.title };
}

export default async function MessagesPage() {
  const [user, { t, locale }] = await Promise.all([requireParent(), getI18n()]);
  const p = t.parent.messages;
  const messages = await db.message.findMany({
    where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
    orderBy: { createdAt: "desc" },
    include: { case: { select: { id: true, reference: true, child: { select: { firstName: true } } } }, sender: { select: { fullName: true } } },
  });

  // One thread per case (null = general), newest first.
  const threads = new Map<string, { caseId: string | null; title: string; last: (typeof messages)[number]; unread: number }>();
  for (const m of messages) {
    const key = m.caseId ?? "general";
    const th = threads.get(key) ?? {
      caseId: m.caseId,
      title: m.case ? `${fmt(p.thread, { ref: m.case.reference })} · ${m.case.child.firstName}` : p.generalThread,
      last: m,
      unread: 0,
    };
    if (m.recipientId === user.id && !m.readAt) th.unread++;
    threads.set(key, th);
  }
  const general = messages.filter((m) => !m.caseId).reverse();

  // Viewing this page marks general messages as read (case threads are marked on their own page).
  await db.message.updateMany({ where: { recipientId: user.id, caseId: null, readAt: null }, data: { readAt: new Date() } });

  return (
    <>
      <PageHeader title={p.title} subtitle={p.subtitle} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Section title={p.title}>
          {threads.size === 0 ? (
            <EmptyState title={p.empty} body={p.emptyBody} />
          ) : (
            <ul className="space-y-2">
              {[...threads.values()].map((th) => (
                <li key={th.caseId ?? "general"}>
                  <Link
                    href={th.caseId ? `/parent/cases/${th.caseId}#messages` : "#general"}
                    className={cn("flex items-start gap-3 rounded-2xl border p-4 transition hover:border-primary/40 hover:bg-surface-2", th.unread ? "border-primary/40 bg-primary-soft/40" : "border-line")}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <MessagesSquare className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-extrabold">{th.title}</span>
                        {th.unread > 0 && <span className="grid min-w-6 place-items-center rounded-full bg-coral px-1.5 text-xs leading-6 font-bold text-surface">{th.unread}</span>}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">
                        {th.last.senderId === user.id ? `${t.parent.case.you}: ` : `${th.last.sender.fullName}: `}
                        {th.last.body}
                      </span>
                      <span className="mt-1 block text-xs text-muted">{fmt(p.lastMessage, { date: formatDateTime(th.last.createdAt, locale) })}</span>
                    </span>
                    <ArrowRight className="mt-3 size-4 shrink-0 text-muted rtl:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={p.general} className="h-fit">
          <div id="general" className="space-y-3">
            <p className="text-sm text-muted">{p.generalHint}</p>
            {general.length > 0 && (
              <ul className="max-h-80 space-y-3 overflow-y-auto pe-1">
                {general.map((m) => {
                  const mine = m.senderId === user.id;
                  return (
                    <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm", mine ? "rounded-ee-md bg-primary text-on-primary" : "rounded-es-md bg-surface-2")}>
                        <p dir="auto" className="whitespace-pre-line">{m.body}</p>
                        <p className={cn("mt-1 text-[10px]", mine ? "text-on-primary/70" : "text-muted")}>{formatDateTime(m.createdAt, locale)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <MessageForm placeholder={t.parent.case.writeMessage} send={t.parent.case.send} sending={t.parent.case.sending} label={p.general} />
          </div>
        </Section>
      </div>
    </>
  );
}
