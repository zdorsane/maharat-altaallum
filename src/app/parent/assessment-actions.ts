"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { audit, flash, rateLimit } from "@/lib/server-utils";
import type { ActionState } from "@/lib/action";
import { PRIOR_SUPPORT } from "@/lib/constants";
import { fmt } from "@/lib/i18n/config";
import { getI18n, type Dict } from "@/lib/i18n/server";
import {
  CONSULTATION_MODES,
  EDITABLE_CASE_STATUSES,
  SECTION_KEYS,
  isDifficulty,
  sectionDone,
  sectionsWithItems,
  splitList,
} from "@/lib/assessment";
import { caseStaffRecipients, getOwnedChild, newCaseReference, notifyUsers, readUploads, requireParent, storeDocuments } from "@/lib/parent";

export type AssessmentInput = {
  items: string[];
  clearSections: string[];
  summary: string;
  priorSupport: string;
  priorSupportDetails: string;
  consultationMode: string;
  consultationNote: string;
};

/** Loads an assessment owned by this parent (404 otherwise). */
async function ownedAssessment(parentProfileId: string, id: string) {
  const a = await db.difficultyAssessment.findFirst({
    where: { id, child: { parentId: parentProfileId } },
    include: { child: true, case: { select: { id: true, status: true, reference: true } } },
  });
  if (!a) notFound();
  return a;
}

const isEditable = (a: { status: string; case: { status: string } | null }) =>
  a.status === "DRAFT" || (a.case !== null && EDITABLE_CASE_STATUSES.includes(a.case.status));

/** Keeps only known keys and bounded text, so drafts can be saved at any stage. */
function sanitize(input: AssessmentInput) {
  const items = [...new Set(input.items.filter(isDifficulty))];
  const clearSections = [...new Set(input.clearSections.filter((s) => (SECTION_KEYS as string[]).includes(s)))]
    // "nothing observed" and ticked items are mutually exclusive within a section.
    .filter((s) => !sectionsWithItems(items).includes(s as never));
  return {
    items: items.join(","),
    clearSections: clearSections.join(","),
    summary: input.summary.trim().slice(0, 5000) || null,
    priorSupport: (PRIOR_SUPPORT as readonly string[]).includes(input.priorSupport) ? input.priorSupport : null,
    priorSupportDetails: input.priorSupportDetails.trim().slice(0, 1500) || null,
    consultationMode: (CONSULTATION_MODES as readonly string[]).includes(input.consultationMode) ? input.consultationMode : null,
    consultationNote: input.consultationNote.trim().slice(0, 500) || null,
  };
}

/** Errors that block submission, keyed by wizard field. */
function completenessErrors(a: ReturnType<typeof sanitize>, t: Dict) {
  const e: Record<string, string> = {};
  const items = splitList(a.items);
  const clear = splitList(a.clearSections);
  if (!SECTION_KEYS.every((s) => sectionDone(s, items, clear))) e.sections = t.assessment.errors.sections;
  else if (items.length === 0) e.sections = t.assessment.errors.noItem;
  if ((a.summary ?? "").length < 30) e.summary = t.assessment.errors.summary;
  if (!a.priorSupport) e.priorSupport = t.parent.caseForm.errors.priorSupport;
  if (!a.consultationMode) e.consultationMode = t.assessment.errors.mode;
  return e;
}

/** Opens the child's current draft, or creates one. */
export async function startAssessmentAction(formData: FormData) {
  const user = await requireParent();
  const child = await getOwnedChild(user.parentProfileId, String(formData.get("childId") ?? ""));
  const draft =
    (await db.difficultyAssessment.findFirst({ where: { childId: child.id, status: "DRAFT" }, orderBy: { updatedAt: "desc" }, select: { id: true } })) ??
    (await db.difficultyAssessment.create({ data: { childId: child.id }, select: { id: true } }));
  await audit(user.id, "ASSESSMENT_OPEN", "DifficultyAssessment", draft.id);
  redirect(`/parent/assessments/${draft.id}`);
}

/** Persists the wizard state (called on every step change and on "Save draft"). */
export async function saveAssessmentAction(id: string, input: AssessmentInput): Promise<{ ok: boolean; savedAt?: string; error?: string }> {
  const user = await requireParent();
  const { t } = await getI18n();
  const a = await ownedAssessment(user.parentProfileId, id);
  if (!isEditable(a)) return { ok: false, error: t.assessment.errors.locked };
  if (!rateLimit(`assess-save:${user.id}`, 120, 10 * 60 * 1000)) return { ok: false, error: t.parent.caseForm.errors.tooManyRequests };

  // While submitted, edits stay in the draft fields until the parent confirms them.
  const data = sanitize(input);
  const saved = await db.difficultyAssessment.update({ where: { id: a.id }, data, select: { updatedAt: true } });
  return { ok: true, savedAt: saved.updatedAt.toISOString() };
}

/** Final submission (or confirmation of edits to an already-submitted assessment). */
export async function submitAssessmentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const a = await ownedAssessment(user.parentProfileId, String(formData.get("id") ?? ""));
  if (!isEditable(a)) return { ok: false, message: t.assessment.errors.locked };

  const current = sanitize({
    items: splitList(a.items),
    clearSections: splitList(a.clearSections),
    summary: a.summary ?? "",
    priorSupport: a.priorSupport ?? "",
    priorSupportDetails: a.priorSupportDetails ?? "",
    consultationMode: a.consultationMode ?? "",
    consultationNote: a.consultationNote ?? "",
  });
  const errors = completenessErrors(current, t);
  if (formData.get("consent") !== "on") errors.consent = t.parent.caseForm.errors.consent;
  const uploads = await readUploads(formData);
  if ("error" in uploads) errors.documents = t.parent.caseForm.errors[uploads.error];
  if (Object.keys(errors).length) return { ok: false, errors };

  const categories = sectionsWithItems(splitList(current.items)).map((key) => ({ key }));

  // ── Edits to a submitted assessment: update the open case. ──
  if (a.status === "SUBMITTED" && a.case) {
    await db.case.update({
      where: { id: a.case.id },
      data: {
        description: current.summary!,
        priorSupport: current.priorSupport!,
        priorSupportDetails: current.priorSupportDetails,
        categories: { set: categories },
        events: { create: { type: "ASSESSMENT_UPDATED", actorId: user.id } },
      },
    });
    if ("files" in uploads && uploads.files.length) await storeDocuments(a.case.id, user.id, uploads.files);
    await audit(user.id, "ASSESSMENT_UPDATE", "DifficultyAssessment", a.id);
    await notifyUsers(await caseStaffRecipients(a.case.id), (tt) => ({ title: tt.assessment.eventUpdated, body: a.case!.reference }), `/review/cases/${a.case.id}`);
    await flash(t.assessment.updated);
    redirect(`/parent/cases/${a.case.id}`);
  }

  // ── First submission: open a case linked to the assessment. ──
  if (!rateLimit(`case:${user.id}`, 5, 60 * 60 * 1000)) return { ok: false, message: t.parent.caseForm.errors.tooManyRequests };
  const reference = await newCaseReference();
  const created = await db.$transaction(async (tx) => {
    const c = await tx.case.create({
      data: {
        reference,
        childId: a.childId,
        description: current.summary!,
        priorSupport: current.priorSupport!,
        priorSupportDetails: current.priorSupportDetails,
        consentAt: new Date(),
        categories: { connect: categories },
        events: { create: { type: "SUBMITTED", actorId: user.id, toStatus: "RECEIVED" } },
      },
    });
    await tx.difficultyAssessment.update({ where: { id: a.id }, data: { status: "SUBMITTED", submittedAt: new Date(), caseId: c.id } });
    return c;
  });
  if ("files" in uploads && uploads.files.length) await storeDocuments(created.id, user.id, uploads.files);

  await audit(user.id, "ASSESSMENT_SUBMIT", "DifficultyAssessment", a.id, { reference });
  await notifyUsers(
    await caseStaffRecipients(null),
    (tt) => ({ title: tt.parent.notif.caseSubmittedTitle, body: fmt(tt.parent.notif.caseSubmittedBody, { ref: reference, child: a.child.firstName }) }),
    `/review/cases/${created.id}`,
  );
  revalidatePath("/parent");
  await flash(fmt(t.assessment.submitted, { ref: reference }));
  redirect(`/parent/cases/${created.id}`);
}
