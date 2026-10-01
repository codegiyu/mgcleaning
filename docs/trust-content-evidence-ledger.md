# Trust-content evidence ledger

This ledger is the launch checklist for replacing demo trust content with verified MG Cleaning material. Nothing in the `demo` state is customer proof.

| Content | Evidence required before publishing | Current status | Owner | Review/expiry |
|---|---|---|---|---|
| Customer testimonials | Customer permission, approved quote, approved attribution, source record | Missing | MG Cleaning | To be set |
| Google Business Profile | Exact verified profile URL and approval to link it | Missing | MG Cleaning | Review when profile changes |
| Project gallery | Authentic original media, confirmation MG performed the work, publication rights, privacy review | Missing | MG Cleaning | Per asset |
| Before-and-after pair | Authentic paired images, same project, approved caption, customer permission | Missing | MG Cleaning | Per asset |
| Team/technician images | Staff permission, approved names and roles, image rights | Missing | MG Cleaning | When staff changes |
| Service areas | Confirmed coverage list, exclusions, effective date | Missing | MG Cleaning | Review on coverage change |
| Operating hours | Approved weekly schedule, timezone, holiday exceptions | Missing | MG Cleaning | Review on schedule change |
| Business location | Approved public wording distinguishing office, dispatch base, and service region | Missing | MG Cleaning | Review on location change |
| Certifications | Issuer, certificate ID, dates, verification source, logo rights | Missing | MG Cleaning | Certificate expiry |
| Service guarantees | Written terms, exclusions, remedy, effective date | Missing | MG Cleaning | Policy review |
| FAQs | MG-approved answers for scope, availability, pricing, scheduling, cancellation, and follow-up | Missing | MG Cleaning | Policy review |
| Official public name | Client confirmation that the public name is “M&G Cleaning Services” | Approved | MG Cleaning | Review if the registered or trading name changes |
| Service catalogue | Client confirmation of home, office, short-let, retainer, deep, upholstery, fumigation, tile-polishing, and post-construction services | Approved at category level | MG Cleaning | Review when services change |
| 24-hour follow-up | Client confirmation that follow-up occurs within 24 hours of service completion, including weekends | Approved | MG Cleaning | Review if operating process changes |
| Professional-team wording | Evidence of training, role expectations, and operational briefing process | Partial—client wording supplied | MG Cleaning | Confirm before production claim approval |
| Loyal-client benefits | Approved benefit list, eligibility, exclusions, and effective date | Not defined; publish relationship wording only | MG Cleaning | Review when programme is defined |
| Fumigation products and scope | NAFDAC registration details, pests treated, application methods, product labels, and supplier records | Missing—researched draft only | MG Cleaning | Before publishing approved service detail |
| Fumigation qualifications | Applicable EHCON corporate licence and practitioner/contractor credentials | Missing—researched draft only | MG Cleaning | Licence/credential expiry |
| Fumigation safety process | Approved preparation, PPE, ventilation, emergency, and product-specific re-entry instructions | Missing—researched draft only | MG Cleaning | Review per product or method change |
| Tile-polishing scope | Confirmed tile/stone materials, equipment, products, test-area process, outcomes, and exclusions | Missing—researched draft only | MG Cleaning | Review when methods change |
| Phone | Confirmed public phone number | Approved | MG Cleaning | Review when number changes |
| WhatsApp | Confirmed WhatsApp destination | Approved | MG Cleaning | Review when number changes |
| Instagram | Confirmed Instagram profile URL | Approved | MG Cleaning | Review when profile changes |
| Response expectation | Approved wording for response timing | Approved | MG Cleaning | Review when process changes |

## Research basis for draft specialist-service content

- Fumigation and pesticide registration: NAFDAC, `https://www.nafdac.gov.ng/wp-content/uploads/Files/Resources/Guidelines/DR_And_R_Guidelines/Guidelines-for-the-Registration-of-Pesticides-made-in-Nigeria.pdf`.
- Public-health pest-control licensing: Environmental Health Council of Nigeria, `https://ehcon.gov.ng/corporate-license/`.
- Household pesticide preparation and re-entry precautions: World Health Organization, `https://iris.who.int/bitstream/handle/10665/337126/9789240011915-eng.pdf`.
- Natural-stone material identification and care: Natural Stone Institute, `https://www.naturalstoneinstitute.org/consumers/care/`.
- Example surface-specific polishing limitations: Custom Building Products Aqua Mix product guide, `https://www.custombuildingproducts.com/media/2594878/aqua-mix-product-guide.pdf`.

These references establish a conservative draft baseline only. M&G's actual products, labels, methods, licences, equipment, material coverage, and site instructions govern the final published service content.

## Replacement workflow

1. Add the source and rights evidence to the relevant record in `src/content/trust-content.ts`.
2. Replace demo media or placeholder copy with the supplied material.
3. Set `provenance`, `rightsStatus`, `status`, approval owner, and review dates.
4. Check that the public wording matches the evidence exactly.
5. Run lint, typecheck, and a production-mode build.
6. Only deploy after the production build passes and the live page has been visually reviewed.

The production build is intentionally blocked while required trust records remain in `demo`, `draft`, or `archived` state.
