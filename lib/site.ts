// Must match `basePath` in next.config.ts exactly. Next.js auto-prepends
// basePath to <Link>/router.push, but NOT to manually-built URL strings
// (window.location.origin + a path, or an emailed link), so anywhere that
// builds an absolute URL by hand has to append this itself.
export const BASE_PATH = '/leadership'

// Server-side only (uses NEXT_PUBLIC_SITE_URL, not window). For building
// absolute links inside emails, where there is no browser origin to read.
export function baseUrl(): string {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leadership-excellence-assessment.vercel.app'
  return `${origin}${BASE_PATH}`
}
