import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";
import { ROLE_HOME, type Role } from "./constants";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  locale: string;
  specialistId: string | null;
  parentProfileId: string | null;
};

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function createSession(user: { id: string; role: string; sessionVersion: number }) {
  const token = await signSession({ uid: user.id, role: user.role, sv: user.sessionVersion });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Resolves the signed-in user from the session cookie, re-checking the DB on every request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const payload = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await db.user.findUnique({
    where: { id: payload.uid },
    include: { specialist: { select: { id: true } }, parentProfile: { select: { id: true } } },
  });
  // A deactivated account or a bumped sessionVersion (password reset, forced logout) invalidates the token.
  if (!user || !user.isActive || user.sessionVersion !== payload.sv) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
    locale: user.locale,
    specialistId: user.specialist?.id ?? null,
    parentProfileId: user.parentProfile?.id ?? null,
  };
});

/** Server-side guard: redirects to login, or to the user's own space when the role is not allowed. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}

export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "REVIEWER"];
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export const isStaff = (u: CurrentUser) => STAFF_ROLES.includes(u.role);
export const isAdmin = (u: CurrentUser) => ADMIN_ROLES.includes(u.role);
