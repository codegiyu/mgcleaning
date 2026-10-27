import { SiteFooter, SiteHeader } from "@/components/site-ui";
import { ScrollRevealController } from "@/components/scroll-reveal-controller";
import { AttributionCapture } from "@/components/attribution-capture";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AttributionCapture />
      <ScrollRevealController />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
