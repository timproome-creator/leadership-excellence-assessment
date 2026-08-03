// Brand layer for white-labelling this assessment across deployments.
//
// The methodology, scoring, and components are brand-agnostic. Only the
// identity text and chrome colours change per brand. The active brand is
// chosen at build time by NEXT_PUBLIC_BRAND (defaults to 'dcupside' so the
// public dcupside.com deployment is never affected).
//
// Colours are NOT defined here — they live as CSS variables in globals.css,
// scoped by the `data-brand` attribute set on <html> in app/layout.tsx. This
// file only owns words and identity.

export type BrandId = 'dcupside' | 'mrpg'

/** Brand colours for the OUTPUT surfaces — the generated PDF and the report/
 *  invite emails. These can't use the CSS variables in globals.css: react-pdf
 *  builds its own document with a real StyleSheet, and email HTML has to carry
 *  literal hex values since mail clients don't resolve custom properties.
 *  So the identity colours live here as data, mirroring the CSS variables.
 *
 *  Only BRAND-IDENTITY colours belong here. Semantic colours (green = above
 *  the bar, amber = at risk, red = below, plus the greys) are deliberately
 *  NOT brand-scoped — a competency below the bar should read red in every
 *  brand, so those stay hardcoded at their point of use. */
export interface BrandPalette {
  /** Deep identity colour — letterhead rule, section headings, eyebrow labels. */
  deep: string
  /** Primary identity colour — buttons, manager score, the figures that matter. */
  primary: string
  /** Secondary figure colour — self score, deliberately quieter than primary. */
  secondary: string
  /** Header band gradient, start and end (emails). */
  bandStart: string
  bandEnd: string
  /** Eyebrow label on the header band. */
  bandEyebrow: string
  /** Body copy on the header band. */
  bandBody: string
  /** Main heading on the header band — must contrast with bandStart/bandEnd. */
  bandHeading: string
  /** Tinted callout panel (overall recommendation, succession note). */
  panelBg: string
  panelBorder: string
  panelText: string
}

export interface Brand {
  id: BrandId
  /** Header line 1 — the platform name. */
  name: string
  /** Header line 2 — the module/positioning eyebrow. */
  subtitle: string
  /** Full legal/owning entity, used in About and footers. */
  legalName: string
  /** <title> and OpenGraph title. */
  metaTitle: string
  metaDescription: string
  /** OpenGraph siteName. */
  ogSiteName: string
  /** Path under /public to a real logo image, or null to render the text
   *  wordmark instead. Relative to the app root — callers must prepend
   *  BASE_PATH themselves (see lib/site.ts; plain <img src> is not
   *  basePath-aware the way <Link>/next/image are). */
  logoSrc: string | null
  /** Footer line on generated PDF reports. Full custom text per brand —
   *  DC Upside's includes its public domain; internal white-labels should not. */
  pdfFooter: string
  /** Eyebrow text in the gradient header band of report/invite emails. */
  emailEyebrow: string
  /** Fallback "From" header when RESEND_FROM is unset. Each deployment should
   *  still set RESEND_FROM to a domain it controls — this is just the display
   *  name so an unconfigured deployment never falls back to another brand's name. */
  emailFrom: string
  /** "All tools" nav link target. null = relative '/' (correct for dcupside,
   *  which sits behind operational-leak-diagnostic's gateway at dcupside.com
   *  where '/' is the real platform home). Mr Price's deployment isn't behind
   *  that gateway — it's proxied INTO performance-talent's domain instead
   *  (that app's next.config.ts rewrites '/leadership' here) — so a relative
   *  '/' would 404 regardless of whether someone arrived via the gateway or
   *  hit this deployment directly. Needs an absolute URL instead. */
  allToolsUrl: string | null
  /** Identity colours for the PDF and emails. See BrandPalette. */
  palette: BrandPalette
}

const BRANDS: Record<BrandId, Brand> = {
  dcupside: {
    id: 'dcupside',
    name: 'DC Upside',
    subtitle: 'People & Leadership',
    legalName: 'Virtual Supply Chain Executive',
    metaTitle: 'Warehouse Leadership Excellence Assessment | DC Upside',
    metaDescription:
      'A two-way leadership competency assessment for warehouse and DC leaders. Self and line-manager rate independently against a role-specific bar, then reveal the gaps, strengths and development priorities.',
    ogSiteName: 'DC Upside',
    logoSrc: null,
    pdfFooter: 'DC Upside - dcupside.com - Confidential, not for distribution',
    emailEyebrow: 'DC Upside &middot; Leadership Excellence',
    emailFrom: 'DC Upside <onboarding@resend.dev>',
    allToolsUrl: null,
    // Exactly the values that were hardcoded in ReportDocument.tsx and the
    // email templates before this palette existed — dcupside's output is
    // deliberately unchanged by the extraction.
    palette: {
      deep: '#1e3a8a',
      primary: '#1d4ed8',
      secondary: '#0284c7',
      bandStart: '#172554',
      bandEnd: '#1e40af',
      bandEyebrow: '#93c5fd',
      bandBody: '#bfdbfe',
      bandHeading: '#ffffff',
      panelBg: '#eff6ff',
      panelBorder: '#bfdbfe',
      panelText: '#1e40af',
    },
  },
  mrpg: {
    id: 'mrpg',
    name: 'Mr Price Group Logistics',
    subtitle: 'People & Performance',
    legalName: 'Mr Price Group Logistics',
    metaTitle: 'Leadership Excellence Assessment | Mr Price Group Logistics',
    metaDescription:
      'An internal two-way leadership competency assessment for Mr Price Group Logistics leaders. Self and line-manager rate independently against a role-specific bar, then reveal the gaps, strengths and development priorities.',
    ogSiteName: 'Mr Price Group Logistics',
    logoSrc: '/mrpg-logo.jpeg',
    pdfFooter: 'Mr Price Group Logistics - Internal use only - Confidential, not for distribution',
    emailEyebrow: 'Mr Price Group Logistics &middot; Leadership Excellence',
    emailFrom: 'Mr Price Group Logistics <onboarding@resend.dev>',
    allToolsUrl: 'https://performance-talent.vercel.app/performance',
    // Light band with red accents, mirroring the web nav (which had to go
    // light because the real logo's wordmark is black — see globals.css).
    // Keeping the PDF/email band light too means the takeaway artefacts look
    // like the portal they came from, rather than a differently-styled cousin.
    // Red from the sampled logo (#d81830); charcoal/greys to match the web.
    palette: {
      deep: '#111111',
      primary: '#d81830',
      secondary: '#52525b',
      bandStart: '#f4f4f4',
      bandEnd: '#e8e8e8',
      bandEyebrow: '#d81830',
      bandBody: '#3f3f46',
      bandHeading: '#111111',
      panelBg: '#fdf2f4',
      panelBorder: '#f4b6bf',
      panelText: '#b01326',
    },
  },
}

const resolvedId = (process.env.NEXT_PUBLIC_BRAND as BrandId) || 'dcupside'

export const BRAND: Brand = BRANDS[resolvedId] ?? BRANDS.dcupside
