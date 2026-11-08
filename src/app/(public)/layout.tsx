import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/motion";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="scroll-progress" aria-hidden />
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
}
