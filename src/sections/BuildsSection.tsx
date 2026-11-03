import Link from 'next/link'
import Cover from '@/components/Cover'
import Reveal from '@/components/Reveal'
import type { Project } from '@/content/schema'
import BuildsGallery from './BuildsGallery'

async function Card({ p, i, total }: { p: Project; i: number; total: number }) {
  return (
    <li className="build" data-project={p.slug}>
      <Reveal variant="clip" className="build__media" start="top 92%">
        <Link href={`/work/${p.slug}`} tabIndex={-1} aria-hidden="true" data-cursor="View" data-wipe={p.title} className="build__img">
          <Cover src={p.cover} alt="" title={p.title} slug={p.slug} sizes="(min-width: 1024px) 46vw, 92vw" />
          <span className="build__lens" />
        </Link>
      </Reveal>
      <div className="build__body">
        <p className="mono muted build__meta">
          <span>{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <span>{p.year}</span>
        </p>
        <h3 className="display build__title">
          <Link href={`/work/${p.slug}`} data-wipe={p.title} data-cursor="View">
            {p.title}
          </Link>
        </h3>
        <p className="build__tag">{p.tagline}</p>
        <ul className="chips" aria-label="Stack">
          {p.stack.slice(0, 3).map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <div className="build__links">
          {p.liveUrl && (
            <a className="btn btn-accent" href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
              Live ↗<span className="sr-only"> ({p.title}, opens in a new tab)</span>
            </a>
          )}
          {p.repoUrl && (
            <a className="btn" href={p.repoUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
              Code ↗<span className="sr-only"> ({p.title}, opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </li>
  )
}

export default function BuildsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.kind === 'personal' && p.featured)
  return (
    <section id="builds" className="builds" aria-labelledby="builds-title">
      <div className="wrap builds__head">
        <Reveal variant="rule" className="rule" />
        <div className="builds__head-grid grid12">
          <p className="section-label mono builds__label">
            <span>[ 02 ]</span> <span>Personal builds</span>
          </p>
          <h2 id="builds-title" className="display builds__title">
            Things I built to learn and <em className="serif">ship</em> end to end.
          </h2>
        </div>
      </div>
      <BuildsGallery count={featured.length}>
        {featured.map((p, i) => (
          <Card key={p.slug} p={p} i={i} total={featured.length} />
        ))}
      </BuildsGallery>
    </section>
  )
}
