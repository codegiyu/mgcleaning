export type ServiceIconName =
  | "home"
  | "office"
  | "key"
  | "calendar"
  | "sofa"
  | "sparkle"
  | "shield"
  | "tile"
  | "building";

export type ServiceGroupId = "ongoing" | "specialist" | "project";

export type DemoService = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: ServiceIconName;
  image: string;
  bullets: string[];
  group: ServiceGroupId;
};

export type WhyMgReason = {
  title: string;
  description: string;
};

export type ServiceProcessStep = {
  title: string;
  description: string;
};

export type DemoArticle = {
  slug: string;
  serviceSlug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  tone: "mint" | "lime" | "sand";
  image: string;
  paragraphs: string[];
  takeaways: string[];
};

export const demoSite = {
  name: "M&G Cleaning Services",
  shortName: "M&G Cleaning",
  tagline: "Professional cleaning. Thoughtfully done.",
  promise: "Your space. Your needs. Our expertise.",
  closingLine: "Clean spaces. Strong impressions.",
  description:
    "Personalized professional cleaning solutions for homes, offices, short lets, upholstery, specialist surfaces, and post-construction spaces.",
  demoNotice: "DEMO PREVIEW · Generated media and sample content · Details to confirm",
  instagramUrl: "https://www.instagram.com/mgcleaningservices_1/",
  instagramHandle: "@mgcleaningservices_1",
  phoneNumber: "08167715346",
  phoneUrl: "tel:+2348167715346",
  whatsappUrl: "https://wa.me/2348167715346",
};

export const whyMgReasons: WhyMgReason[] = [
  {
    title: "Personalized service",
    description: "We take time to understand your space, priorities, and expected outcome before work begins.",
  },
  {
    title: "Attention to detail",
    description: "We focus on the finishing details that leave your space feeling thoroughly refreshed.",
  },
  {
    title: "Professional team",
    description: "Our operations team is prepared to deliver the agreed scope with the right approach, equipment, and care.",
  },
  {
    title: "24-hour follow-up",
    description: "Within 24 hours of completing your service—including weekends—we check in to make sure you are satisfied with the result.",
  },
  {
    title: "Loyal client care",
    description: "We value long-term relationships and aim to make every repeat service smoother and more rewarding.",
  },
];

export const serviceProcess: ServiceProcessStep[] = [
  {
    title: "Tell us what you need",
    description: "Tell our Client Service team what you would like to achieve.",
  },
  {
    title: "We assess and advise",
    description: "We assess your space and recommend the right solution. What you initially request may not always be what the space requires to achieve the result you want.",
  },
  {
    title: "We confirm and communicate",
    description: "We agree the scope with you and brief our Operations team so everyone understands the requirements before work begins.",
  },
  {
    title: "We deliver",
    description: "Our team carries out the agreed work with the right approach, equipment, and attention to detail.",
  },
  {
    title: "We follow up",
    description: "Within 24 hours of completing your service—including weekends—we check in to make sure you are satisfied with the result.",
  },
];

export const serviceGroups: Array<{
  id: ServiceGroupId;
  eyebrow: string;
  title: string;
  description: string;
}> = [
  {
    id: "ongoing",
    eyebrow: "EVERYDAY & ONGOING",
    title: "Care that fits your routine.",
    description: "One-off and recurring cleaning support for homes, offices, and guest-ready spaces.",
  },
  {
    id: "specialist",
    eyebrow: "SPECIALIST CLEANING",
    title: "Focused care for specific needs.",
    description: "Targeted services for deeper cleaning, upholstery, pest-control treatment, and suitable tiled surfaces.",
  },
  {
    id: "project",
    eyebrow: "PROJECT CLEANING",
    title: "A considered final clean.",
    description: "Detailed cleaning support when building or renovation work is ready for handover.",
  },
];

export const services: DemoService[] = [
  {
    slug: "home-cleaning",
    title: "Home cleaning",
    short: "A thoughtful reset for the rooms you use every day.",
    description:
      "From lived-in family spaces to a quick refresh before guests arrive, this demo service is shaped around the priorities you share with the team.",
    icon: "home",
    image: "/images/generated/service-home.png",
    bullets: ["Kitchen and bathroom refresh", "Dusting and surface care", "Floors and finishing touches"],
    group: "ongoing",
  },
  {
    slug: "office-cleaning",
    title: "Office cleaning",
    short: "A calm, cared-for workspace for the next workday.",
    description:
      "Keep shared work areas feeling orderly with a practical clean planned around your space and schedule.",
    icon: "office",
    image: "/images/generated/service-office.png",
    bullets: ["Shared areas and touchpoints", "Kitchenette and washroom reset", "Desk areas cleaned as agreed"],
    group: "ongoing",
  },
  {
    slug: "short-let-turnover",
    title: "Short-let turnover",
    short: "A considered reset between guest stays.",
    description:
      "A room-by-room clean for short-let hosts who want their space prepared for the next arrival. Timing and linen arrangements are agreed in advance.",
    icon: "key",
    image: "/images/generated/service-short-let.png",
    bullets: ["Guest areas and bathrooms", "Kitchen and visible surfaces", "Host checklist and handover notes"],
    group: "ongoing",
  },
  {
    slug: "retainer-cleaning",
    title: "Retainer cleaning",
    short: "Dependable scheduled cleaning for homes and offices.",
    description:
      "A recurring cleaning plan built around your space, preferred frequency, agreed priorities, and access arrangements.",
    icon: "calendar",
    image: "/images/generated/service-retainer-cleaning.png",
    bullets: ["Agreed recurring schedule", "Consistent scope and priorities", "Service review and follow-up"],
    group: "ongoing",
  },
  {
    slug: "upholstery-cleaning",
    title: "Upholstery cleaning",
    short: "Focused fabric care for sofas, chairs, mattresses, and more.",
    description:
      "We assess the material and areas of concern, then agree suitable vacuuming, spot treatment, odor care, and fabric-refreshing work for sofas, chairs, mattresses, and other upholstery.",
    icon: "sofa",
    image: "/images/generated/service-upholstery.png",
    bullets: ["Vacuuming to remove loose dirt", "Agreed stain and spot treatment", "Odor and fabric-care discussion", "Material suitability confirmed before treatment"],
    group: "specialist",
  },
  {
    slug: "deep-cleaning",
    title: "Deep cleaning",
    short: "A more detailed clean for the places easy to overlook.",
    description:
      "For a seasonal reset or a space that needs extra attention, a deep clean can focus on agreed rooms and details beyond a routine tidy.",
    icon: "sparkle",
    image: "/images/generated/service-deep-cleaning.png",
    bullets: ["Room-by-room priorities", "Edges and high-touch details", "A clear scope before the visit"],
    group: "specialist",
  },
  {
    slug: "fumigation",
    title: "Fumigation",
    short: "Site-assessed pest-control treatment planned around your property and safe access.",
    description:
      "We assess the affected areas, identify the treatment requirements, agree preparation and access arrangements, and provide clear instructions for leaving and re-entering the space.",
    icon: "shield",
    image: "/images/generated/service-fumigation.png",
    bullets: ["Site and pest-concern assessment", "Treatment of agreed areas", "Preparation, ventilation, and re-entry guidance"],
    group: "specialist",
  },
  {
    slug: "tile-polishing",
    title: "Tile polishing",
    short: "Material-aware polishing for suitable tiled and stone surfaces.",
    description:
      "We inspect the tile material and condition, test the proposed method where necessary, and use a surface-appropriate process to clean, polish, and refresh the finish.",
    icon: "tile",
    image: "/images/generated/service-tile-polishing.png",
    bullets: ["Material and condition assessment", "Surface-appropriate preparation and polishing", "Final buffing and visual handover"],
    group: "specialist",
  },
  {
    slug: "post-construction-cleaning",
    title: "Post-construction cleaning",
    short: "A final clean after renovation work is complete.",
    description:
      "Once building work has finished, this demo service focuses on removing ordinary fine dust and residue from agreed surfaces so the space can be set up.",
    icon: "building",
    image: "/images/generated/service-post-construction.png",
    bullets: ["Walk-through and scope agreement", "Surface-appropriate cleaning", "Clear handoff for final inspection"],
    group: "project",
  },
];

export const categories = ["All", "Home care", "Hosting", "Workspaces"];

export const articles: DemoArticle[] = [
  {
    slug: "prepare-for-a-deep-clean",
    serviceSlug: "deep-cleaning",
    title: "A calmer way to prepare for a deep clean",
    excerpt:
      "A few small decisions before the visit can help your cleaning team spend more time on the details that matter to you.",
    category: "Home care",
    publishedAt: "2026-09-08",
    readTime: "4 min read",
    tone: "mint",
    image: "/images/generated/journal-deep-clean-prep.png",
    paragraphs: [
      "A deep clean works best when the priorities are clear. Before the visit, take a quick walk through the rooms and note the areas you would most like the team to focus on.",
      "Put away valuables and personal items, clear the surfaces you want cleaned, and let the team know about delicate finishes or materials that need special care. If something should be left untouched, mark it clearly.",
      "Agree the scope and access details in advance. That simple conversation helps everyone start with the same picture of what a successful clean looks like.",
    ],
    takeaways: [
      "List the rooms and details that matter most.",
      "Move fragile or personal items out of the work area.",
      "Share care instructions and anything that should be left untouched.",
    ],
  },
  {
    slug: "short-let-reset-between-stays",
    serviceSlug: "short-let-turnover",
    title: "The small details behind a smoother short-let reset",
    excerpt:
      "A repeatable room-by-room checklist helps hosts prepare a welcoming space between stays.",
    category: "Hosting",
    publishedAt: "2026-09-02",
    readTime: "5 min read",
    tone: "lime",
    image: "/images/generated/journal-short-let.png",
    paragraphs: [
      "A reliable turnover starts with a clear sequence. Walk the space first, check the host notes, and gather the supplies needed for the rooms on the list.",
      "Work from one area to the next: air the rooms where possible, reset the bathroom and kitchen, make beds according to the host's instructions, then finish with floors and a final visual check.",
      "Keep a short handover note for anything that needs the host's attention. A missing item or maintenance issue is easier to resolve when it is reported clearly and promptly.",
    ],
    takeaways: [
      "Use the same room order for each visit.",
      "Follow the host's linen and setup instructions.",
      "Record maintenance issues separately from the cleaning checklist.",
    ],
  },
  {
    slug: "office-reset-for-the-week",
    serviceSlug: "office-cleaning",
    title: "A simple office reset to start the week well",
    excerpt:
      "Focus on shared spaces, clear surfaces, and the small routines that make a workspace easier to use.",
    category: "Workspaces",
    publishedAt: "2026-08-26",
    readTime: "3 min read",
    tone: "sand",
    image: "/images/generated/journal-office.png",
    paragraphs: [
      "An office feels easier to return to when shared spaces have a clear reset routine. Start with the entrance and meeting areas, then move through the kitchenette and washrooms.",
      "Agree which desk surfaces can be cleaned and which should be left alone. This avoids moving personal work and keeps the team's expectations consistent.",
      "A short checklist also makes it easier to spot supplies that are running low or a maintenance issue that needs a separate follow-up.",
    ],
    takeaways: [
      "Set clear boundaries for personal desks and equipment.",
      "Give shared spaces a consistent order of attention.",
      "Note supplies or repairs that need a separate follow-up.",
    ],
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date + "T12:00:00"));
}
