# Typography and section components

Two typefaces, each with a fixed set of roles, rendered through a few shared components. Build new sections from these components instead of writing heading or card markup by hand, so every page stays uniform.

## Fonts and tokens

| Token | Stack | Source |
|---|---|---|
| `--font-sans` | `var(--font-geist-sans), Arial, Helvetica, sans-serif` | Geist via `next/font/google` in `src/app/layout.tsx` |
| `--font-display` | `var(--font-newsreader), Georgia, serif` | Newsreader via `next/font/google` (normal and italic, `opsz` axis) |

Both fonts are self-hosted by `next/font`, with size-matched fallbacks, so every device renders the same faces without layout shift. `body` uses `--font-sans`; everything inherits it unless it is a display role. Do not write font stacks in component CSS. Use the tokens.

## Text size scale

Text sizes come from four tokens on `:root` in `src/app/globals.css`. Use them instead of writing pixel sizes for body-level text.

| Token | Size | Use |
|---|---|---|
| `--text-label` | 12px | Only uppercase, letter-spaced labels: eyebrows, card labels, the header ribbon, footer column labels, table headers, status badges, image tags. Keep 12px rare. |
| `--text-small` | 13px | Secondary text: form labels, links, navigation, captions, meta lines, admin tables and help text. |
| `--text-body` | 14px | Reading text and buttons: card and section copy, FAQ answers, form notes, legal text, admin notes and messages. |
| `--text-input` | 16px | Every input, select, and textarea, public and admin: below 16px, iPhones zoom the page when a field is focused. |

Nothing renders below 12px. A bare `<small>` never drops below `--text-small` (browsers otherwise shrink it to 80%). Sentence-case text is never `--text-label`, even if it looks like a label: admin table headers, status badges, and summary titles use `--text-small`. Headings and display text keep their own sizes (below).

## Roles and sizes

| Role | Style | Class | Rendered by |
|---|---|---|---|
| **Page title (H1)** | Geist 500, tight tracking | `.page-intro h1`, `.hero-copy h1`, `.link-hub-page h1`, `.article-head h1` | `PageIntro`, the home hero, the link hub, the article header |
| **Accent phrase** | Display italic 400, `-.03em` | `h1 em` | `<em>` inside a page title |
| **Section title** | Display 400, `clamp(32px, 4vw, 46px)`, `-.03em` | `.section-title` | `SectionHeading` (default size) |
| **Subsection title** | Display 400, `clamp(26px, 3vw, 36px)`, `-.03em` | `.subsection-title` | `SectionHeading size="subsection"`, empty states |
| **Content heading** | Display 400, 25px | `.service-detail-section h2`, `.legal-page h2`, `.article-body h2` | Long-form content: service details, legal pages, articles |
| **Panel title** | Geist 600, 26px | `.panel-title`, `.form-title` | Side panels (contact, booking, service detail) and form cards |
| **Card title** | Geist 600, 22px | `.card-title` | `InfoCard` |
| **Image-card title** | Geist 600, 20px | `.service-card h3`, `.article-card h3` | `ServiceCard`, `ArticleCard` |
| **Eyebrow and card label** | Geist 800, `--text-label` (12px), `.18em`, gold | `.eyebrow`, `.info-card-label` | `SectionHeading`, `PageIntro`, `InfoCard` |
| **Section lead** | Geist 400, `--text-body` (14px), `--muted` | `.section-lead` | `SectionHeading` description |
| **Card text** | Geist 400, `--text-body` (14px), `--muted` | `.card-text` | `InfoCard` body |
| **Body and UI** | Geist, sizes from the scale above | — | Paragraphs, navigation, forms, footer, the whole admin |

## Components (`src/components/site-ui.tsx`)

- **`SectionHeading`**: eyebrow, title, optional `description` (one paragraph or several), and optional `action` link.
  - `layout="split"` (default) puts the text and link beside the title; it stacks on mobile.
  - `layout="stacked"` puts them below; use it inside bands, panels, and sticky columns.
  - `size="subsection"` is for headings inside a section (service groups, FAQ preview, next steps).
  - `divider` adds a top rule, `tone="light"` is for dark panels (the call to action), and `as="h3"` sets the heading level.
- **`InfoCard`**: optional `label` (use `sequenceLabel(index)` for 01, 02, …, or a short category), title, text, and optional link. It has three variants:
  - `rule` (default) sits on a top rule.
  - `panel` is a filled card.
  - `row` puts the label in a side column for ordered steps (`element="li"`).
- **`PageCTA`**: the closing call to action on inner pages. The home page uses `CTASection` at full size.
- **`ContactChannels`** (`src/components/contact-channels.tsx`): contact blocks read from the governed `businessContactFacts`.
- **`RequestChannels`** (same file): the primary way to request a cleaning, in the agreed order WhatsApp → Instagram DM → call. `buttons` (default) is the bold stack used before the booking form, on Contact, and in the service aside (`tone="light"` on pale panels); `inline` is the row under the home Quick Answers. Pass `service` (a title from the services manifest) to name it in the prefilled WhatsApp message. The closing call to action leads with WhatsApp too.

- **`ReviewCard`** (`src/components/review-card.tsx`): one customer review as plain text. It shows an optional star rating with a spoken label, the quote in body Geist at 15px (blank lines start a new paragraph), and a `figcaption` with the name in Geist 700 and context and service in card-text grey. The admin editor preview renders this same card.

Grids own layout only (`.why-mg-grid`, `.trust-proof-grid`, `.faq-preview-grid`, `.review-grid`, `.area-notes`, `.process-list`). Card spacing and typography come from the components, never from per-page selectors.

## Rules of thumb

- Serif appears only in section, subsection, and content headings and in accent italics: never in body text, buttons, form labels, panels, or cards.
- Inside articles the same rules apply: article H2s are content headings (display); article H3s are card-style titles (Geist 600).
- Secondary text uses `var(--muted)`; do not introduce new greys.
- Do not repeat the closing call to action's heading in a band above it. A next-step band should point somewhere else (for example, Areas → FAQs).
- No inline `style` attributes on public pages; add a class.
- Response promises come from `src/content/response-expectation.ts`; never write a response time into page copy. A test fails if the retired "business day" promise returns.
