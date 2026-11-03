import { PageCTA, PageIntro } from "@/components/site-ui";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { getGalleryItems } from "@/lib/gallery/public-gallery";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }];
export const metadata = buildPageMetadata({ title: "Gallery", description: "Explore the M&G Cleaning gallery and the visual work this site is prepared to present.", path: "/gallery" });

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="THE M&amp;G GALLERY" title="Clean spaces. Strong impressions." description="Explore the spaces, services, and details that shape the M&amp;G approach to professional cleaning." />
      {galleryItems.length ? <GalleryLightbox items={galleryItems} /> : <div className="empty-trust-state"><h2 className="subsection-title">Project media is being prepared.</h2><p>Authentic M&amp;G Cleaning Services work will appear here after the team confirms the images and publication permissions.</p></div>}
      <PageCTA />
    </div>
  );
}
