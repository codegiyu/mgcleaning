import { SiteFooter, SiteHeader } from "@/components/site-ui";
import { ScrollRevealController } from "@/components/scroll-reveal-controller";
import { AttributionCapture } from "@/components/attribution-capture";
import { ChannelClickTracker } from "@/components/channel-click-tracker";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AttributionCapture />
      <ChannelClickTracker />
      <ScrollRevealController />
      <SiteHeader />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </>
  );
}
