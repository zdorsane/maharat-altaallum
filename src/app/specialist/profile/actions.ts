"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/server-utils";
import { fieldErrors, type ActionState } from "@/lib/action";
import { SPECIALIZATION_KEYS, WILAYAS } from "@/lib/constants";
import { CONSULTATION_MODES, SPECIALIST_DOC_KINDS } from "@/lib/assessment";
import { getI18n } from "@/lib/i18n/server";
import { MAX_FILE_BYTES, readUploads } from "@/lib/parent";

const LANGS = ["ar", "fr", "en", "tz"] as const;

/** The signed-in specialist's profile row, created on first use for accounts without one. */
async function mySpecialist() {
  const user = await requireRole("SPECIALIST");
  if (user.specialistId) return { user, specialistId: user.specialistId };
  const created = await db.specialist.create({
    data: {
      userId: user.id,
      displayName: user.fullName,
      title: "",
      specialization: "ORTHOPHONIST",
      bio: "",
      yearsExperience: 0,
      wilaya: "16",
      languages: "ar",
      services: "",
      availability: "",
      isPublic: false,
    },
    select: { id: true },
  });
  return { user, specialistId: created.id };
}

export async function updateSpecialistProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { user, specialistId } = await mySpecialist();
  const { t } = await getI18n();
  const e = t.specProfile.errors;
  const keep = {
    ...Object.fromEntries(
      ["displayName", "title", "specialization", "yearsExperience", "wilaya", "bio", "services", "availability", "contactEmail", "contactPhone"].map((k) => [k, String(formData.get(k) ?? "")]),
    ),
    languages: formData.getAll("languages").map(String),
    consultationModes: formData.getAll("consultationModes").map(String),
  };
  const parsed = z
    .object({
      displayName: z.string().trim().min(3, e.displayName).max(80),
      title: z.string().trim().min(2, e.jobTitle).max(100),
      specialization: z.enum(SPECIALIZATION_KEYS, { message: e.specialization }),
      yearsExperience: z.coerce.number({ message: e.years }).int(e.years).min(0, e.years).max(60, e.years),
      wilaya: z.string().refine((w) => WILAYAS.some((x) => x[0] === w), e.wilaya),
      bio: z.string().trim().min(40, e.bio).max(3000, e.tooLong),
      languages: z.array(z.enum(LANGS)).min(1, e.languages),
      services: z.string().trim().max(2000, e.tooLong),
      consultationModes: z.array(z.enum(CONSULTATION_MODES)).min(1, e.modes),
      availability: z.string().trim().max(1000, e.tooLong),
      contactEmail: z.string().trim().toLowerCase().email(e.email).or(z.literal("")),
      contactPhone: z
        .string()
        .trim()
        .regex(/^(0|\+213)[2-7]\d{7,8}$/, e.phone)
        .or(z.literal("")),
    })
    .safeParse(keep);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };
  const d = parsed.data;

  // isPublic / isDemo stay under administrator control.
  await db.specialist.update({
    where: { id: specialistId },
    data: {
      displayName: d.displayName,
      title: d.title,
      specialization: d.specialization,
      yearsExperience: d.yearsExperience,
      wilaya: d.wilaya,
      bio: d.bio,
      languages: d.languages.join(","),
      services: d.services,
      consultationModes: d.consultationModes.join(","),
      availability: d.availability,
      contactEmail: d.contactEmail || null,
      contactPhone: d.contactPhone || null,
    },
  });
  await audit(user.id, "SPECIALIST_PROFILE_UPDATE", "Specialist", specialistId);
  revalidatePath("/specialist/profile");
  return { ok: true, message: t.specProfile.saved, data: keep };
}

const PHOTO_MAX = 1024 * 1024;

export async function uploadPhotoAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { user, specialistId } = await mySpecialist();
  const { t } = await getI18n();
  const e = t.specProfile.errors;
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, errors: { photo: e.noFile } };
  if (file.size > PHOTO_MAX) return { ok: false, errors: { photo: e.photoSize } };
  const uploads = await readUploads(formData, "photo");
  if ("error" in uploads || !uploads.files[0] || uploads.files[0].mime === "application/pdf") return { ok: false, errors: { photo: e.photoType } };
  const f = uploads.files[0];
  await db.specialist.update({ where: { id: specialistId }, data: { photo: new Uint8Array(f.data), photoMime: f.mime, photoUrl: `/api/specialists/${specialistId}/photo?v=${randomBytes(4).toString("hex")}` } });
  await audit(user.id, "SPECIALIST_PHOTO", "Specialist", specialistId);
  revalidatePath("/specialist/profile");
  return { ok: true, message: t.specProfile.photoSaved };
}

export async function removePhotoAction() {
  const { user, specialistId } = await mySpecialist();
  await db.specialist.update({ where: { id: specialistId }, data: { photo: null, photoMime: null, photoUrl: null } });
  await audit(user.id, "SPECIALIST_PHOTO_REMOVE", "Specialist", specialistId);
  revalidatePath("/specialist/profile");
}

export async function addQualificationAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { user, specialistId } = await mySpecialist();
  const { t } = await getI18n();
  const e = t.specProfile.errors;
  const keep = Object.fromEntries(["qualTitle", "qualInstitution", "qualYear"].map((k) => [k, String(formData.get(k) ?? "")]));
  const maxYear = new Date().getFullYear();
  const parsed = z
    .object({
      qualTitle: z.string().trim().min(2, e.qualTitle).max(150),
      qualInstitution: z.string().trim().min(2, e.qualInstitution).max(150),
      qualYear: z
        .string()
        .trim()
        .refine((y) => y === "" || (/^\d{4}$/.test(y) && +y >= 1960 && +y <= maxYear), e.qualYear),
    })
    .safeParse(keep);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), data: keep };
  await db.specialistQualification.create({
    data: { specialistId, title: parsed.data.qualTitle, institution: parsed.data.qualInstitution, year: parsed.data.qualYear ? +parsed.data.qualYear : null },
  });
  await audit(user.id, "SPECIALIST_QUALIFICATION_ADD", "Specialist", specialistId);
  revalidatePath("/specialist/profile");
  return { ok: true };
}

export async function removeQualificationAction(formData: FormData) {
  const { user, specialistId } = await mySpecialist();
  await db.specialistQualification.deleteMany({ where: { id: String(formData.get("id") ?? ""), specialistId } });
  await audit(user.id, "SPECIALIST_QUALIFICATION_REMOVE", "Specialist", specialistId);
  revalidatePath("/specialist/profile");
}

export async function uploadSpecialistDocumentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { user, specialistId } = await mySpecialist();
  const { t } = await getI18n();
  const e = t.specProfile.errors;
  const kind = String(formData.get("kind") ?? "");
  if (!(SPECIALIST_DOC_KINDS as readonly string[]).includes(kind)) return { ok: false, errors: { kind: e.fileType } };
  const raw = formData.get("document");
  if (!(raw instanceof File) || raw.size === 0) return { ok: false, errors: { document: e.noFile } };
  if (raw.size > MAX_FILE_BYTES) return { ok: false, errors: { document: e.fileSize } };
  const uploads = await readUploads(formData, "document");
  if ("error" in uploads || !uploads.files[0]) return { ok: false, errors: { document: e.fileType } };
  const f = uploads.files[0];
  await db.specialistDocument.create({ data: { specialistId, kind, fileName: f.name, mimeType: f.mime, size: f.data.length, data: new Uint8Array(f.data) } });
  await audit(user.id, "SPECIALIST_DOCUMENT_UPLOAD", "Specialist", specialistId, { kind });
  revalidatePath("/specialist/profile");
  return { ok: true, message: t.specProfile.uploaded };
}

export async function deleteSpecialistDocumentAction(formData: FormData) {
  const { user, specialistId } = await mySpecialist();
  await db.specialistDocument.deleteMany({ where: { id: String(formData.get("id") ?? ""), specialistId } });
  await audit(user.id, "SPECIALIST_DOCUMENT_DELETE", "Specialist", specialistId);
  revalidatePath("/specialist/profile");
}
