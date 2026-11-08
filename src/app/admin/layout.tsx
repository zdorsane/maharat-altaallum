import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  return (
    <AppShell user={user} area="admin">
      {children}
    </AppShell>
  );
}
