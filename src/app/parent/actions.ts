"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit, flash, rateLimit } from "@/lib/server-utils";
import { fieldErrors, type ActionState } from "@/lib/action";
import { CATEGORY_KEYS, PRIOR_SUPPORT, SCHOOL_LANGUAGES, SCHOOL_LEVELS } from "@/lib/constants";
import { fmt } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { formatDateTime } from "@/lib/utils";
import { caseStaffRecipients, getOwnedCase, getOwnedChild, newCaseReference, notifyUsers, readUploads, requireParent, storeDocuments } from "@/lib/parent";

// ── Children ────────────────────────────────────────────────

async function childSchema() {
  const { t } = await getI18n();
  const e = t.parent.childForm.errors;
  const now = new Date();
  const minBirth = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  const maxBirth = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
  return z.object({
    firstName: z.string().trim().min(2, e.firstName).max(40, e.tooLong),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, e.birthDate)
      .transform((s) => new Date(`${s}T00:00:00Z`))
      .refine((d) => !Number.isNaN(d.getTime()) && d >= minBirth && d <= maxBirth, e.birthDate),
    schoolLevel: z.enum(SCHOOL_LEVELS, { message: e.schoolLevel }),
    schoolLanguage: z.enum(SCHOOL_LANGUAGES, { message: e.schoolLanguage }),
    observations: z.string().trim().max(2000, e.tooLong).optional().default(""),
    previousAssessments: z.string().trim().max(2000, e.tooLong).optional().default(""),
  });
}

const keepChild = (fd: FormData) => Object.fromEntries(["firstName", "birthDate", "schoolLevel", "schoolLanguage", "observations", "previousAssessments"].map((k) => [k, String(fd.get(k) ?? "")]));

export async function createChildAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const keep = keepChild(formData);
  const parsed = (await childSchema()).safeParse(keep);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };
  const d = parsed.data;
  const child = await db.child.create({
    data: {
      parentId: user.parentProfileId,
      firstName: d.firstName,
      birthDate: d.birthDate,
      schoolLevel: d.schoolLevel,
      schoolLanguage: d.schoolLanguage,
      observations: d.observations || null,
      previousAssessments: d.previousAssessments || null,
    },
  });
  await audit(user.id, "CHILD_CREATE", "Child", child.id);
  await flash(t.parent.childForm.created);
  redirect(formData.get("next") === "case" ? `/parent/cases/new?child=${child.id}` : `/parent/children/${child.id}`);
}

export async function updateChildAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const child = await getOwnedChild(user.parentProfileId, String(formData.get("id") ?? ""));
  const keep = keepChild(formData);
  const parsed = (await childSchema()).safeParse(keep);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };
  const d = parsed.data;
  await db.child.update({
    where: { id: child.id },
    data: {
      firstName: d.firstName,
      birthDate: d.birthDate,
      schoolLevel: d.schoolLevel,
      schoolLanguage: d.schoolLanguage,
      observations: d.observations || null,
      previousAssessments: d.previousAssessments || null,
    },
  });
  await audit(user.id, "CHILD_UPDATE", "Child", child.id);
  await flash(t.parent.childForm.updated);
  redirect(`/parent/children/${child.id}`);
}

export async function deleteChildAction(formData: FormData) {
  const user = await requireParent();
  const { t } = await getI18n();
  const child = await getOwnedChild(user.parentProfileId, String(formData.get("id") ?? ""));
  if (await db.case.count({ where: { childId: child.id } })) {
    await flash(t.parent.childForm.deleteBlocked, "error");
    redirect(`/parent/children/${child.id}`);
  }
  await db.child.delete({ where: { id: child.id } });
  await audit(user.id, "CHILD_DELETE", "Child", child.id);
  await flash(t.parent.childForm.deleted);
  redirect("/parent/children");
}

// ── Cases ───────────────────────────────────────────────────

export async function submitCaseAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const e = t.parent.caseForm.errors;
  const keep = {
    ...Object.fromEntries(["childId", "otherCategory", "description", "firstNoticed", "situations", "priorSupport", "priorSupportDetails"].map((k) => [k, String(formData.get(k) ?? "")])),
    categories: formData.getAll("categories").map(String),
  };

  const parsed = z
    .object({
      childId: z.string().min(1, e.child),
      categories: z.array(z.enum(CATEGORY_KEYS)).min(1, e.areas),
      otherCategory: z.string().trim().max(120),
      description: z.string().trim().min(30, e.description).max(4000),
      firstNoticed: z.string().trim().min(2, e.firstNoticed).max(300),
      situations: z.string().trim().min(2, e.situations).max(1500),
      priorSupport: z.enum(PRIOR_SUPPORT, { message: e.priorSupport }),
      priorSupportDetails: z.string().trim().max(1500),
    })
    .refine((d) => !d.categories.includes("OTHER") || d.otherCategory.length >= 2, { path: ["otherCategory"], message: e.otherArea })
    .safeParse(keep);

  const errors = parsed.success ? {} : fieldErrors(parsed.error.issues);
  if (formData.get("consent") !== "on") errors.consent = e.consent;
  const uploads = await readUploads(formData);
  if ("error" in uploads) errors.documents = e[uploads.error];
  if (!parsed.success || Object.keys(errors).length) return { ok: false, errors, data: keep };

  if (!rateLimit(`case:${user.id}`, 5, 60 * 60 * 1000)) return { ok: false, message: e.tooManyRequests, data: keep };

  const d = parsed.data;
  const child = await getOwnedChild(user.parentProfileId, d.childId);
  const reference = await newCaseReference();
  const created = await db.case.create({
    data: {
      reference,
      childId: child.id,
      description: d.description,
      otherCategory: d.categories.includes("OTHER") ? d.otherCategory : null,
      firstNoticed: d.firstNoticed,
      situations: d.situations,
      priorSupport: d.priorSupport,
      priorSupportDetails: d.priorSupportDetails || null,
      consentAt: new Date(),
      categories: { connect: d.categories.map((key) => ({ key })) },
      events: { create: { type: "SUBMITTED", actorId: user.id, toStatus: "RECEIVED" } },
    },
  });
  if ("files" in uploads && uploads.files.length) await storeDocuments(created.id, user.id, uploads.files);

  await audit(user.id, "CASE_SUBMIT", "Case", created.id, { reference });
  await notifyUsers(
    await caseStaffRecipients(null),
    (tt) => ({ title: tt.parent.notif.caseSubmittedTitle, body: fmt(tt.parent.notif.caseSubmittedBody, { ref: reference, child: child.firstName }) }),
    `/review/cases/${created.id}`,
  );
  await flash(fmt(t.parent.caseForm.submitted, { ref: reference }));
  redirect(`/parent/cases/${created.id}`);
}

export async function uploadCaseDocumentsAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const c = await getOwnedCase(user.parentProfileId, String(formData.get("caseId") ?? ""));
  const uploads = await readUploads(formData);
  if ("error" in uploads) return { ok: false, errors: { documents: t.parent.caseForm.errors[uploads.error] } };
  if (!uploads.files.length) return { ok: false, errors: { documents: t.parent.caseForm.errors.fileType } };

  await storeDocuments(c.id, user.id, uploads.files);
  await db.caseEvent.create({ data: { caseId: c.id, actorId: user.id, type: "DOCUMENT" } });
  await audit(user.id, "CASE_DOCUMENTS", "Case", c.id, { count: uploads.files.length });
  await notifyUsers(await caseStaffRecipients(c.id), (tt) => ({ title: tt.parent.notif.docsTitle, body: c.reference }), `/review/cases/${c.id}`);
  revalidatePath(`/parent/cases/${c.id}`);
  return { ok: true, message: t.parent.case.uploaded };
}

// ── Messages ────────────────────────────────────────────────

export async function sendMessageAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2 || body.length > 4000) return { ok: false, errors: { body: t.parent.case.messageTooShort } };
  if (!rateLimit(`msg:${user.id}`, 30, 60 * 60 * 1000)) return { ok: false, message: t.parent.caseForm.errors.tooManyRequests };

  const caseId = String(formData.get("caseId") ?? "") || null;
  const c = caseId ? await getOwnedCase(user.parentProfileId, caseId) : null;

  // Reply to whoever last wrote to the parent in this thread; otherwise the case's staff.
  const lastIncoming = await db.message.findFirst({
    where: { recipientId: user.id, caseId: c?.id ?? null },
    orderBy: { createdAt: "desc" },
    select: { senderId: true },
  });
  const recipients = lastIncoming ? [lastIncoming.senderId] : await caseStaffRecipients(c?.id ?? null);
  if (!recipients.length) return { ok: false, message: t.parent.caseForm.errors.tooManyRequests };

  await db.message.createMany({ data: recipients.map((recipientId) => ({ caseId: c?.id ?? null, senderId: user.id, recipientId, body })) });

  if (c) {
    await db.caseEvent.create({ data: { caseId: c.id, actorId: user.id, type: "MESSAGE", visibleToParent: false } });
    // A parent answering an information request sends the file back for review.
    if (c.status === "WAITING_INFO") {
      await db.case.update({ where: { id: c.id }, data: { status: "UNDER_REVIEW" } });
      await db.caseEvent.create({ data: { caseId: c.id, actorId: user.id, type: "STATUS", fromStatus: "WAITING_INFO", toStatus: "UNDER_REVIEW" } });
    }
  }
  const preview = body.length > 80 ? `${body.slice(0, 80)}…` : body;
  await notifyUsers(
    recipients,
    (tt) => ({
      title: c?.status === "WAITING_INFO" ? tt.parent.notif.infoProvidedTitle : tt.parent.notif.parentMessageTitle,
      body: fmt(tt.parent.notif.parentMessageBody, { name: user.fullName, preview }),
    }),
    c ? `/review/cases/${c.id}` : "/review/messages",
  );
  await audit(user.id, "MESSAGE_SEND", "Message", c?.id ?? null);
  revalidatePath(c ? `/parent/cases/${c.id}` : "/parent/messages");
  revalidatePath("/parent/messages");
  return { ok: true, message: t.parent.case.sent };
}

// ── Appointments ────────────────────────────────────────────

async function ownedAppointment(parentProfileId: string, id: string) {
  return db.appointment.findFirst({
    where: { id, child: { parentId: parentProfileId } },
    include: { child: true, specialist: { select: { userId: true } } },
  });
}

export async function respondAppointmentAction(formData: FormData) {
  const user = await requireParent();
  const { t } = await getI18n();
  const a = await ownedAppointment(user.parentProfileId, String(formData.get("id") ?? ""));
  const decision = formData.get("decision");
  const future = a && a.scheduledAt > new Date();
  const allowed =
    a && future && ((decision === "confirm" && a.status === "PROPOSED") || (decision === "cancel" && (a.status === "PROPOSED" || a.status === "CONFIRMED")));
  if (!a || !allowed) {
    await flash(t.parent.appointments.notAllowed, "error");
    redirect("/parent/appointments");
  }

  const status = decision === "confirm" ? "CONFIRMED" : "CANCELLED";
  await db.appointment.update({ where: { id: a.id }, data: { status } });
  if (a.caseId) {
    await db.caseEvent.create({ data: { caseId: a.caseId, actorId: user.id, type: "APPOINTMENT", message: status } });
  }
  await audit(user.id, `APPOINTMENT_${status}`, "Appointment", a.id);
  await notifyUsers(
    [a.specialist.userId, a.createdById].filter((x): x is string => !!x),
    (tt, recipientLocale) => ({
      title: status === "CONFIRMED" ? tt.parent.notif.apptConfirmedTitle : tt.parent.notif.apptCancelledTitle,
      body: fmt(tt.parent.notif.apptBody, { child: a.child.firstName, date: formatDateTime(a.scheduledAt, recipientLocale) }),
    }),
    "/specialist/appointments",
  );
  await flash(status === "CONFIRMED" ? t.parent.appointments.confirmed : t.parent.appointments.cancelled);
  redirect("/parent/appointments");
}
