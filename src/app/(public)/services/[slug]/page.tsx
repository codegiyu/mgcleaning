import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, CheckMark, PageIntro, ServiceIcon } from "@/components/site-ui";
import { services } from "@/content/demo-content";
import { getServiceWithDetails } from "@/content/public-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd, serviceJsonLd } from "@/lib/seo/site-seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props) {
  const service = getServiceWithDetails((await params).slug);
  if (!service) return { title: "Service not found" };
  return buildPageMetadata({ title: service.title, description: service.short, path: "/services/" + service.slug, image: service.image, imageAlt: service.title });
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = getServiceWithDetails((await params).slug);
  if (!service) notFound();
  const details = service.details;
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.title, path: "/services/" + service.slug }];
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs), serviceJsonLd({ name: service.title, description: service.description, path: "/services/" + service.slug, serviceSlug: service.slug }))} />
      <PageIntro eyebrow="M&G CLEANING SERVICES" title={service.title + ", with the details thought through."} description={service.short} />
      <div className="service-detail">
        <div className="service-detail-main">
          <span className="service-icon"><ServiceIcon kind={service.icon} className="size-7" /></span>
          <p>{service.description}</p>
          <div className="service-detail-facts"><div><span>TYPICAL DURATION</span><strong>{details?.typicalDuration ?? "To be confirmed"}</strong></div><div><span>AVAILABILITY</span><strong>Confirmed after your request</strong></div></div>
          <ServiceDetailSection title="What this service includes" items={details?.includes ?? service.bullets} />
          <ServiceDetailSection title="Suitable spaces and surfaces" items={[...(details?.suitableFor ?? []), ...(details?.surfacesOrSpaces ?? [])]} />
          <ServiceDetailSection title="How to prepare" items={details?.preparation ?? ["Share your priorities and access details before the visit."]} />
          <ServiceDetailSection title="What affects pricing" items={details?.pricingFactors ?? ["Space, scope, condition, materials, access, and timing."]} />
          <div className="service-detail-result"><h2>Expected result</h2><p>{details?.expectedResult ?? "M&G Cleaning Services will confirm the expected result with you before the service is agreed."}</p></div>
          <div className="service-detail-result"><h2>Important to know</h2><ul className="detail-list">{(details?.limitations ?? ["Final availability and inclusions are confirmed before a visit."]).map((item) => <li key={item}><CheckMark />{item}</li>)}</ul></div>
        </div>
        <aside className="service-detail-aside">
          <p className="eyebrow">LET&apos;S TALK ABOUT YOUR SPACE</p>
          <h2>Start with a few details.</h2>
          <p>Share the service or result you have in mind. We can shape the scope around your space and priorities.</p>
          <Link className="button button-dark" href={"/book?service=" + encodeURIComponent(service.title)}>Request this service <ArrowUpRight /></Link>
          <p><Link className="text-link" href="/services">Back to all services <ArrowRight /></Link></p>
        </aside>
      </div>
    </div>
  );
}

function ServiceDetailSection({ title, items }: { title: string; items: string[] }) {
  return <section className="service-detail-section"><h2>{title}</h2><ul className="detail-list">{items.map((item) => <li key={item}><CheckMark />{item}</li>)}</ul></section>;
}
