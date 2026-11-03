import type { MetadataRoute } from 'next'
import { getSiteData } from '@/content/reader'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteData()
  const now = new Date()
  return [
    { url: SITE_URL, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/work`, lastModified: now, priority: 0.8 },
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, lastModified: now, priority: 0.6 })),
  ]
}
