import type { Metadata } from 'next'
import { stackKey } from '@/content/derive'
import { getSiteData } from '@/content/reader'
import WorkIndex from '@/sections/WorkIndex'

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSiteData()
  return {
    title: `Work · ${profile.name}`,
    description: `Every project by ${profile.name}: internal systems built at SKOPE Kitchens and personal builds.`,
    alternates: { canonical: '/work' },
  }
}

export default async function WorkPage() {
  const { projects } = await getSiteData()
  // filter chips: most-used technologies across all projects
  const counts = new Map<string, { label: string; n: number }>()
  projects.forEach((p) =>
    p.stack.forEach((t) => {
      const k = stackKey(t)
      const cur = counts.get(k)
      counts.set(k, { label: cur?.label ?? t.replace(/\s+v?\d+(\.\d+)*$/, '').replace(/\.js$/i, ''), n: (cur?.n ?? 0) + 1 })
    }),
  )
  const stacks = [...counts.entries()]
    .filter(([, v]) => v.n >= 2)
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 10)
    .map(([key, v]) => ({ key, label: v.label }))

  return (
    <WorkIndex
      stacks={stacks}
      items={projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        kind: p.kind,
        year: p.year,
        tagline: p.tagline,
        stack: p.stack.slice(0, 4),
        keys: p.stack.map(stackKey),
      }))}
    />
  )
}
