import "server-only";
import { db } from "./db";
import { isStaff, type CurrentUser } from "./auth";

/** Can this user see a given child's records? Parents: own children. Specialists: children assigned to them. Staff: all. */
export async function canAccessChild(user: CurrentUser, childId: string) {
  if (isStaff(user)) return true;
  if (user.role === "PARENT") {
    const child = await db.child.findFirst({ where: { id: childId, parentId: user.parentProfileId ?? "-" }, select: { id: true } });
    return !!child;
  }
  if (user.role === "SPECIALIST" && user.specialistId) {
    return specialistHasChild(user.specialistId, childId);
  }
  return false;
}

export async function specialistHasChild(specialistId: string, childId: string) {
  const count = await db.child.count({ where: { id: childId, ...specialistChildWhere(specialistId) } });
  return count > 0;
}

/** Prisma filter for children a specialist is allowed to see. */
export function specialistChildWhere(specialistId: string) {
  return {
    OR: [
      { cases: { some: { assignedSpecialistId: specialistId } } },
      { appointments: { some: { specialistId } } },
      { supportPlans: { some: { specialistId } } },
    ],
  };
}

export async function canAccessCase(user: CurrentUser, caseId: string) {
  const c = await db.case.findUnique({ where: { id: caseId }, select: { assignedSpecialistId: true, child: { select: { parentId: true } } } });
  if (!c) return false;
  if (isStaff(user)) return true;
  if (user.role === "PARENT") return c.child.parentId === user.parentProfileId;
  if (user.role === "SPECIALIST") return !!user.specialistId && c.assignedSpecialistId === user.specialistId;
  return false;
}
