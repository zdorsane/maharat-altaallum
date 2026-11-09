"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCase } from "@/lib/rbac";
import { audit, rateLimit } from "@/lib/server-utils";
import type { ActionState } from "@/lib/action";
import { getI18n } from "@/lib/i18n/server";
import { notifyUsers } from "@/lib/parent";

/** Team member or assigned specialist replies to the parent in a case thread. */
export async function sendStaffMessageAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const { t } = await getI18n();
  const caseId = String(formData.get("caseId") ?? "");
  if (!user || user.role === "PARENT" || !(await canAccessCase(user, caseId))) return { ok: false, message: t.assessment.errors.generic };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2 || body.length > 4000) return { ok: false, errors: { body: t.parent.case.messageTooShort } };
  if (!rateLimit(`staff-msg:${user.id}`, 60, 60 * 60 * 1000)) return { ok: false, message: t.parent.caseForm.errors.tooManyRequests };

  const c = await db.case.findUniqueOrThrow({ where: { id: caseId }, select: { id: true, reference: true, child: { select: { parent: { select: { userId: true } } } } } });
  const parentUserId = c.child.parent.userId;
  await db.message.create({ data: { caseId: c.id, senderId: user.id, recipientId: parentUserId, body } });
  await db.caseEvent.create({ data: { caseId: c.id, actorId: user.id, type: "MESSAGE" } });
  await notifyUsers([parentUserId], (tt) => ({ title: tt.staffCase.parentNotifTitle, body: c.reference }), `/parent/cases/${c.id}#messages`);
  await audit(user.id, "STAFF_MESSAGE", "Case", c.id);

  revalidatePath(`/review/cases/${c.id}`);
  revalidatePath(`/specialist/cases/${c.id}`);
  return { ok: true, message: t.staffCase.sent };
}
