import Cursor from '@/components/Cursor'
import Telemetry from '@/components/Telemetry'
import EasterEgg from '@/components/EasterEgg'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import LazyPalette from '@/components/SiteChrome'
import PageWipe from '@/components/PageWipe'
import Preloader from '@/components/Preloader'
import ScrollProgress from '@/components/ScrollProgress'
import MotionBoot from '@/motion/Boot'
import { Toaster } from '@/components/toast'
import { getSiteData } from '@/content/reader'
import GLMount from '@/gl/GLMount'
import { encodeContact } from '@/lib/obfuscate'
import { BUILD_DATE, NAV } from '@/lib/site'

/** The persistent layer (canvas, cursor, palette, wipe) lives here so it survives route changes. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, site, projects, currentJob } = await getSiteData()
  const socials = [
    profile.socials.github && { label: 'GitHub', href: profile.socials.github },
    profile.socials.linkedin && { label: 'LinkedIn', href: profile.socials.linkedin },
    profile.socials.leetcode && { label: 'LeetCode', href: profile.socials.leetcode },
    ...profile.socials.extra.map((e) => ({ label: e.label, href: e.url })),
  ].filter(Boolean) as { label: string; href: string }[]
  const jobLine = currentJob ? `${currentJob.role} @ ${currentJob.company}` : null

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <MotionBoot />
      <GLMount />
      <div className="grain" aria-hidden="true" />
      <ScrollProgress />
      <Header jobLine={jobLine} timezone={profile.timezone} nav={NAV} socials={socials} />
      <main id="main" className="site-main" tabIndex={-1}>
        {children}
      </main>
      <Footer name={profile.name} timezone={profile.timezone} builtAt={BUILD_DATE} socials={socials} />
      <LazyPalette
        data={{
          projects: projects.map((p) => ({ slug: p.slug, title: p.title, kind: p.kind })),
          email: profile.email,
          phoneEnc: encodeContact(profile.phone),
          resume: profile.resume,
          links: socials,
          nav: NAV,
        }}
      />
      <Cursor />
      <Toaster />
      <PageWipe />
      {site.showPreloader && <Preloader />}
      {site.easterEgg && <EasterEgg />}
      {process.env.VERCEL && <Telemetry />}
    </>
  )
}
