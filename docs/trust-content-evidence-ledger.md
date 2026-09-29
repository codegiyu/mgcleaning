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
| Phone | Confirmed public phone number | Approved | MG Cleaning | Review when number changes |
| WhatsApp | Confirmed WhatsApp destination | Approved | MG Cleaning | Review when number changes |
| Instagram | Confirmed Instagram profile URL | Approved | MG Cleaning | Review when profile changes |
| Response expectation | Approved wording for response timing | Approved | MG Cleaning | Review when process changes |

## Replacement workflow

1. Add the source and rights evidence to the relevant record in `src/content/trust-content.ts`.
2. Replace demo media or placeholder copy with the supplied material.
3. Set `provenance`, `rightsStatus`, `status`, approval owner, and review dates.
4. Check that the public wording matches the evidence exactly.
5. Run lint, typecheck, and a production-mode build.
6. Only deploy after the production build passes and the live page has been visually reviewed.

The production build is intentionally blocked while required trust records remain in `demo`, `draft`, or `archived` state.
