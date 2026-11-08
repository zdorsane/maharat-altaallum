import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";

export async function audit(actorId: string | null, action: string, entity: string, entityId?: string | null, meta?: Record<string, unknown>) {
  try {
    await db.auditLog.create({ data: { actorId, action, entity, entityId: entityId ?? null, meta: meta ? JSON.stringify(meta) : null } });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}

/**
 * Email transport. No provider is configured in development, so messages are logged to the
 * server console. Plug an SMTP/API provider here (e.g. Resend, Brevo) for production.
 */
export async function sendEmail(to: string, subject: string, text: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[mail] to=${to} subject="${subject}"\n${text}\n`);
    return;
  }
  // TODO(production): send through the configured provider.
}

/** In-app notification, mirrored by email. */
export async function notify(userId: string, title: string, body: string, link?: string) {
  const n = await db.notification.create({ data: { userId, title, body, link } });
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (user) await sendEmail(user.email, title, `${body}${link ? `\n\n${process.env.APP_URL ?? ""}${link}` : ""}`);
  return n;
}

// Simple in-memory fixed-window limiter. Replace with Redis when running more than one instance.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

/** One-shot toast message, read and cleared by <Toaster /> on the next page. */
export async function flash(message: string, tone: "success" | "error" | "info" = "success") {
  (await cookies()).set("mt_flash", encodeURIComponent(JSON.stringify({ message, tone })), { path: "/", maxAge: 30, sameSite: "lax" });
}
