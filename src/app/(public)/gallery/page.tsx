import Link from "next/link";
import { ArrowRight, CTASection, PageIntro } from "@/components/site-ui";
import { DemoDisclosure } from "@/components/trust-ui";
import { contentMode, getPublicGallery } from "@/content/trust-content";
import { GalleryLightbox, type GalleryItem } from "@/components/gallery-lightbox";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }];
export const metadata = buildPageMetadata({ title: "Gallery", description: "Explore the M&G Cleaning gallery and the visual work this site is prepared to present.", path: "/gallery" });

export default function GalleryPage() {
  const galleryItems: GalleryItem[] = getPublicGallery();

  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="THE M&amp;G GALLERY" title="Clean spaces. Strong impressions." description="A visual look at the kind of people, rooms, and details the M&amp;G Cleaning Service site is designed to present. Authentic project media will replace these demo visuals before launch." />
      {contentMode === "demo" ? <DemoDisclosure>Every image below is generated demo media for layout review · It is not an MG Cleaning project or team photo.</DemoDisclosure> : null}
      {galleryItems.length ? <GalleryLightbox items={galleryItems} /> : <div className="empty-trust-state"><h2>Project media is being prepared.</h2><p>Authentic MG Cleaning work will appear here after the team confirms the images and publication permissions.</p></div>}
      <section className="gallery-booking"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Tell us what your space needs.</h2></div><Link className="text-link" href="/book">Request a cleaning <ArrowRight /></Link></section>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
