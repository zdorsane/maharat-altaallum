import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PARENT");
  return (
    <AppShell user={user} area="parent">
      {children}
    </AppShell>
  );
}
