import Reveal from '@/components/Reveal'
import Magnetic from '@/components/Magnetic'
import { splitEmphasis } from '@/content/derive'
import type { Profile } from '@/content/schema'
import { encodeContact } from '@/lib/obfuscate'
import { ContactActions, ContactForm } from './ContactClient'

export default function ContactSection({ profile, headline }: { profile: Profile; headline: string }) {
  const parts = splitEmphasis(headline)
  const links = [
    profile.socials.github && { label: 'GitHub', href: profile.socials.github },
    profile.socials.linkedin && { label: 'LinkedIn', href: profile.socials.linkedin },
    profile.socials.leetcode && { label: 'LeetCode', href: profile.socials.leetcode },
    ...profile.socials.extra.map((e) => ({ label: e.label, href: e.url })),
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <section id="contact" className="contact" data-scene="pin" aria-labelledby="contact-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <p className="section-label mono contact__label">
          <span>[ 08 ]</span> <span>Contact</span>
        </p>

        <h2 id="contact-title" className="display contact__title">
          {parts.map((p, i) => (p.em ? <em key={i} className="serif">{p.t}</em> : <span key={i}>{p.t}</span>))}
        </h2>

        <div className="contact__grid grid12">
          <div className="contact__cta">
            <Magnetic strength={0.4}>
              <a className="hello" href={`mailto:${profile.email}`} data-cursor="Write">
                <span>Say hello</span>
              </a>
            </Magnetic>
          </div>

          <div className="contact__details">
            <ContactActions email={profile.email} phoneEnc={encodeContact(profile.phone)} resume={profile.resume} />
            <ul className="contact__links mono">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                    {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <ContactForm email={profile.email} />
        </div>
      </div>
    </section>
  )
}
