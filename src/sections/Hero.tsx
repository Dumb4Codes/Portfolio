import { splitHeadline } from '@/content/derive'
import type { Profile } from '@/content/schema'

export type Signal = { label: string; value: string }

/**
 * The h1 is real HTML ("Youvraj Singh"). Once WebGL is ready the particle word sits exactly over it
 * and the glyphs fade out; without WebGL the HTML word simply stays.
 *
 * `data-build` marks the blocks the first-visit intro assembles (see components/Intro.tsx). On any
 * other visit the CSS entrance plays instead.
 */
export default function Hero({ profile, signals }: { profile: Profile; signals: Signal[] }) {
  const [first, ...rest] = profile.name.split(' ')
  const h = splitHeadline(profile.headline)
  return (
    <section className="hero" id="top" data-scene="hero" aria-labelledby="hero-title">
      <div className="aurora" aria-hidden="true" />
      <div className="wrap hero__inner">
        <div className="hero__top">
          <p className="status-pill status-pill--hero mono" data-build="pill">
            <span className="status-dot" aria-hidden="true" />
            {profile.availability.label}
          </p>
        </div>

        <h1 id="hero-title" className="hero__name" data-build="name">
          <span className="hero__first display" data-hero-name>
            {first}
          </span>{' '}
          <span className="hero__last serif">{rest.join(' ')}</span>
        </h1>

        <div className="hero__grid">
          <div className="hero__lead">
            <p className="hero__headline display" data-hero-headline data-build="headline">
              {h.before} <em className="serif">{h.accent}</em>
              {h.after ? ` ${h.after}` : ''}
            </p>
            <p className="hero__sub" data-hero-sub data-build="sub">
              {profile.subheadline}
            </p>
            <div className="hero__cta" data-build="cta">
              <a className="btn btn-accent" href="#work" data-cursor="Go">
                See the work
              </a>
              {profile.resume && (
                <a className="btn" href={profile.resume} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                  Résumé
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none">
                    <path d="M2 2h8v8M10 2 2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
              )}
              <a className="btn btn-ghost" href={`mailto:${profile.email}`} data-cursor="Write">
                Email me
              </a>
            </div>
          </div>

          {signals.length > 0 && (
            <dl className="hero__signals mono" data-build="signals" aria-label="At a glance">
              {signals.map((s) => (
                <div key={s.label}>
                  <dt className="muted">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="hero__bottom mono" data-build="foot">
          <span className="hero__cue" aria-hidden="true">
            <span>Scroll</span>
            <i className="hero__drip" />
          </span>
          <span className="muted">
            Based in {profile.location.split(',').slice(0, 1)}, IN · 12.97° N 77.59° E
          </span>
          <span className={`muted hero__avail hero__avail--${profile.availability.status}`}>{profile.availability.label}</span>
        </div>
      </div>
    </section>
  )
}
