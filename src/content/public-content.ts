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
    ...serviceRecord("retainer-cleaning", "Client-confirmed service category; frequency, scope, and plan terms remain subject to agreement."),
    serviceSlug: "retainer-cleaning",
    includes: ["An agreed recurring schedule", "A consistent cleaning scope and priority list", "Service review and 24-hour follow-up"],
    suitableFor: ["Residential homes", "Offices", "Commercial spaces with recurring cleaning needs"],
    surfacesOrSpaces: ["Agreed rooms and shared areas", "Kitchens, washrooms, and common areas", "Accessible floors and surfaces"],
    preparation: ["Agree the service frequency, access arrangements, and priority areas.", "Identify delicate surfaces, restricted areas, and anything the team should leave untouched."],
    pricingFactors: ["Property size and layout", "Visit frequency", "Agreed scope and staffing needs", "Access and timing"],
    expectedResult: "The agreed areas receive consistent cleaning care according to the confirmed schedule and scope.",
    limitations: ["Plan frequency, inclusions, supplies, cancellations, and any additional work are confirmed before the retainer begins."],
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
    ...serviceRecord("fumigation", "Draft scope informed by NAFDAC pesticide guidance, EHCON licensing information, and WHO household pesticide-safety guidance; MG Cleaning must confirm its products, methods, qualifications, and treatment scope."),
    serviceSlug: "fumigation",
    includes: ["Discussion and assessment of the affected areas", "A treatment plan for the agreed areas", "Use of an appropriate registered product according to its approved label", "Preparation, ventilation, and re-entry instructions", "A post-service follow-up and recommendation where further treatment may be needed"],
    suitableFor: ["Residential properties", "Offices and commercial spaces", "Short-let properties with an agreed pest concern"],
    surfacesOrSpaces: ["Agreed indoor areas", "Agreed external areas", "Accessible pest-activity and entry-point locations"],
    preparation: ["Remove or securely cover food, drinks, utensils, medicines, and personal-care items.", "Keep people and pets away during treatment and for the stated re-entry period.", "Remove or securely protect aquariums as instructed and provide access to every agreed area.", "Follow the product- and site-specific instructions supplied before treatment."],
    pricingFactors: ["Property size and layout", "Pest type and apparent level of activity", "Number and accessibility of treatment areas", "Required treatment method and products", "Repeat visits, urgency, and access arrangements"],
    expectedResult: "The agreed areas are treated according to the site-specific plan. Results depend on the pest involved, activity level, property conditions, preparation, prevention measures, and whether follow-up treatment is required.",
    limitations: ["Complete elimination after one treatment cannot be guaranteed.", "The exact treatment and re-entry period depend on the approved product label and site conditions.", "Waste, moisture, entry points, structural defects, or neighbouring infestations may need separate attention.", "Specific pests, treatment methods, product registrations, and practitioner qualifications must be confirmed before the service is approved for launch."],
  },
  {
    ...serviceRecord("tile-polishing", "Draft scope informed by Natural Stone Institute care guidance and manufacturer surface-compatibility guidance; MG Cleaning must confirm materials, equipment, and products."),
    serviceSlug: "tile-polishing",
    includes: ["Tile-material and surface-condition assessment", "A discreet compatibility test where necessary", "Removal of loose dirt and appropriate surface preparation", "Machine or manual polishing suited to the confirmed material", "Accessible edge work, final buffing, clean-up, and visual handover"],
    suitableFor: ["Suitable natural-stone floors", "Terrazzo", "Other tiled finishes confirmed during assessment"],
    surfacesOrSpaces: ["Interior floors", "Entrances and lobbies", "Residential and commercial tiled areas"],
    preparation: ["Clear movable furniture and personal items from the area.", "Identify known sealers, coatings, previous treatments, repairs, cracks, loose tiles, and damaged grout.", "Provide agreed access, electricity, and water where required.", "Keep the area clear until the team confirms it is ready for use."],
    pricingFactors: ["Tile or stone material", "Total floor area", "Existing finish and surface condition", "Staining, scratching, or previous coatings", "Furniture movement, access, edge work, and requested finish"],
    expectedResult: "A cleaner, more even, and refreshed finish within the limits of the existing material and surface condition.",
    limitations: ["Not every ceramic, porcelain, stone, or coated tile can be polished.", "Polishing does not repair cracked or loose tiles, failed grout, structural movement, or major surface damage.", "Deep scratches, severe etching, and uneven tiles may require restoration work that MG Cleaning is not currently advertising.", "Gloss level varies by material and existing condition; a test area may be required before the full service is agreed."],
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
