import type { Metadata } from 'next'
import { projectsUsing } from '@/content/derive'
import { getSiteData } from '@/content/reader'
import { SITE_URL } from '@/lib/site'
import AboutSection from '@/sections/AboutSection'
import ArchiveSection from '@/sections/ArchiveSection'
import BuildsSection from '@/sections/BuildsSection'
import CertsSection from '@/sections/CertsSection'
import ContactSection from '@/sections/ContactSection'
import ExperienceSection from '@/sections/ExperienceSection'
import Hero from '@/sections/Hero'
import Manifesto from '@/sections/Manifesto'
import StackSection from '@/sections/StackSection'
import WorkSection from '@/sections/WorkSection'

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

export default async function Home() {
  const d = await getSiteData()
  const { profile, site, projects, skills, experience, certifications, currentJob } = d
  const jobLine = currentJob ? `${currentJob.role} @ ${currentJob.company}` : null
  const company = projects.find((p) => p.kind === 'internal' && p.company)?.company ?? currentJob?.company ?? ''

  const usage: Record<string, string[]> = {}
  skills.groups.forEach((g) => g.items.forEach((s) => (usage[s] = projectsUsing(s, projects))))
  const titles = Object.fromEntries(projects.map((p) => [p.slug, p.title]))

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
      <Hero profile={profile} jobLine={jobLine} />
      <Manifesto template={site.manifesto} total={d.testsTotal} projects={projects} skills={skills} />
      <WorkSection projects={projects} company={company} />
      <div className="field-zone" data-scene="field">
        <BuildsSection projects={projects} />
        <ArchiveSection projects={projects} />
        <ExperienceSection jobs={experience} projects={projects} education={profile.education} />
        <StackSection groups={skills.groups} usage={usage} titles={titles} />
        <CertsSection
          certs={certifications.map((c) => ({ slug: c.slug, title: c.title, issuer: c.issuer, date: c.date, image: c.image, verifyUrl: c.verifyUrl, file: c.file }))}
        />
        <AboutSection profile={profile} job={currentJob} />
      </div>
      <ContactSection profile={profile} headline={site.contactHeadline} />
    </>
  )
}
