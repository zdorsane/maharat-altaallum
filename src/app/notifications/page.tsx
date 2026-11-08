import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Bell, CheckCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { areaOf } from "@/lib/nav";
import { formatDateTime } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader } from "@/components/ui";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.common.notifications };
}

async function markAllRead() {
  "use server";
  const user = await requireRole();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}

export default async function NotificationsPage() {
  const [user, { t, locale }] = await Promise.all([requireRole(), getI18n()]);
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <AppShell user={user} area={areaOf(user.role)}>
      <PageHeader
        title={t.common.notifications}
        actions={
          items.some((n) => !n.readAt) && (
            <form action={markAllRead}>
              <button className="btn-ghost">
                <CheckCheck className="size-4" />
                {t.common.markAllRead}
              </button>
            </form>
          )
        }
      />
      {items.length === 0 ? (
        <EmptyState title={t.common.noNotifications} />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id} className={`card flex gap-4 ${n.readAt ? "" : "border-primary/40 bg-primary-soft/40"}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${n.readAt ? "bg-surface-2 text-muted" : "bg-primary text-on-primary"}`}>
                <Bell className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">{n.title}</p>
                  <span className="text-xs text-muted">{formatDateTime(n.createdAt, locale)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{n.body}</p>
                {n.link && (
                  <Link href={n.link} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                    {t.common.open}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
