import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Coarse, edge-side gate: each protected area requires a session with an allowed role.
// Pages still call requireRole() server-side, which also re-checks the account in the DB.
const AREAS: [prefix: string, roles: string[]][] = [
  ["/admin", ["SUPER_ADMIN", "ADMIN"]],
  ["/review", ["SUPER_ADMIN", "ADMIN", "REVIEWER"]],
  ["/specialist", ["SPECIALIST"]],
  ["/parent", ["PARENT"]],
];

const HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  REVIEWER: "/review",
  SPECIALIST: "/specialist",
  PARENT: "/parent",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const area = AREAS.find(([p]) => pathname === p || pathname.startsWith(p + "/"));
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (area) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (!area[1].includes(session.role)) return NextResponse.redirect(new URL(HOME[session.role] ?? "/", req.url));
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(HOME[session.role] ?? "/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/review/:path*", "/specialist/:path*", "/parent/:path*", "/login", "/register"],
};
