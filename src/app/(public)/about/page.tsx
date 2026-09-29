import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CTASection, PageIntro } from "@/components/site-ui";
import { DemoDisclosure } from "@/components/trust-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Our approach", path: "/about" }];
export const metadata = buildPageMetadata({ title: "Our approach", description: "Learn how M&G Cleaning approaches scope, preparation, care, and follow-up.", path: "/about" });

export default function AboutPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="THE MG APPROACH" title="Good work starts with listening." description="Every space has its own rhythm. We start with what matters to you, agree the details, and give each room a thoughtful reset." />
      <div className="about-grid">
        <div className="about-illustration"><Image className="about-illustration-image" src="/images/generated/about-approach.png" alt="Generated demo image of a cleaner inspecting a cream sofa" width={1200} height={900} priority /><span className="about-image-disclosure">Generated demo image · Not an MG team photo</span></div>
        <div className="about-copy">
          <p className="eyebrow">A FRESH SPACE, YOUR WAY</p>
          <h2>Cleaning shaped around real life.</h2>
          <p>Whether it is a home, a shared workspace, or a short stay between guests, the best clean begins with a clear conversation. Tell us what the space needs and which details matter most.</p>
          <p>This demo applies the brand language from M&amp;G&apos;s upholstery flyer. Other service scope, coverage, team details, and operating policies are sample content to confirm before launch.</p>
          <Link className="text-link" href="/services">See the service menu <ArrowRight /></Link>
        </div>
      </div>
      <DemoDisclosure>Authentic team images, customer stories, service areas, operating hours, and verified business details will replace the sample material before launch.</DemoDisclosure>
      <div className="value-grid">
        <div className="value-card"><strong>Listen first</strong><p>Agree the rooms, priorities, access, and finishing details before work begins.</p></div>
        <div className="value-card"><strong>Care in the details</strong><p>Use clear scope and material-aware choices to care for the surfaces in each space.</p></div>
        <div className="value-card"><strong>Leave it ready</strong><p>Finish with a simple walk-through so the handoff is clear and the next step is easy.</p></div>
      </div>
      <section className="about-readiness-grid">
        <div><p className="eyebrow">THE STORY</p><h2>Founder story to be added.</h2><p>The production page will introduce who founded MG Cleaning, why the company started, and the work it is built to do once the team approves the story.</p></div>
        <div><p className="eyebrow">WHAT WE SPECIALIZE IN</p><h2>Cleaning shaped around the space.</h2><p>The current service menu is a review structure for upholstery, homes, offices, short lets, deep cleaning, and post-construction work. Final specialisms will come from the approved service list.</p></div>
        <div><p className="eyebrow">WHAT TO EXPECT</p><h2>Clear conversation first.</h2><p>Submit a request, share your priorities, and expect MG Cleaning to follow up with availability and pricing before a visit is confirmed.</p></div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
