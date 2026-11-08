import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function ReviewLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "REVIEWER");
  return (
    <AppShell user={user} area="review">
      {children}
    </AppShell>
  );
}
