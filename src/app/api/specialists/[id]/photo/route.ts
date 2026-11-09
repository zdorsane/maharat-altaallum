import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

/** Specialist photo: public for published profiles; otherwise only the owner and the team. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await db.specialist.findUnique({ where: { id }, select: { photo: true, photoMime: true, isPublic: true, isDemo: true } });
  if (!s?.photo || !s.photoMime) return new NextResponse("Not found", { status: 404 });

  const published = s.isPublic && !s.isDemo;
  if (!published) {
    const user = await getCurrentUser();
    if (!user || !(isStaff(user) || user.specialistId === id)) return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(new Uint8Array(s.photo), {
    headers: {
      "Content-Type": s.photoMime,
      "Cache-Control": published ? "public, max-age=3600" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
