export type ContentStatus = "demo" | "draft" | "approved" | "archived";

export type ContentProvenance =
  | "generated-demo"
  | "customer-supplied"
  | "staff-supplied"
  | "public-source";

export type RightsStatus = "not-for-launch" | "pending" | "approved" | "expired";

type TrustRecord = {
  id: string;
  status: ContentStatus;
  provenance: ContentProvenance;
  rightsStatus: RightsStatus;
  sourceNote: string;
  approvedBy?: string;
  approvedAt?: string;
  lastReviewedAt?: string;
  requiredForProduction: boolean;
};

export type TrustGalleryAsset = TrustRecord & {
  type: "image" | "video";
  src: string;
  poster?: string;
  serviceSlug?: string;
  tags: string[];
  alt: string;
  caption: string;
  layout: "featured" | "tall" | "standard" | "wide";
};

export type TrustTestimonial = TrustRecord & {
  quote: string;
  attribution: string;
  service?: string;
};

export type TrustFaq = TrustRecord & {
  question: string;
  answer: string;
};

export type TrustFact = TrustRecord & {
  kind: "google-profile" | "service-area" | "operating-hours" | "business-location" | "certification" | "guarantee";
  label: string;
  value?: string;
};

export const contentMode = process.env.NEXT_PUBLIC_CONTENT_MODE === "production" ? "production" : "demo";
export const isDemoContent = contentMode === "demo";

const demoRecord = (id: string, sourceNote: string): TrustRecord => ({
  id,
  status: "demo",
  provenance: "generated-demo",
  rightsStatus: "not-for-launch",
  sourceNote,
  requiredForProduction: true,
});

export const trustGallery: TrustGalleryAsset[] = [
  {
    ...demoRecord("gallery-hero", "Generated image for layout review; it is not an M&G Cleaning Services project."),
    type: "image",
    src: "/images/generated/hero-professional-cleaning-v2.png",
    serviceSlug: "home-cleaning",
    tags: ["Home", "Professional cleaning"],
    alt: "A cleaning professional caring for a bright modern space",
    caption: "Professional care shaped around the needs of each space.",
    layout: "featured",
  },
  {
    ...demoRecord("gallery-approach", "Generated image for layout review; it does not show an M&G Cleaning Services team member or client."),
    type: "image",
    src: "/images/generated/about-consultation-v2.png",
    tags: ["Process", "Assessment"],
    alt: "A cleaning professional assessing a client's space",
    caption: "Every service begins with understanding the space and desired result.",
    layout: "tall",
  },
  {
    ...demoRecord("gallery-upholstery", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-upholstery.png",
    serviceSlug: "upholstery-cleaning",
    tags: ["Upholstery"],
    alt: "Upholstery cleaning in a bright living room",
    caption: "Focused care for sofas, chairs, and upholstered surfaces.",
    layout: "standard",
  },
  {
    ...demoRecord("gallery-home", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-home.png",
    serviceSlug: "home-cleaning",
    tags: ["Home"],
    alt: "A cleaner refreshing a bright home interior",
    caption: "Personalized cleaning support for comfortable, refreshed homes.",
    layout: "standard",
  },
  {
    ...demoRecord("gallery-office", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-office.png",
    serviceSlug: "office-cleaning",
    tags: ["Office"],
    alt: "A cleaner caring for a modern office space",
    caption: "Professional cleaning for focused, well-presented workspaces.",
    layout: "standard",
  },
  {
    ...demoRecord("gallery-short-let", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-short-let.png",
    serviceSlug: "short-let-turnover",
    tags: ["Short let"],
    alt: "A cleaner preparing a short-let room",
    caption: "Detailed turnovers that help short-let spaces feel guest-ready.",
    layout: "standard",
  },
  {
    ...demoRecord("gallery-retainer", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-retainer-cleaning.png",
    serviceSlug: "retainer-cleaning",
    tags: ["Retainer", "Office"],
    alt: "A professional team providing scheduled office cleaning",
    caption: "Consistent cleaning support planned around an agreed schedule.",
    layout: "wide",
  },
  {
    ...demoRecord("gallery-fumigation", "Generated image for layout review; it does not demonstrate M&G's confirmed treatment method or equipment."),
    type: "image",
    src: "/images/generated/service-fumigation.png",
    serviceSlug: "fumigation",
    tags: ["Fumigation", "Specialist"],
    alt: "A protected pest-control technician preparing treatment equipment",
    caption: "Pest-control service planned around the space and treatment requirements.",
    layout: "standard",
  },
  {
    ...demoRecord("gallery-tile-polishing", "Generated image for layout review; no customer result or material suitability is being claimed."),
    type: "image",
    src: "/images/generated/service-tile-polishing.png",
    serviceSlug: "tile-polishing",
    tags: ["Tile polishing", "Specialist"],
    alt: "A professional operating a floor-polishing machine",
    caption: "Machine polishing for compatible tile and stone surfaces.",
    layout: "wide",
  },
  {
    ...demoRecord("gallery-deep-clean", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-deep-cleaning.png",
    serviceSlug: "deep-cleaning",
    tags: ["Deep cleaning"],
    alt: "Detailed deep cleaning in progress",
    caption: "Focused attention for spaces that need a more intensive clean.",
    layout: "wide",
  },
  {
    ...demoRecord("gallery-post-construction", "Generated image for layout review; no customer result is being claimed."),
    type: "image",
    src: "/images/generated/service-post-construction.png",
    serviceSlug: "post-construction-cleaning",
    tags: ["Post-construction"],
    alt: "A bright space being prepared after construction work",
    caption: "Detailed cleaning to prepare newly completed spaces for use.",
    layout: "wide",
  },
];

export const trustTestimonials: TrustTestimonial[] = [
  {
    ...demoRecord("testimonial-slot-one", "Placeholder card for a customer-approved testimonial."),
    quote: "Approved customer feedback will appear here after M&G Cleaning Services receives permission to publish it.",
    attribution: "Sample testimonial slot",
    service: "Service and attribution to be confirmed",
  },
  {
    ...demoRecord("testimonial-slot-two", "Placeholder card for a customer-approved testimonial."),
    quote: "This space is reserved for an authentic customer experience, not generated review copy.",
    attribution: "Sample testimonial slot",
    service: "Service and attribution to be confirmed",
  },
];

export const trustFacts: TrustFact[] = [
  {
    ...demoRecord("google-business-profile", "The verified Google Business Profile URL has not been supplied."),
    kind: "google-profile",
    label: "Google Business Profile",
  },
  {
    ...demoRecord("service-area", "MG Cleaning service coverage has not been confirmed for publication."),
    kind: "service-area",
    label: "Service area",
  },
  {
    ...demoRecord("operating-hours", "MG Cleaning operating hours and timezone have not been confirmed."),
    kind: "operating-hours",
    label: "Operating hours",
  },
  {
    ...demoRecord("business-location", "No public business address or dispatch location has been confirmed."),
    kind: "business-location",
    label: "Business location",
  },
  {
    ...demoRecord("certifications", "No certification has been verified for public display."),
    kind: "certification",
    label: "Certifications",
  },
  {
    ...demoRecord("guarantee", "No written service guarantee has been approved for publication."),
    kind: "guarantee",
    label: "Service guarantee",
  },
];

export const trustFaqs: TrustFaq[] = [
  {
    ...demoRecord("faq-request", "Placeholder answer uses only the approved request-flow wording."),
    question: "How do I request a cleaning?",
    answer: "Submit the cleaning request form with your contact details, preferred timing, location, and what you would like cleaned. M&G Cleaning Services will contact you to confirm availability and pricing.",
  },
  {
    ...demoRecord("faq-response", "Placeholder answer uses only the approved response expectation."),
    question: "How quickly will M&G Cleaning Services respond?",
    answer: "The current request flow is designed around a response within one business day. The team will follow up through the contact method you choose.",
  },
  {
    ...demoRecord("faq-coverage", "Coverage is intentionally not claimed before MG confirms its service area."),
    question: "Do you cover my area?",
    answer: "Tell us your area in the request form and M&G Cleaning Services will confirm whether the requested service is available there.",
  },
  {
    ...demoRecord("faq-pricing", "Pricing is intentionally not invented in demo content."),
    question: "How is pricing confirmed?",
    answer: "Pricing depends on the requested service and space. M&G Cleaning Services will discuss the scope and pricing with you before confirming an appointment.",
  },
  {
    ...demoRecord("faq-appointment", "Placeholder answer avoids inventing rescheduling or cancellation policy."),
    question: "Is submitting the form an appointment confirmation?",
    answer: "No. The form sends a cleaning request. A visit is only confirmed after M&G Cleaning Services and the customer agree the availability, timing, and pricing by phone or WhatsApp.",
  },
];

export function getPublicGallery() {
  return isDemoContent
    ? trustGallery
    : trustGallery.filter((item) => item.status === "approved" && item.provenance !== "generated-demo" && item.rightsStatus === "approved");
}

export function getPublicTestimonials() {
  return isDemoContent
    ? trustTestimonials
    : trustTestimonials.filter((item) => item.status === "approved" && item.provenance !== "generated-demo" && item.rightsStatus === "approved");
}

export function getPublicFaqs() {
  return isDemoContent ? trustFaqs : trustFaqs.filter((item) => item.status === "approved");
}

export function getPublicTrustFacts() {
  return isDemoContent ? trustFacts : trustFacts.filter((item) => item.status === "approved" && item.rightsStatus === "approved");
}

export function assertProductionTrustContent() {
  if (contentMode !== "production") return;

  const records = [...trustGallery, ...trustTestimonials, ...trustFacts, ...trustFaqs];
  const unapproved = records.filter((record) => record.requiredForProduction && record.status !== "approved");
  if (unapproved.length > 0) {
    throw new Error(
      `Production content is not ready. Approve or replace these trust records before building: ${unapproved.map((record) => record.id).join(", ")}`,
    );
  }
}

// The manifest is imported by every public trust surface. Keeping this guard at
// module scope makes an accidental production build fail before demo evidence
// can be published or indexed.
assertProductionTrustContent();
