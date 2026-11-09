"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, rateLimit } from "@/lib/server-utils";
import type { ActionState } from "@/lib/action";
import { fmt } from "@/lib/i18n/config";
import { getI18n, type Dict } from "@/lib/i18n/server";
import { DIFFICULTY_SECTIONS, EDITABLE_CASE_STATUSES, isDifficulty, sectionsWithItems } from "@/lib/assessment";
import { caseStaffRecipients, newCaseReference, notifyUsers, requireParent } from "@/lib/parent";

/** Plain-text version of the automatic summary, stored as the case description. */
function summaryText(t: Dict, childName: string, items: string[], notes: string) {
  const groups = sectionsWithItems(items).map((s, i) => {
    const lines = DIFFICULTY_SECTIONS[s].filter((k) => items.includes(k)).map((k) => `- ${t.assessment.items[k]}`);
    return `${t.quick.ordinals[i]} ${t.quick.cards[s].subtitle}\n${lines.join("\n")}`;
  });
  return [`${t.quick.childLabel} ${childName}`, t.quick.difficultiesLabel, ...groups, notes ? `${t.quick.notes}\n${notes}` : ""].filter(Boolean).join("\n\n");
}

/**
 * Submits (or updates) a learning-difficulty assessment: child + ticked problems + optional notes.
 * Creates the case the team and the assigned specialist work from.
 */
export async function submitQuickAssessmentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireParent();
  const { t } = await getI18n();
  const e = t.quick.errors;

  const childId = String(formData.get("childId") ?? "");
  const items = [...new Set(formData.getAll("items").map(String).filter(isDifficulty))];
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 3000);
  const assessmentId = String(formData.get("assessmentId") ?? "") || null;

  const errors: Record<string, string> = {};
  if (!childId) errors.childId = e.child;
  if (items.length === 0) errors.items = e.items;
  if (Object.keys(errors).length) return { ok: false, errors };

  // Ownership: the child must belong to this parent (no leak about other families).
  const child = await db.child.findFirst({ where: { id: childId, parentId: user.parentProfileId }, select: { id: true, firstName: true } });
  if (!child) return { ok: false, errors: { childId: e.child } };

  const itemsStr = items.join(",");
  const categories = sectionsWithItems(items).map((key) => ({ key }));
  const description = summaryText(t, child.firstName, items, notes);

  // ── Update an already-submitted assessment (allowed until the team starts reviewing). ──
  if (assessmentId) {
    const a = await db.difficultyAssessment.findFirst({
      where: { id: assessmentId, childId: child.id, status: "SUBMITTED" },
      include: { case: { select: { id: true, status: true, reference: true } } },
    });
    if (!a?.case || !EDITABLE_CASE_STATUSES.includes(a.case.status)) return { ok: false, message: e.locked };
    await db.$transaction([
      db.difficultyAssessment.update({ where: { id: a.id }, data: { items: itemsStr, clearSections: "", summary: notes || null } }),
      db.case.update({
        where: { id: a.case.id },
        data: { description, categories: { set: categories }, events: { create: { type: "ASSESSMENT_UPDATED", actorId: user.id } } },
      }),
    ]);
    await audit(user.id, "ASSESSMENT_UPDATE", "DifficultyAssessment", a.id);
    await notifyUsers(await caseStaffRecipients(a.case.id), (tt) => ({ title: tt.assessment.eventUpdated, body: a.case!.reference }), `/review/cases/${a.case.id}`);
    revalidatePath(`/parent/cases/${a.case.id}`);
    return { ok: true, data: { caseId: a.case.id, reference: a.case.reference, updated: true } };
  }

  // ── Duplicate guard: an identical submission for this child in the last 2 minutes. ──
  const duplicate = await db.difficultyAssessment.findFirst({
    where: { childId: child.id, status: "SUBMITTED", items: itemsStr, submittedAt: { gte: new Date(Date.now() - 2 * 60 * 1000) } },
    include: { case: { select: { id: true, reference: true } } },
  });
  if (duplicate?.case) return { ok: true, data: { caseId: duplicate.case.id, reference: duplicate.case.reference } };

  if (!rateLimit(`case:${user.id}`, 5, 60 * 60 * 1000)) return { ok: false, message: t.parent.caseForm.errors.tooManyRequests };

  const reference = await newCaseReference();
  const created = await db.$transaction(async (tx) => {
    const c = await tx.case.create({
      data: {
        reference,
        childId: child.id,
        description,
        // The confirmation dialog states who will see the assessment; confirming is the consent.
        consentAt: new Date(),
        categories: { connect: categories },
        events: { create: { type: "SUBMITTED", actorId: user.id, toStatus: "RECEIVED" } },
      },
    });
    await tx.difficultyAssessment.create({
      data: { childId: child.id, caseId: c.id, status: "SUBMITTED", submittedAt: new Date(), items: itemsStr, summary: notes || null },
    });
    return c;
  });

  await audit(user.id, "ASSESSMENT_SUBMIT", "Case", created.id, { reference, items: items.length });
  await notifyUsers(
    await caseStaffRecipients(null),
    (tt) => ({ title: tt.parent.notif.caseSubmittedTitle, body: fmt(tt.parent.notif.caseSubmittedBody, { ref: reference, child: child.firstName }) }),
    `/review/cases/${created.id}`,
  );
  revalidatePath("/parent");
  revalidatePath("/parent/cases");
  return { ok: true, data: { caseId: created.id, reference } };
}
