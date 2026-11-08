"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit, notify, rateLimit } from "@/lib/server-utils";
import { fieldErrors, type ActionState } from "@/lib/action";
import { getI18n } from "@/lib/i18n/server";

export async function contactAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getI18n();
  const e = t.contactPage.errors;
  const keep = Object.fromEntries(["name", "email", "phone", "subject", "message"].map((k) => [k, String(formData.get(k) ?? "")]));

  const parsed = z
    .object({
      name: z.string().trim().min(2, e.name).max(80),
      email: z.string().trim().toLowerCase().email(e.email),
      phone: z
        .string()
        .trim()
        .regex(/^(0|\+213)[5-7]\d{8}$/, e.phone)
        .optional()
        .or(z.literal("")),
      subject: z.string().trim().min(3, e.subject).max(120),
      message: z.string().trim().min(20, e.message).max(4000),
    })
    .safeParse(keep);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) return { ok: false, message: e.tooMany, data: keep };

  const d = parsed.data;
  const msg = await db.contactMessage.create({ data: { name: d.name, email: d.email, phone: d.phone || null, subject: d.subject, body: d.message } });
  await audit(null, "CONTACT_MESSAGE", "ContactMessage", msg.id);

  const admins = await db.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true }, select: { id: true } });
  await Promise.all(admins.map((a) => notify(a.id, t.contactPage.adminNotifTitle, `${d.name} — ${d.subject}`, "/admin/contact")));

  return { ok: true, message: t.contactPage.success };
}
