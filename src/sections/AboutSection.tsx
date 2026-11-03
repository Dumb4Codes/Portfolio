import Image from 'next/image'
import Reveal from '@/components/Reveal'
import type { Experience, Profile } from '@/content/schema'
import AboutPhoto from './AboutPhoto'

export default function AboutSection({ profile, job, blur }: { profile: Profile; job?: Experience; blur?: string }) {
  const paragraphs = profile.bio.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
  const links = [
    profile.socials.github && { label: 'GitHub', href: profile.socials.github },
    profile.socials.linkedin && { label: 'LinkedIn', href: profile.socials.linkedin },
    profile.socials.leetcode && { label: 'LeetCode', href: profile.socials.leetcode },
  ].filter(Boolean) as { label: string; href: string }[]

  const facts: [string, React.ReactNode][] = [
    ['Based in', profile.location],
    ['Studied', `${profile.education.degree}, ${profile.education.school}`],
    ...(job ? ([['Currently', `${job.role} at ${job.company}`]] as [string, string][]) : []),
    [
      'Elsewhere',
      <span key="l" className="about__links">
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
            {l.label} ↗
          </a>
        ))}
      </span>,
    ],
  ]

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <div className="about__grid grid12">
          <p className="section-label mono about__label">
            <span>[ 07 ]</span> <span>About</span>
          </p>
          {profile.photo && (
            <AboutPhoto>
              <Image
                src={profile.photo}
                alt={profile.photoAlt}
                width={900}
                height={1125}
                sizes="(min-width: 1024px) 34vw, 86vw"
                quality={75}
                placeholder={blur ? 'blur' : 'empty'}
                blurDataURL={blur}
                className="about__img"
              />
            </AboutPhoto>
          )}
          <div className="about__copy">
            <Reveal as="h2" variant="wdth" id="about-title" className="display about__title">
              The person <em className="serif">behind</em> the ledger
            </Reveal>
            <div className="about__bio">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <dl className="about__facts mono">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
