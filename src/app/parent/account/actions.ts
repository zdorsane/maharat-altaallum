"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { audit, rateLimit } from "@/lib/server-utils";
import { fieldErrors, type ActionState } from "@/lib/action";
import { WILAYAS } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";
import { requireParent } from "@/lib/parent";

export async function updateAccountAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const e = t.account.errors;
  const keep = Object.fromEntries(["fullName", "phone", "wilaya"].map((k) => [k, String(formData.get(k) ?? "")]));
  const parsed = z
    .object({
      fullName: z.string().trim().min(3, e.fullName).max(80),
      phone: z
        .string()
        .trim()
        .regex(/^(0|\+213)[5-7]\d{8}$/, e.phone)
        .or(z.literal("")),
      wilaya: z.string().refine((w) => WILAYAS.some((x) => x[0] === w), e.wilaya),
    })
    .safeParse(keep);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };

  await db.user.update({
    where: { id: user.id },
    data: { fullName: parsed.data.fullName, phone: parsed.data.phone || null, parentProfile: { update: { wilaya: parsed.data.wilaya } } },
  });
  await audit(user.id, "ACCOUNT_UPDATE", "User", user.id);
  revalidatePath("/parent", "layout");
  return { ok: true, message: t.account.saved, data: keep };
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const ae = t.auth.errors;
  const parsed = z
    .object({
      currentPassword: z.string().min(1, ae.passwordRequired),
      password: z.string().min(10, ae.pwMin).regex(/[A-Za-z]/, ae.pwLatin).regex(/\d/, ae.pwDigit),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { path: ["confirm"], message: ae.mismatch })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues) };
  if (!rateLimit(`pw:${user.id}`, 5, 15 * 60 * 1000)) return { ok: false, message: ae.tooMany };

  const row = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) return { ok: false, errors: { currentPassword: t.account.errors.currentPassword } };

  // Bumping sessionVersion signs out other devices; this one gets a fresh session.
  const updated = await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password), sessionVersion: { increment: 1 } },
    select: { id: true, role: true, sessionVersion: true },
  });
  await createSession(updated);
  await audit(user.id, "PASSWORD_CHANGE", "User", user.id);
  return { ok: true, message: t.account.passwordChanged };
}
