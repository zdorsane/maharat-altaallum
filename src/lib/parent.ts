import "server-only";
import { randomBytes } from "node:crypto";
import { notFound } from "next/navigation";
import { db } from "./db";
import { requireRole, type CurrentUser } from "./auth";
import { notify } from "./server-utils";
import { DICTS } from "./i18n/server";
import { isLocale, type Locale } from "./i18n/config";
import type { Dict } from "./i18n/dictionaries/ar";

/** Signed-in parent with a profile (every parent account has one). */
export async function requireParent(): Promise<CurrentUser & { parentProfileId: string }> {
  const user = await requireRole("PARENT");
  if (!user.parentProfileId) notFound();
  return user as CurrentUser & { parentProfileId: string };
}

/** A child owned by this parent, or 404 — never leaks other families' records. */
export async function getOwnedChild(parentProfileId: string, childId: string) {
  const child = await db.child.findFirst({ where: { id: childId, parentId: parentProfileId } });
  if (!child) notFound();
  return child;
}

export async function getOwnedCase(parentProfileId: string, caseId: string) {
  const c = await db.case.findFirst({ where: { id: caseId, child: { parentId: parentProfileId } }, include: { child: true } });
  if (!c) notFound();
  return c;
}

// ── Documents ───────────────────────────────────────────────

export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

/** Detects the real file type from its first bytes (the browser-supplied type is not trusted). */
function sniff(buf: Buffer): string | null {
  if (buf.subarray(0, 4).toString("latin1") === "%PDF") return "application/pdf";
  if (buf[0] === 0x89 && buf.subarray(1, 4).toString("latin1") === "PNG") return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}

export type ValidFile = { name: string; mime: string; data: Buffer };

/** Validates uploaded files; returns an error key from caseForm.errors or the files. */
export async function readUploads(formData: FormData, field = "documents"): Promise<{ error: "tooMany" | "fileSize" | "fileType" } | { files: ValidFile[] }> {
  const raw = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  if (raw.length > MAX_FILES) return { error: "tooMany" };
  const files: ValidFile[] = [];
  for (const f of raw) {
    if (f.size > MAX_FILE_BYTES) return { error: "fileSize" };
    const data = Buffer.from(await f.arrayBuffer());
    const mime = sniff(data);
    if (!mime) return { error: "fileType" };
    files.push({ name: f.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120) || "document", mime, data });
  }
  return { files };
}

export function storeDocuments(caseId: string, uploadedById: string, files: ValidFile[]) {
  return db.caseDocument.createMany({
    data: files.map((f) => ({
      caseId,
      uploadedById,
      fileName: f.name,
      storedName: randomBytes(16).toString("hex"),
      mimeType: f.mime,
      size: f.data.length,
      data: new Uint8Array(f.data),
    })),
  });
}

// ── References & recipients ─────────────────────────────────

/** Human-friendly unique case reference, e.g. AFQ-2026-7K3P9. */
export async function newCaseReference() {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  for (let attempt = 0; attempt < 5; attempt++) {
    const bytes = randomBytes(5);
    const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    const ref = `AFQ-${new Date().getFullYear()}-${code}`;
    if (!(await db.case.findUnique({ where: { reference: ref }, select: { id: true } }))) return ref;
  }
  throw new Error("Could not allocate a case reference");
}

/** Staff who should hear about a case: its reviewer, else every active reviewer/admin. */
export async function caseStaffRecipients(caseId: string | null) {
  if (caseId) {
    const c = await db.case.findUnique({ where: { id: caseId }, select: { assignedReviewerId: true, assignedSpecialist: { select: { userId: true } } } });
    const ids = [c?.assignedReviewerId, c?.assignedSpecialist?.userId].filter((x): x is string => !!x);
    if (ids.length) return ids;
  }
  const staff = await db.user.findMany({ where: { role: { in: ["REVIEWER", "ADMIN", "SUPER_ADMIN"] }, isActive: true }, select: { id: true } });
  return staff.map((s) => s.id);
}

/** Sends one notification per user, written in that user's own language. */
export async function notifyUsers(userIds: string[], build: (t: Dict, locale: Locale) => { title: string; body: string }, link?: string) {
  if (!userIds.length) return;
  const users = await db.user.findMany({ where: { id: { in: [...new Set(userIds)] } }, select: { id: true, locale: true } });
  await Promise.all(
    users.map((u) => {
      const locale: Locale = isLocale(u.locale) ? u.locale : "ar";
      const { title, body } = build(DICTS[locale], locale);
      return notify(u.id, title, body, link);
    }),
  );
}

/** Maps a case status onto the four stages shown to parents (index), or -1 when closed. */
export function caseStage(status: string) {
  switch (status) {
    case "RECEIVED":
      return 0;
    case "UNDER_REVIEW":
    case "WAITING_INFO":
      return 1;
    case "ASSESSMENT_RECOMMENDED":
    case "APPOINTMENT_SET":
    case "REFERRED":
      return 2;
    case "FOLLOW_UP":
      return 3;
    default:
      return -1;
  }
}
