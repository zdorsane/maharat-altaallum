import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function SpecialistLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("SPECIALIST");
  return (
    <AppShell user={user} area="specialist">
      {children}
    </AppShell>
  );
}
