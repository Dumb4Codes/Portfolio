import Link from 'next/link'
import Cover from '@/components/Cover'
import Reveal from '@/components/Reveal'
import type { Project } from '@/content/schema'
import InternalCover from './InternalCover'

function Card({ p, i, total, blur }: { p: Project; i: number; total: number; blur?: string }) {
  const internal = p.kind === 'internal'
  const href = `/work/${p.slug}`
  return (
    <li className={`card wcard ${internal ? 'wcard--internal' : 'wcard--personal'}`} data-project={p.slug}>
      <Reveal variant="rise" className="wcard__in" start="top 92%">
        <a href={href} tabIndex={-1} aria-hidden="true" data-cursor="View" data-wipe={p.title} className="wcard__media">
          {internal ? (
            <InternalCover visual={p.visual} />
          ) : (
            <Cover src={p.cover} alt="" title={p.title} slug={p.slug} sizes="(min-width: 1024px) 50vw, (min-width: 768px) 46vw, 92vw" blur={blur} />
          )}
        </a>
        <div className="wcard__body">
          <p className="mono muted wcard__meta">
            <span>
              {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <span className="wcard__kind">
              {internal ? (
                <>
                  <span className="badge badge--sm">Internal</span>
                  <span>{p.company}</span>
                </>
              ) : (
                <span>Personal · {p.year}</span>
              )}
            </span>
          </p>
          <h3 className="display wcard__title">
            <a href={href} data-wipe={p.title} data-cursor="View">
              {p.title}
            </a>
          </h3>
          <p className="wcard__tag">{p.tagline}</p>
          <ul className="chips" aria-label="Stack">
            {p.stack.slice(0, 4).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
          <div className="wcard__links">
            {p.liveUrl && (
              <a className="btn btn-sm btn-accent" href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                Live ↗<span className="sr-only"> ({p.title}, opens in a new tab)</span>
              </a>
            )}
            {p.repoUrl && (
              <a className="btn btn-sm" href={p.repoUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                Code ↗<span className="sr-only"> ({p.title}, opens in a new tab)</span>
              </a>
            )}
            <a className="link-arrow" href={href} data-wipe={p.title} data-cursor="Read">
              Case study →
            </a>
          </div>
        </div>
      </Reveal>
    </li>
  )
}

/**
 * One grid for everything featured, internal and personal side by side: the range is the point.
 * Internal work uses procedural covers (no screenshots); personal work shows the real thing with links.
 */
export default function WorkGrid({ projects, blurs, total }: { projects: Project[]; blurs: Record<string, string>; total: number }) {
  const featured = projects.filter((p) => p.featured)
  return (
    <section id="work" className="work" data-scene="graph" aria-labelledby="work-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <div className="work__head grid12">
          <p className="section-label mono work__label">
            <span>[ 01 ]</span> <span>Selected work</span>
          </p>
          <Reveal as="h2" variant="wdth" id="work-title" className="display work__title">
            Products I&apos;ve <em className="serif">shipped</em>
          </Reveal>
          <div className="work__note">
            <p>
              Internal systems for a multi-brand cloud kitchen next to things I built on my own. The internal ones are shown as illustrations, never
              screenshots.
            </p>
            <Link className="link-arrow" href="/work" data-cursor="All">
              All {total} projects →
            </Link>
          </div>
        </div>

        <ol className="wgrid">
          {featured.map((p, i) => (
            <Card key={p.slug} p={p} i={i} total={featured.length} blur={p.cover ? blurs[p.cover] : undefined} />
          ))}
        </ol>
      </div>
    </section>
  )
}
