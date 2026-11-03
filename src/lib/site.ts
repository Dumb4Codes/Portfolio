/** Canonical site URL. Set NEXT_PUBLIC_SITE_URL in Vercel; falls back to Vercel's own address, then a placeholder. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://youvraj-singh.vercel.app'
).replace(/\/$/, '')

export const NAV = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
] as const

/** Build time, shown in the footer as "Last updated". */
export const BUILD_DATE = new Date().toISOString()
