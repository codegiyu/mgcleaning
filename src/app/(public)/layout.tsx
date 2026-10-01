import { SiteFooter, SiteHeader } from "@/components/site-ui";
import { ScrollRevealController } from "@/components/scroll-reveal-controller";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollRevealController />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
