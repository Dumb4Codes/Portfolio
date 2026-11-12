import type { Metadata } from 'next'
import { projectsUsing, stackKey } from '@/content/derive'
import { getSiteData } from '@/content/reader'
import { blurMap } from '@/lib/blur'
import { SITE_URL } from '@/lib/site'
import AboutSection from '@/sections/AboutSection'
import ArchiveSection from '@/sections/ArchiveSection'
import CertsSection from '@/sections/CertsSection'
import ContactSection from '@/sections/ContactSection'
import ExperienceSection from '@/sections/ExperienceSection'
import Hero, { type Signal } from '@/sections/Hero'
import Manifesto from '@/sections/Manifesto'
import StackSection from '@/sections/StackSection'
import WorkGrid from '@/sections/WorkGrid'

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteData()
  return {
    title: { absolute: site.seoTitle },
    description: site.seoDescription,
    alternates: { canonical: '/' },
    openGraph: { title: site.seoTitle, description: site.seoDescription, url: SITE_URL, type: 'website', siteName: site.seoTitle },
    twitter: { card: 'summary_large_image', title: site.seoTitle, description: site.seoDescription },
  }
}

/** "React 19" -> "React", "Next.js 16" -> "Next.js": the hero signal line names tools, not versions. */
const plain = (t: string) => t.replace(/\s+v?\d+(\.\d+)*\+?$/, '')

export default async function Home() {
  const d = await getSiteData()
  const { profile, site, projects, skills, experience, certifications, currentJob } = d

  const blurs = await blurMap([profile.photo, ...projects.map((p) => p.cover)])
  const usage: Record<string, string[]> = {}
  skills.groups.forEach((g) => g.items.forEach((s) => (usage[s] = projectsUsing(s, projects))))
  const titles = Object.fromEntries(projects.map((p) => [p.slug, p.title]))

  // the five technologies that appear in the most projects, for the hero's "across" line
  const counts = new Map<string, { label: string; n: number }>()
  projects.forEach((p) =>
    p.stack.forEach((t) => {
      const k = stackKey(t)
      const cur = counts.get(k)
      counts.set(k, { label: cur?.label ?? plain(t), n: (cur?.n ?? 0) + 1 })
    }),
  )
  // styling and build tools are real skills but say little about range; the line is for languages, frameworks and data
  const tooling = /tailwind|vite|radix|shadcn|framer|zod|jwt/i
  const top = [...counts.values()]
    .filter((v) => !tooling.test(v.label))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
    .map((v) => v.label)
  const signals: Signal[] = [
    ...(currentJob ? [{ label: 'Currently', value: `${currentJob.role}, ${currentJob.company}` }] : []),
    { label: 'Shipped', value: `${projects.length} projects across ${experience.length} internships and personal work` },
    { label: 'Across', value: top.join(' · ') },
  ]

  const sameAs = [profile.socials.github, profile.socials.linkedin, profile.socials.leetcode, ...profile.socials.extra.map((e) => e.url)].filter(Boolean)
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: currentJob?.role ?? profile.role,
    url: SITE_URL,
    image: profile.photo ? `${SITE_URL}${profile.photo}` : undefined,
    worksFor: currentJob ? { '@type': 'Organization', name: currentJob.company } : undefined,
    address: { '@type': 'PostalAddress', addressLocality: profile.location.split(',')[0].trim(), addressCountry: 'IN' },
    sameAs,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <Hero profile={profile} signals={signals} />
      <Manifesto template={site.manifesto} numbers={{ tests: d.testsTotal, projects: projects.length, jobs: experience.length }} projects={projects} skills={skills} />
      <WorkGrid projects={projects} blurs={blurs} total={projects.length} />
      <div className="field-zone" data-scene="field">
        <ArchiveSection projects={projects} />
        <ExperienceSection jobs={experience} projects={projects} education={profile.education} />
        <StackSection groups={skills.groups} usage={usage} titles={titles} />
        <CertsSection
          certs={certifications.map((c) => ({ slug: c.slug, title: c.title, issuer: c.issuer, date: c.date, image: c.image, verifyUrl: c.verifyUrl, file: c.file }))}
        />
        <AboutSection profile={profile} job={currentJob} blur={profile.photo ? blurs[profile.photo] : undefined} />
      </div>
      <ContactSection profile={profile} headline={site.contactHeadline} />
    </>
  )
}
