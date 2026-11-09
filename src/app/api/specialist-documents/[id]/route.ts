import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { audit } from "@/lib/server-utils";

/** CVs and certificates: visible only to the specialist who uploaded them and to administrators. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const doc = await db.specialistDocument.findUnique({ where: { id } });
  const allowed = doc && (isAdmin(user) || (user.specialistId !== null && user.specialistId === doc.specialistId));
  if (!doc || !allowed) return new NextResponse("Not found", { status: 404 });

  await audit(user.id, "SPECIALIST_DOCUMENT_VIEW", "SpecialistDocument", doc.id);
  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
