export type ServiceIconName =
  | "home"
  | "office"
  | "key"
  | "sofa"
  | "sparkle"
  | "building";

export type DemoService = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: ServiceIconName;
  image: string;
  bullets: string[];
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
  name: "M&G Cleaning Service",
  shortName: "M&G Cleaning",
  tagline: "Deep clean. Fresh feel.",
  promise: "Because your comfort matters.",
  closingLine: "Clean spaces. Strong impressions.",
  description:
    "Upholstery cleaning for sofas, chairs, mattresses, and more. Deep clean. Fresh feel. Because your comfort matters.",
  demoNotice: "DEMO PREVIEW · Generated media and sample content · Details to confirm",
  instagramUrl: "https://www.instagram.com/mgcleaningservices_1/",
  instagramHandle: "@mgcleaningservices_1",
  phoneNumber: "08167715346",
  phoneUrl: "tel:+2348167715346",
  whatsappUrl: "https://wa.me/2348167715346",
};

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
  },
  {
    slug: "upholstery-cleaning",
    title: "Upholstery cleaning",
    short: "Deep clean. Fresh feel. Because your comfort matters.",
    description:
      "We remove dirt, stains, allergens, and odors from sofas, chairs, mattresses, and more, leaving fabrics refreshed, sanitized, and looking like new.",
    icon: "sofa",
    image: "/images/generated/service-upholstery.png",
    bullets: ["Deep vacuuming to remove dust and loose dirt", "Stain removal and spot treatment", "Odor elimination and fabric deodorizing", "Sanitizing for a healthier living space", "Safe for all fabric types and materials"],
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
  },
  {
    slug: "post-construction-cleaning",
    title: "Post-construction clean",
    short: "A final clean after renovation work is complete.",
    description:
      "Once building work has finished, this demo service focuses on removing ordinary fine dust and residue from agreed surfaces so the space can be set up.",
    icon: "building",
    image: "/images/generated/service-post-construction.png",
    bullets: ["Walk-through and scope agreement", "Surface-appropriate cleaning", "Clear handoff for final inspection"],
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
