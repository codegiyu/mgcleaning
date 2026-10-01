import Link from "next/link";
import Image from "next/image";
import { demoSite, type DemoArticle, type DemoService, type ServiceIconName } from "@/content/demo-content";
import { MobileSiteNav } from "@/components/mobile-site-nav";

export function ServiceIcon({ kind, className = "size-6" }: { kind: ServiceIconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (kind === "home") {
    return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>;
  }
  if (kind === "office") {
    return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2m-5 6v-3h2v3" /></svg>;
  }
  if (kind === "key") {
    return <svg {...common}><circle cx="8" cy="15" r="5" /><path d="m11.5 11.5 8-8L22 6l-2 2 1.5 1.5-2 2L18 10l-3 3" /><path d="M8 15h.01" /></svg>;
  }
  if (kind === "calendar") {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /><path d="m8 15 2 2 5-5" /></svg>;
  }
  if (kind === "sofa") {
    return <svg {...common}><path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" /><path d="M4 12a2 2 0 0 0-2 2v4h20v-4a2 2 0 0 0-2-2H4Z" /><path d="M5 18v3m14-3v3M4 12v-2m16 2v-2M8 11h8" /></svg>;
  }
  if (kind === "building") {
    return <svg {...common}><path d="M4 21V5l8-3v19m0-13h8v13M2 21h20" /><path d="M7 7h2m-2 4h2m-2 4h2m7-1h2m-2 4h2" /></svg>;
  }
  if (kind === "shield") {
    return <svg {...common}><path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
  }
  if (kind === "tile") {
    return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18M3 12h18" /><path d="m17 5 .6 1.4L19 7l-1.4.6L17 9l-.6-1.4L15 7l1.4-.6L17 5Z" /></svg>;
  }
  return <svg {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></svg>;
}

export function ArrowUpRight({ className = "size-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ArrowRight({ className = "size-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function CheckMark({ className = "size-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>;
}

export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.2-4.2A8.5 8.5 0 1 1 20.5 11.5Z" stroke="currentColor" strokeWidth="1.7" /><path d="M8.2 8.1c.2-.4.4-.4.8-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.5 1.9 2.6 2.5l.6-.5c.2-.2.4-.2.7-.1l1.5.6c.3.1.4.3.4.6v.5c0 .4 0 .6-.4.8-.4.2-1 .3-1.4.1-2.6-.7-4.6-2.6-5.8-5.1-.2-.5-.1-1 .1-1.7Z" fill="currentColor" /></svg>;
}

export function PhoneIcon({ className = "size-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.7 3.8 9.3 3c.6-.2 1.2.1 1.5.7l1.2 2.8c.2.5.1 1-.3 1.4l-1.4 1.1a13.5 13.5 0 0 0 4.7 4.7l1.1-1.4c.3-.4.9-.5 1.4-.3l2.8 1.2c.6.3.9.9.7 1.5l-.8 2.6c-.2.7-.9 1.2-1.6 1.2C10.4 18.5 5.5 13.6 5.5 5.4c0-.7.5-1.4 1.2-1.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>;
}

export function RoomIllustration() {
  return (
    <svg viewBox="0 0 620 520" className="h-full w-full" role="img" aria-label="Illustration of a bright, freshly cleaned living room">
      <rect width="620" height="520" rx="36" fill="#E9EDF4" />
      <circle cx="473" cy="107" r="91" fill="#F5E7A8" />
      <path d="M0 375c103-37 195-34 281-3 94 34 211 29 339-11v159H0V375Z" fill="#E1D8C8" />
      <path d="M72 77h203v179H72z" fill="#F8F7F0" />
      <path d="M85 91h177v151H85z" fill="#C5D8C4" />
      <path d="M173 91v151M85 165h177" stroke="#F8F7F0" strokeWidth="10" />
      <path d="M43 254h259" stroke="#C2B9A7" strokeWidth="5" strokeLinecap="round" />
      <path d="M72 253v-21m203 21v-21" stroke="#6E7F68" strokeWidth="5" strokeLinecap="round" />
      <path d="M331 280h201a27 27 0 0 1 27 27v62H304v-62a27 27 0 0 1 27-27Z" fill="#0B2858" />
      <path d="M322 286h102v76H322z" fill="#27477C" />
      <path d="M428 286h99a22 22 0 0 1 22 22v54H428z" fill="#173766" />
      <path d="M304 349h255v32H304zm23 32v31m207-31v31" fill="#081F49" stroke="#081F49" strokeWidth="5" strokeLinecap="round" />
      <path d="M354 282v-17a19 19 0 0 1 19-19h36a19 19 0 0 1 19 19v17" fill="#526b99" />
      <path d="M290 413h268" stroke="#B5AA98" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="423" cy="420" rx="105" ry="22" fill="#D1C6B4" />
      <path d="M146 388h121l-12 13H158l-12-13Z" fill="#B77C52" />
      <path d="M157 401v33m99-33v33" stroke="#81583E" strokeWidth="5" strokeLinecap="round" />
      <path d="M108 365c0-21 16-37 37-37s37 16 37 37v24h-74v-24Z" fill="#D6AA74" />
      <path d="M124 331c-18-25-7-47 8-62m20 62c-2-31 13-49 31-58m-47 52c-2-28-20-40-39-43" stroke="#4D765E" strokeWidth="8" strokeLinecap="round" />
      <path d="m493 192 5 14 14 5-14 5-5 14-5-14-14-5 14-5 5-14Z" fill="#F2C400" />
      <path d="m348 100 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Zm177 45 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="#D4AA00" />
      <rect x="344" y="76" width="107" height="34" rx="17" fill="#F8F7F0" />
      <circle cx="362" cy="93" r="5" fill="#6C8B53" />
      <path d="M375 93h57" stroke="#66725F" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="demo-ribbon"><span className="demo-ribbon-message">{demoSite.demoNotice}</span><span className="ribbon-socials"><a href={demoSite.instagramUrl} target="_blank" rel="noreferrer" aria-label="M&G Cleaning Services on Instagram"><InstagramIcon /></a><a href={demoSite.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Message M&G Cleaning Services on WhatsApp"><WhatsAppIcon /></a><a href={demoSite.phoneUrl} aria-label={"Call M&G Cleaning Services at " + demoSite.phoneNumber}><PhoneIcon /></a></span></div>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand-lockup" href="/" aria-label="M&G Cleaning Services home">
            <Image src="/mg-cleaning-logo.svg" width={305} height={136} className="brand-logo" alt="M&G Cleaning Services" priority />
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link href="/services">Services</Link>
            <Link href="/about">Our approach</Link>
            <Link href="/blog">Journal</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/areas">Service areas</Link>
          </nav>
          <div className="header-actions"><Link className="button button-dark header-cta" href="/book">Request a cleaning <ArrowUpRight /></Link><MobileSiteNav /></div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="brand-lockup brand-lockup-footer" href="/" aria-label="M&G Cleaning Services home">
            <Image src="/mg-cleaning-logo.svg" width={305} height={136} className="brand-logo" alt="M&G Cleaning Services" />
          </Link>
          <p className="footer-description">Professional cleaning. Thoughtfully done.<br />Clean spaces. Strong impressions.</p>
        </div>
        <div className="footer-links">
          <div><span className="footer-label">Explore</span><Link href="/services">Services</Link><Link href="/about">Our approach</Link><Link href="/blog">Journal</Link><Link href="/gallery">Gallery</Link></div>
          <div><span className="footer-label">Say hello</span><Link href="/book">Request a cleaning</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQs</Link><Link href="/areas">Service areas</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Request terms</Link></div>
        </div>
        <div className="footer-note footer-contact"><span className="footer-label">Contact M&amp;G</span><p>Let&apos;s talk about your space.</p><div className="footer-contact-links"><a href={demoSite.instagramUrl} target="_blank" rel="noreferrer"><InstagramIcon /> {demoSite.instagramHandle}</a><a href={demoSite.whatsappUrl} target="_blank" rel="noreferrer"><WhatsAppIcon /> {demoSite.phoneNumber}</a><a href={demoSite.phoneUrl}><PhoneIcon /> Call {demoSite.phoneNumber}</a></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {demoSite.name}</span><span>Professional cleaning. Thoughtfully done.</span></div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, description, align = "left" }: { eyebrow: string; title: string; description: string; align?: "left" | "center" }) {
  return (
    <div className={"page-intro " + (align === "center" ? "page-intro-center" : "")}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro-copy">{description}</p>
    </div>
  );
}

export function ServiceCard({ service, index }: { service: DemoService; index: number }) {
  return (
    <Link className="service-card" href={"/services/" + service.slug}>
      <Image className="service-card-image" src={service.image} alt="" fill sizes="(max-width: 720px) 100vw, (max-width: 1060px) 50vw, 33vw" />
      <span className="service-card-overlay" aria-hidden="true" />
      <div className="service-card-content">
        <span className="card-index">0{index + 1}</span>
        <h3>{service.title}</h3>
        <p>{service.short}</p>
        <span className="text-link">Explore service <ArrowRight /></span>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, featured = false }: { article: DemoArticle; featured?: boolean }) {
  return (
    <Link className={"article-card " + (featured ? "article-card-featured" : "")} href={"/blog/" + article.slug}>
      <div className={"article-art article-art-" + article.tone}>
        <Image className="article-art-image" src={article.image} alt="" fill sizes="(max-width: 720px) 100vw, (max-width: 1060px) 50vw, 33vw" />
        <span className="article-art-overlay" aria-hidden="true" />
        <span className="article-art-tag">{article.category}</span>
        <span className="article-art-decoration" aria-hidden="true"><span /><span /><span /></span>
        {featured && <span className="article-art-caption">THE M&amp;G<br />JOURNAL</span>}
      </div>
      <div className="article-card-body">
        <div className="article-meta"><span>{article.category}</span><span aria-hidden="true">·</span><span>{article.readTime}</span></div>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <span className="text-link">Read the story <ArrowRight /></span>
      </div>
    </Link>
  );
}

export function CTASection({ compact = false }: { compact?: boolean }) {
  return (
    <section className={"cta-panel " + (compact ? "cta-panel-compact" : "")}>
      <div className="cta-copy">
        <p className="eyebrow eyebrow-light">YOUR SPACE · YOUR NEEDS · OUR EXPERTISE</p>
        <h2>Tell us what your space needs.</h2>
        <p>We&apos;ll assess it, agree the right scope, and deliver with professional care and attention to detail.</p>
      </div>
      <Link className="button button-lime" href="/book">Request a cleaning <ArrowUpRight /></Link>
      <span className="cta-orbit cta-orbit-one" aria-hidden="true" />
      <span className="cta-orbit cta-orbit-two" aria-hidden="true" />
    </section>
  );
}
