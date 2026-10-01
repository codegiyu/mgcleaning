import { CTASection, PageIntro, ServiceCard } from "@/components/site-ui";
import { serviceGroups, services } from "@/content/demo-content";
import { DemoDisclosure } from "@/components/trust-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }];
export const metadata = buildPageMetadata({ title: "Cleaning services", description: "Explore the M&G Cleaning Services catalogue and find the right solution for your space.", path: "/services" });

export default function ServicesPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="PROFESSIONAL CLEANING SOLUTIONS" title="Cleaning solutions for every space." description="We don’t believe in a one-size-fits-all approach. We take time to understand your space, identify what it needs, and tailor the service accordingly." />
      <p className="services-intro-support">From one-off specialist work to ongoing cleaning plans for homes and offices, explore the solution that best fits your space.</p>
      <DemoDisclosure>The service catalogue reflects the client-confirmed offer. Detailed scope, materials, timing, pricing factors, pest-control methods, and limitations remain subject to assessment and final approval.</DemoDisclosure>
      <div className="page-content service-groups">
        {serviceGroups.map((group) => {
          const groupServices = services.filter((service) => service.group === group.id);
          return (
            <section className="service-group" key={group.id} aria-labelledby={`service-group-${group.id}`}>
              <div className="service-group-heading">
                <div><p className="eyebrow">{group.eyebrow}</p><h2 id={`service-group-${group.id}`}>{group.title}</h2></div>
                <p>{group.description}</p>
              </div>
              <div className={"service-grid " + (groupServices.length === 4 ? "service-grid-balanced" : "")}>{groupServices.map((service) => <ServiceCard key={service.slug} service={service} index={services.indexOf(service)} />)}</div>
            </section>
          );
        })}
      </div>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
