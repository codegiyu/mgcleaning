# Typography

Two typefaces, each with a fixed set of roles. Assign a heading by its role, never by which component it sits in. Sizes stay per component; the role sets the family and weight.

## Fonts and tokens

| Token | Stack | Source |
|---|---|---|
| `--font-sans` | `var(--font-geist-sans), Arial, Helvetica, sans-serif` | Geist via `next/font/google` in `src/app/layout.tsx` |
| `--font-display` | `var(--font-newsreader), Georgia, serif` | Newsreader via `next/font/google` (normal and italic, `opsz` axis) |

Both fonts are self-hosted by `next/font`, with size-matched fallbacks, so every device renders the same faces without layout shift. `body` uses `--font-sans`; everything inherits it unless it is a display role. Do not write font stacks in component CSS. Use the tokens.

## Roles

| Role | Family and weight | Examples |
|---|---|---|
| **Page title (H1)** | Geist 500, tight tracking (about `-.06em` to `-.08em`) | `.hero-copy h1`, `.page-intro h1`, `.link-hub-page h1`, `.article-head h1` |
| **Accent phrase** | Display italic 400, tracking `-.03em` | `.hero-copy h1 em`, `.link-hub-page h1 em` ("*Thoughtfully done.*") |
| **Section title (H2, or a section-level H3)** | Display 400, tracking `-.03em` | `.section-heading h2`, `.cta-copy h2`, `.approach-copy h2`, `.faq-preview-heading h3`, `.service-group-heading h2`, `.service-detail-section h2`, `.about-copy h2`, `.process-heading h2`, `.gallery-booking h2`, `.trust-next-step h2`, `.area-availability-card h2`, `.empty-trust-state h2`, `.legal-page h2`, `.article-body h2` |
| **Card and panel title** | Geist 600 | `.service-card h3`, `.article-card h3`, `.why-mg-card h3`, `.trust-proof-card h3`, `.process-step h3`, `.hero-note strong`, `.faq-preview-item strong`, `.service-detail-aside h2`, `.contact-aside h2`, `.form-title`, `.area-notes strong`, `.faq-item summary`, `.footer-note p`, `.article-body h3` |
| **Body and UI** | Geist (inherited), 400 for text; buttons, labels, and eyebrows keep their existing weights | Paragraphs, navigation, forms, footer description, mobile menu, the whole admin |

## Rules of thumb

- A new section heading uses `font-family:var(--font-display); font-weight:400; letter-spacing:-.03em;`. Newsreader sets narrower than Georgia, so the tighter tracking that suited Georgia crowds it. A new card title uses `font-weight:600` and no family.
- Serif appears only in section titles and accent italics: never in body text, buttons, form labels, or cards.
- Inside articles the same rules apply: article H2s are section titles (display), article H3s are card-style titles (Geist 600).
- The admin uses Geist throughout and has no display roles.
