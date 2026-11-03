import Metrics from '@/components/Metrics'
import Reveal from '@/components/Reveal'
import type { Project } from '@/content/schema'
import ChapterShell from './ChapterShell'
import LedgerVisual from './visuals/LedgerVisual'
import PayrollVisual from './visuals/PayrollVisual'
import RouteVisual from './visuals/RouteVisual'

const SCENE = { ledger: 'ledger', payroll: 'clock', route: 'route' } as const

export function InternalVisual({ project, standalone = false }: { project: Project; standalone?: boolean }) {
  if (project.visual === 'ledger') return <LedgerVisual example={project.illustrativeExample} />
  if (project.visual === 'payroll') return <PayrollVisual standalone={standalone} />
  if (project.visual === 'route') return <RouteVisual standalone={standalone} />
  return null
}

export default function WorkSection({ projects, company }: { projects: Project[]; company: string }) {
  const chapters = projects.filter((p) => p.kind === 'internal' && p.featured && p.visual !== 'none')
  return (
    <section id="work" className="work" aria-labelledby="work-title">
      <div className="wrap work__intro">
        <Reveal variant="rule" className="rule" />
        <div className="work__intro-grid grid12">
          <p className="section-label mono work__label">
            <span>[ 01 ]</span> <span>Selected work</span>
          </p>
          <Reveal as="h2" variant="wdth" id="work-title" className="display work__title">
            Shipped at <em className="serif">{company}</em>
          </Reveal>
          <div className="work__intro-note">
            <p>
              A multi-brand cloud kitchen in Bengaluru. These are internal systems, so the visuals are illustrative and the data is sample data.
            </p>
            <p className="badge mono">Internal · Confidential</p>
          </div>
        </div>
      </div>

      {chapters.map((p, i) => (
        <ChapterShell key={p.slug} scene={SCENE[p.visual as keyof typeof SCENE]}>
          <div className="wrap chapter__grid">
            <div className="chapter__text">
              <p className="mono muted chapter__index">
                {String(i + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
              </p>
              <h3 className="display chapter__title" data-project={p.slug}>{p.title}</h3>
              <p className="serif chapter__tagline">{p.tagline}</p>
              <Metrics items={p.metrics.slice(0, 4)} />
              <ul className="chips" aria-label="Stack">
                {p.stack.slice(0, 7).map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
              <a href={`/work/${p.slug}`} className="link-arrow" data-cursor="Open" data-wipe={p.title}>
                Read case study →
              </a>
            </div>
            <div className="chapter__visual">
              <InternalVisual project={p} />
            </div>
          </div>
        </ChapterShell>
      ))}
    </section>
  )
}
