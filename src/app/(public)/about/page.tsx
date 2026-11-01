import Image from "next/image";
import { InfoCard, PageCTA, PageIntro, SectionHeading, sequenceLabel } from "@/components/site-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";
import { serviceProcess } from "@/content/demo-content";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Our approach", path: "/about" }];
export const metadata = buildPageMetadata({ title: "Our approach", description: "See how M&G Cleaning Services listens, assesses, confirms the scope, delivers, and follows up within 24 hours.", path: "/about" });

export default function AboutPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="THE M&G APPROACH" title="Clear steps. Thoughtful service." description="A professional clean starts before our team arrives. We listen, assess, confirm the scope, deliver, and follow up." />
      <div className="about-grid">
        <div className="about-illustration"><Image className="about-illustration-image" src="/images/generated/about-consultation-v2.webp" alt="A cleaning professional assessing a client&apos;s space" width={1792} height={1024} priority /></div>
        <SectionHeading
          className="about-copy"
          layout="stacked"
          eyebrow="PROFESSIONAL CLEANING · PERSONALLY PLANNED"
          title="Your space comes first."
          description={[
            "Whether it is a home, office, short let, specialist surface, or post-construction project, the best clean begins with a clear conversation about the result you need.",
            "We assess the space, recommend the right solution, confirm the scope with you, and make sure our Operations team understands the requirements before work begins.",
          ]}
          action={{ href: "/services", label: "See the service menu" }}
        />
      </div>
      <section className="process-section" aria-labelledby="process-heading">
        <SectionHeading
          className="process-heading"
          layout="stacked"
          id="process-heading"
          eyebrow="HOW WE WORK"
          title="From first conversation to final follow-up."
          description="Five clear steps keep the service aligned with your needs and give the team a shared understanding of the work."
        />
        <ol className="process-list">
          {serviceProcess.map((step, index) => <InfoCard key={step.title} element="li" variant="row" label={sequenceLabel(index)} title={step.title}>{step.description}</InfoCard>)}
        </ol>
      </section>
      <PageCTA />
    </div>
  );
}
