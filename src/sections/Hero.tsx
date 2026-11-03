import { splitHeadline } from '@/content/derive'
import type { Profile } from '@/content/schema'

/**
 * The h1 is real HTML ("Youvraj Singh"). Once WebGL is ready the particle word sits exactly over it
 * and the glyphs fade out; without WebGL the HTML word simply stays.
 */
export default function Hero({ profile, jobLine }: { profile: Profile; jobLine: string | null }) {
  const [first, ...rest] = profile.name.split(' ')
  const h = splitHeadline(profile.headline)
  return (
    <section className="hero" id="top" data-scene="hero" aria-labelledby="hero-title">
      <div className="wrap hero__inner">
        <div className="hero__top">
          {jobLine && (
            <p className="status-pill status-pill--hero mono">
              <span className="status-dot" aria-hidden="true" />
              {jobLine}
            </p>
          )}
        </div>

        <div className="hero__main">
          <h1 id="hero-title" className="hero__name">
            <span className="hero__first display" data-hero-name>
              {first}
            </span>
            {/* phones: the same word stacked on two lines so it can be set much larger */}
            <span className="hero__stack display" data-hero-name data-stacked aria-hidden="true">
              <span>{first.slice(0, Math.floor(first.length / 2))}</span>
              <span>{first.slice(Math.floor(first.length / 2))}</span>
            </span>{' '}
            <span className="hero__last serif">{rest.join(' ')}</span>
          </h1>

          <p className="hero__headline display" data-hero-headline>
            {h.before} <em className="serif">{h.accent}</em>
            {h.after ? ` ${h.after}` : ''}
          </p>
          <p className="hero__sub" data-hero-sub>
            {profile.subheadline}
          </p>
        </div>

        <div className="hero__bottom mono">
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
