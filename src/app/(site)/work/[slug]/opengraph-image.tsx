import { getProject, getSiteData } from '@/content/reader'
import { OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Project'
export const size = OG_SIZE
export const contentType = 'image/png'

export async function generateStaticParams() {
  const { projects } = await getSiteData()
  return projects.map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getProject(slug)
  const { profile } = await getSiteData()
  // internal work: only the title and tagline from the content file, no links or visuals
  return ogImage({
    title: p?.title ?? profile.name,
    kicker: p ? `${p.kind === 'internal' ? 'Internal · Confidential' : 'Personal project'} · ${p.year}` : profile.name,
    sub: p?.tagline,
  })
}
