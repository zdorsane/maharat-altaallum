import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/motion";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
}
