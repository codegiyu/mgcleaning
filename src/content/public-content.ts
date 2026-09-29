import { demoSite, services, type DemoService } from "@/content/demo-content";
import { contentMode, type ContentProvenance, type ContentStatus, type RightsStatus } from "@/content/trust-content";

type GovernedRecord = {
  id: string;
  status: ContentStatus;
  provenance: ContentProvenance;
  rightsStatus: RightsStatus;
  sourceNote: string;
  requiredForProduction: boolean;
  approvedAt?: string;
  lastReviewedAt?: string;
};

export type BusinessFact = GovernedRecord & {
  label: string;
  value?: string;
  href?: string;
};

export type BusinessContactFacts = {
  email: BusinessFact;
  phone: BusinessFact;
  whatsapp: BusinessFact;
  instagram: BusinessFact;
  serviceArea: BusinessFact;
  operatingHours: BusinessFact;
  responseExpectation: BusinessFact;
};

export type OpeningHours = {
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

export type SeoBusinessFacts = {
  status: ContentStatus;
  serviceArea?: string;
  googleBusinessProfileUrl?: string;
  openingHours: OpeningHours[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    addressCountry: string;
  };
};

const confirmedContactRecord = (id: string, label: string, sourceNote: string): GovernedRecord => ({
  id,
  status: "approved",
  provenance: "public-source",
  rightsStatus: "approved",
  sourceNote,
  requiredForProduction: true,
  lastReviewedAt: "2026-09-29",
});

const pendingFactRecord = (id: string, sourceNote: string): GovernedRecord => ({
  id,
  status: "draft",
  provenance: "staff-supplied",
  rightsStatus: "pending",
  sourceNote,
  requiredForProduction: true,
});

export const businessContactFacts: BusinessContactFacts = {
  email: {
    ...pendingFactRecord("business-email", "Official MG Cleaning email address has not been supplied."),
    label: "Official email",
  },
  phone: {
    ...confirmedContactRecord("business-phone", "Phone", "Confirmed by the MG Cleaning project owner."),
    label: "Phone",
    value: demoSite.phoneNumber,
    href: demoSite.phoneUrl,
  },
  whatsapp: {
    ...confirmedContactRecord("business-whatsapp", "WhatsApp", "Confirmed by the MG Cleaning project owner."),
    label: "WhatsApp",
    value: demoSite.phoneNumber,
    href: demoSite.whatsappUrl,
  },
  instagram: {
    ...confirmedContactRecord("business-instagram", "Instagram", "Confirmed by the MG Cleaning project owner."),
    label: "Instagram",
    value: demoSite.instagramHandle,
    href: demoSite.instagramUrl,
  },
  serviceArea: {
    ...pendingFactRecord("business-service-area", "Abuja coverage is a candidate claim awaiting explicit service-area approval."),
    label: "Service area",
  },
  operatingHours: {
    ...pendingFactRecord("business-operating-hours", "Operating hours and timezone have not been supplied."),
    label: "Operating hours",
  },
  responseExpectation: {
    ...confirmedContactRecord("business-response-expectation", "Response expectation", "Approved request-flow wording used throughout the current site."),
    label: "Response expectation",
    value: "We respond within one business day",
  },
};

export const seoBusinessFacts: SeoBusinessFacts = {
  status: "draft",
  openingHours: [],
};

export type ServiceDetails = GovernedRecord & {
  serviceSlug: string;
  includes: string[];
  suitableFor: string[];
  surfacesOrSpaces: string[];
  typicalDuration?: string;
  preparation: string[];
  pricingFactors: string[];
  expectedResult?: string;
  limitations: string[];
};

const serviceRecord = (serviceSlug: string, sourceNote: string): GovernedRecord => ({
  id: `service-${serviceSlug}`,
  status: "demo",
  provenance: "generated-demo",
  rightsStatus: "not-for-launch",
  sourceNote,
  requiredForProduction: true,
});

const serviceDetails: ServiceDetails[] = [
  {
    ...serviceRecord("home-cleaning", "Sample service detail for design review; MG Cleaning must approve scope and claims."),
    serviceSlug: "home-cleaning",
    includes: ["Kitchen and bathroom refresh", "Dusting and surface care", "Floors and finishing touches"],
    suitableFor: ["Homes", "Guest-ready refreshes", "Rooms with an agreed cleaning scope"],
    surfacesOrSpaces: ["Living areas", "Bedrooms", "Kitchens and bathrooms"],
    preparation: ["Share the rooms and priorities you want the team to focus on.", "Put away fragile or personal items before the visit."],
    pricingFactors: ["Rooms and space size", "Condition and requested detail", "Access and timing"],
    expectedResult: "The agreed rooms and surfaces are cleaned according to the confirmed scope.",
    limitations: ["Final inclusions, timing, and availability are confirmed with MG Cleaning before a visit."],
  },
  {
    ...serviceRecord("office-cleaning", "Sample service detail for design review; MG Cleaning must approve scope and claims."),
    serviceSlug: "office-cleaning",
    includes: ["Shared areas and touchpoints", "Kitchenette and washroom reset", "Desk areas cleaned as agreed"],
    suitableFor: ["Offices", "Shared workspaces", "Small commercial environments"],
    surfacesOrSpaces: ["Entrances and shared areas", "Kitchenettes and washrooms", "Agreed desk or work surfaces"],
    preparation: ["Confirm which desks, equipment, and documents should be left untouched.", "Share access and timing requirements before the visit."],
    pricingFactors: ["Workspace size and layout", "Frequency and requested scope", "Access arrangements"],
    expectedResult: "The agreed workspace areas are reset for the next workday according to the confirmed scope.",
    limitations: ["Equipment, personal desks, and specialist surfaces require separate agreement."],
  },
  {
    ...serviceRecord("short-let-turnover", "Sample service detail for design review; MG Cleaning must approve scope and claims."),
    serviceSlug: "short-let-turnover",
    includes: ["Guest areas and bathrooms", "Kitchen and visible surfaces", "Host checklist and handover notes"],
    suitableFor: ["Short-let apartments", "Guest rooms", "Between-stay resets"],
    surfacesOrSpaces: ["Guest bedrooms", "Bathrooms", "Kitchens and shared spaces"],
    preparation: ["Share arrival deadlines, linen instructions, and access details.", "Provide any host checklist or handover notes."],
    pricingFactors: ["Property size and number of rooms", "Turnaround window", "Linen and setup requirements"],
    expectedResult: "The agreed guest areas are prepared for the next arrival according to the host instructions.",
    limitations: ["Laundry, linen supply, and maintenance work are only included when explicitly agreed."],
  },
  {
    ...serviceRecord("upholstery-cleaning", "The supplied upholstery flyer informs the service direction; current detail still needs launch approval."),
    serviceSlug: "upholstery-cleaning",
    includes: ["Deep vacuuming to remove loose dirt", "Stain and spot treatment", "Odor and fabric-care discussion"],
    suitableFor: ["Sofas", "Chairs", "Mattresses and other agreed upholstery"],
    surfacesOrSpaces: ["Fabric upholstery", "Seating", "Mattresses where suitable"],
    preparation: ["Describe the fabric, stains, odors, and areas of concern.", "Share any care instructions or delicate materials before the visit."],
    pricingFactors: ["Item size and quantity", "Fabric or material", "Condition and requested treatment", "Access"],
    expectedResult: "The agreed upholstery items are treated according to the confirmed material and service scope.",
    limitations: ["Material suitability, treatment options, timing, and pricing must be confirmed before work begins."],
  },
  {
    ...serviceRecord("deep-cleaning", "Sample service detail for design review; MG Cleaning must approve scope and claims."),
    serviceSlug: "deep-cleaning",
    includes: ["Room-by-room priorities", "Edges and high-touch details", "A clear scope before the visit"],
    suitableFor: ["Seasonal resets", "Homes needing extra attention", "Spaces with an agreed detailed scope"],
    surfacesOrSpaces: ["Agreed rooms", "Edges and accessible details", "High-touch surfaces"],
    preparation: ["List the rooms and details that matter most.", "Move fragile or personal items out of the work area."],
    pricingFactors: ["Space size and condition", "Level of detail", "Access and requested timing"],
    expectedResult: "The agreed rooms receive a more detailed clean based on the priorities confirmed with MG Cleaning.",
    limitations: ["The service scope does not automatically include repairs, lifting heavy items, or specialist restoration."],
  },
  {
    ...serviceRecord("post-construction-cleaning", "Sample service detail for design review; MG Cleaning must approve scope and claims."),
    serviceSlug: "post-construction-cleaning",
    includes: ["Walk-through and scope agreement", "Surface-appropriate cleaning", "Clear handoff for final inspection"],
    suitableFor: ["Recently renovated spaces", "Completed construction areas", "Final setup before occupation"],
    surfacesOrSpaces: ["Agreed floors and surfaces", "Accessible fixtures", "Rooms ready for final cleaning"],
    preparation: ["Confirm that building work is complete enough for cleaning.", "Share materials, access, and any areas that should remain untouched."],
    pricingFactors: ["Dust and residue level", "Space size and surfaces", "Access and handoff requirements"],
    expectedResult: "The agreed accessible surfaces are cleaned for a clearer final handoff.",
    limitations: ["Construction defects, hazardous materials, heavy debris, and unfinished work require separate assessment."],
  },
];

export function getPublicBusinessFacts() {
  return businessContactFacts;
}

export function getServiceDetails(slug: string) {
  return serviceDetails.find((service) => service.serviceSlug === slug);
}

export function getPublicServiceDetails() {
  return contentMode === "demo" ? serviceDetails : serviceDetails.filter((service) => service.status === "approved" && service.rightsStatus === "approved");
}

export function getServiceWithDetails(slug: string): (DemoService & { details?: ServiceDetails }) | undefined {
  const service = services.find((item) => item.slug === slug);
  return service ? { ...service, details: getServiceDetails(slug) } : undefined;
}

export function assertProductionPublicContent() {
  if (contentMode !== "production") return;

  const facts = Object.values(businessContactFacts);
  const missingFacts = facts.filter((fact) => fact.requiredForProduction && (fact.status !== "approved" || !fact.value));
  const unapprovedServices = serviceDetails.filter((service) => service.requiredForProduction && (service.status !== "approved" || service.rightsStatus !== "approved" || !service.typicalDuration));
  if (missingFacts.length || unapprovedServices.length || seoBusinessFacts.status !== "approved" || !seoBusinessFacts.serviceArea || !seoBusinessFacts.googleBusinessProfileUrl || seoBusinessFacts.openingHours.length === 0) {
    throw new Error(
      `Production public content is not ready. Confirm business facts (${missingFacts.map((fact) => fact.id).join(", ") || "none"}), service records (${unapprovedServices.map((service) => service.id).join(", ") || "none"}), and local SEO facts before building.`,
    );
  }
}

assertProductionPublicContent();
