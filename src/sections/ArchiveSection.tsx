import Reveal from '@/components/Reveal'
import { hashSlug } from '@/content/derive'
import type { Project } from '@/content/schema'
import ArchivePreview from './ArchivePreview'

/** Everything that is not in the big gallery: other personal projects, plus internal work as link-free rows. */
export default function ArchiveSection({ projects }: { projects: Project[] }) {
  const rows = projects.filter((p) => !(p.kind === 'personal' && p.featured)).sort((a, b) => b.year - a.year || a.order - b.order)
  const previews = Object.fromEntries(
    rows.map((p) => [p.slug, { title: p.title, src: p.cover, hue: Math.round(hashSlug(p.slug) * 360), ang: Math.round(hashSlug(p.slug + 'a') * 90 + 120) }]),
  )
  return (
    <section id="archive" className="archive" aria-labelledby="archive-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <div className="archive__head grid12">
          <p className="section-label mono archive__label">
            <span>[ 02 ]</span> <span>Archive</span>
          </p>
          <Reveal as="h2" variant="wdth" id="archive-title" className="display archive__title">
            Everything <em className="serif">else</em>
          </Reveal>
        </div>

        <div className="archive__table" role="table" aria-label="All other projects">
          <div className="archive__row archive__row--head mono muted" role="row">
            <span role="columnheader">Year</span>
            <span role="columnheader">Project</span>
            <span role="columnheader" className="archive__stack">Stack</span>
            <span role="columnheader" className="archive__links">Links</span>
          </div>
          {rows.map((p) => (
            <div key={p.slug} className="archive__row" role="row" data-project={p.slug} data-preview={p.slug}>
              <span role="cell" className="mono muted archive__year">{p.year}</span>
              <span role="cell" className="archive__name">
                <a href={`/work/${p.slug}`} data-wipe={p.title} data-cursor="View">
                  {p.title}
                </a>
                {p.kind === 'internal' && <span className="badge badge--sm mono">Internal</span>}
              </span>
              <span role="cell" className="mono muted archive__stack">{p.stack.slice(0, 4).join(' · ')}</span>
              <span role="cell" className="mono archive__links">
                {p.kind === 'personal' && p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                    Live ↗<span className="sr-only"> ({p.title}, opens in a new tab)</span>
                  </a>
                )}
                {p.kind === 'personal' && p.repoUrl && (
                  <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                    Code ↗<span className="sr-only"> ({p.title}, opens in a new tab)</span>
                  </a>
                )}
                {p.kind === 'internal' && <span className="muted">Confidential</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
      <ArchivePreview previews={previews} />
    </section>
  )
}
