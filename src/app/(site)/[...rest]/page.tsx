import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

/** Any unknown URL ends here so the 404 renders inside the site layout (the particles stay mounted). */
export default function CatchAll() {
  notFound()
}
