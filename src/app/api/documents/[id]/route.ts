import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCase } from "@/lib/rbac";
import { audit } from "@/lib/server-utils";

/** Streams a case document to an authorised viewer (case owner, staff, or assigned specialist). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const doc = await db.caseDocument.findUnique({ where: { id } });
  // Same response for "missing" and "forbidden" so document ids can't be probed.
  if (!doc || !doc.data || !(await canAccessCase(user, doc.caseId))) return new NextResponse("Not found", { status: 404 });

  await audit(user.id, "DOCUMENT_VIEW", "CaseDocument", doc.id);
  const inline = doc.mimeType.startsWith("image/") || doc.mimeType === "application/pdf";
  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
