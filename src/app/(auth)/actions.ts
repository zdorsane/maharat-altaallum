"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { audit, flash, rateLimit, sendEmail } from "@/lib/server-utils";
import { ROLE_HOME, WILAYAS, type Role } from "@/lib/constants";
import { fieldErrors, type ActionState } from "@/lib/action";
import { fmt, isLocale } from "@/lib/i18n/config";
import { DICTS, getI18n } from "@/lib/i18n/server";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

/** Only allow same-site relative redirects into the user's own space after login. */
function safeNext(next: unknown, role: Role) {
  const home = ROLE_HOME[role];
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return home;
  return next.startsWith(home) ? next : home;
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { t, locale } = await getI18n();
  const e = t.auth.errors;
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email(e.email),
      password: z.string().min(1, e.passwordRequired),
    })
    .safeParse(Object.fromEntries(formData));
  const keep = { email: String(formData.get('email') ?? '') };
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };
  const { email, password } = parsed.data;

  if (!rateLimit(`login:${await clientIp()}:${email}`, 8)) return { ok: false, message: e.tooMany, data: keep };

  const user = await db.user.findUnique({ where: { email } });
  // Same message whether the email exists or not.
  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, message: e.badCredentials, data: keep };
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), locale } });
  await createSession(user);
  await audit(user.id, "LOGIN", "User", user.id);
  redirect(safeNext(formData.get("next"), user.role as Role));
}

function passwordRule(e: (typeof DICTS)["ar"]["auth"]["errors"]) {
  return z.string().min(10, e.pwMin).regex(/[A-Za-z]/, e.pwLatin).regex(/\d/, e.pwDigit);
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { t, locale } = await getI18n();
  const e = t.auth.errors;
  const parsed = z
    .object({
      fullName: z.string().trim().min(3, e.fullName).max(80),
      email: z.string().trim().toLowerCase().email(e.email),
      phone: z
        .string()
        .trim()
        .regex(/^(0|\+213)[5-7]\d{8}$/, e.phone)
        .optional()
        .or(z.literal("")),
      wilaya: z.string().refine((w) => WILAYAS.some((x) => x[0] === w), e.wilaya),
      password: passwordRule(e),
      confirm: z.string(),
      consent: z.literal("on", { message: e.consent }),
    })
    .refine((d) => d.password === d.confirm, { path: ["confirm"], message: e.mismatch })
    .safeParse(Object.fromEntries(formData));
  const keep = Object.fromEntries(['fullName', 'email', 'phone', 'wilaya'].map((k) => [k, String(formData.get(k) ?? '')]));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };
  const d = parsed.data;

  if (!rateLimit(`register:${await clientIp()}`, 5, 60 * 60 * 1000)) return { ok: false, message: e.tooManyLater, data: keep };
  if (await db.user.findUnique({ where: { email: d.email } })) return { ok: false, errors: { email: e.emailTaken }, data: keep };

  const user = await db.user.create({
    data: {
      email: d.email,
      fullName: d.fullName,
      phone: d.phone || null,
      role: "PARENT",
      locale,
      passwordHash: await hashPassword(d.password),
      parentProfile: { create: { wilaya: d.wilaya, consentAt: new Date() } },
    },
  });
  await audit(user.id, "REGISTER", "User", user.id);
  await createSession(user);
  await flash(t.auth.messages.welcome);
  redirect("/parent");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit(user.id, "LOGOUT", "User", user.id);
  redirect("/");
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function forgotPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getI18n();
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { ok: false, errors: { email: t.auth.errors.email } };
  const done: ActionState = { ok: true, message: t.auth.messages.forgotDone };
  if (!rateLimit(`forgot:${await clientIp()}`, 5)) return done;

  const user = await db.user.findUnique({ where: { email: email.data } });
  if (user?.isActive) {
    const token = randomBytes(32).toString("base64url");
    await db.user.update({ where: { id: user.id }, data: { resetTokenHash: hashToken(token), resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) } });
    const m = DICTS[isLocale(user.locale) ? user.locale : "ar"].auth.messages;
    await sendEmail(user.email, m.resetSubject, fmt(m.resetBody, { link: `${process.env.APP_URL ?? ""}/reset-password?token=${token}` }));
    await audit(user.id, "PASSWORD_RESET_REQUEST", "User", user.id);
  }
  return done;
}

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getI18n();
  const e = t.auth.errors;
  const parsed = z
    .object({ token: z.string().min(20), password: passwordRule(e), confirm: z.string() })
    .refine((d) => d.password === d.confirm, { path: ["confirm"], message: e.mismatch })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues) };

  const user = await db.user.findFirst({ where: { resetTokenHash: hashToken(parsed.data.token), resetTokenExpiry: { gt: new Date() } } });
  if (!user) return { ok: false, message: e.linkInvalid };

  await db.user.update({
    where: { id: user.id },
    // Bumping sessionVersion signs out every existing session.
    data: { passwordHash: await hashPassword(parsed.data.password), resetTokenHash: null, resetTokenExpiry: null, sessionVersion: { increment: 1 } },
  });
  await audit(user.id, "PASSWORD_RESET", "User", user.id);
  await flash(t.auth.messages.resetDone);
  redirect("/login");
}
