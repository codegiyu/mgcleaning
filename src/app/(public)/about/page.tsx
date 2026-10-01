import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CTASection, PageIntro } from "@/components/site-ui";
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
        <div className="about-illustration"><Image className="about-illustration-image" src="/images/generated/about-consultation-v2.png" alt="A cleaning professional assessing a client&apos;s space" width={1792} height={1024} priority /></div>
        <div className="about-copy">
          <p className="eyebrow">PROFESSIONAL CLEANING · PERSONALLY PLANNED</p>
          <h2>Your space comes first.</h2>
          <p>Whether it is a home, office, short let, specialist surface, or post-construction project, the best clean begins with a clear conversation about the result you need.</p>
          <p>We assess the space, recommend the right solution, confirm the scope with you, and make sure our Operations team understands the requirements before work begins.</p>
          <Link className="text-link" href="/services">See the service menu <ArrowRight /></Link>
        </div>
      </div>
      <section className="process-section" aria-labelledby="process-heading">
        <div className="process-heading"><p className="eyebrow">HOW WE WORK</p><h2 id="process-heading">From first conversation to final follow-up.</h2><p>Five clear steps keep the service aligned with your needs and give the team a shared understanding of the work.</p></div>
        <ol className="process-list">
          {serviceProcess.map((step, index) => <li className="process-step" key={step.title}><span className="process-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}
        </ol>
      </section>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
