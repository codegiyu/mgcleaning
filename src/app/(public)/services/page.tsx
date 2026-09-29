import { CTASection, PageIntro, ServiceCard } from "@/components/site-ui";
import { services } from "@/content/demo-content";
import { DemoDisclosure } from "@/components/trust-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }];
export const metadata = buildPageMetadata({ title: "Cleaning services", description: "Explore the M&G Cleaning service menu and find the right starting point for your space.", path: "/services" });

export default function ServicesPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="THE SERVICE MENU · DEMO" title="A clean that fits your space." description="Choose a regular reset, a one-off detail clean, or help preparing a workspace or short stay. The service descriptions below are sample content for review." />
      <DemoDisclosure>Service categories and detail copy are structured for review. MG Cleaning must confirm the final offering, materials, timing, pricing factors, and limitations before launch.</DemoDisclosure>
      <div className="page-content">
        <div className="service-grid">{services.map((service, index) => <ServiceCard key={service.slug} service={service} index={index} />)}</div>
      </div>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
