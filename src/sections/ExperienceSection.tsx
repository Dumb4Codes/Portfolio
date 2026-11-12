import Reveal from '@/components/Reveal'
import { dateRange } from '@/content/derive'
import type { Experience, Profile, Project } from '@/content/schema'
import BalanceLine from './BalanceLine'

export default function ExperienceSection({ jobs, projects, education }: { jobs: Experience[]; projects: Project[]; education: Profile['education'] }) {
  const title = new Map(projects.map((p) => [p.slug, p.title]))
  return (
    <section id="experience" className="experience" aria-labelledby="exp-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <div className="exp__head grid12">
          <p className="section-label mono exp__label">
            <span>[ 03 ]</span> <span>Experience</span>
          </p>
          <Reveal as="h2" variant="wdth" id="exp-title" className="display exp__title">
            Where I&apos;ve <em className="serif">worked</em>
          </Reveal>
        </div>

        <ol className="timeline">
          <BalanceLine />
          {jobs.map((j) => (
            <li key={j.slug} className="entry">
              <Reveal variant="rise" className="entry__inner grid12">
                <p className="mono entry__date">{dateRange(j.start, j.end)}</p>
                <div className="entry__main">
                  <h3 className="display entry__company">
                    {j.url ? (
                      <a href={j.url} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                        {j.company}
                      </a>
                    ) : (
                      j.company
                    )}
                    {j.companyNote && <span className="mono muted entry__note">{j.companyNote}</span>}
                  </h3>
                  <p className="entry__role serif">{j.role}</p>
                  <p className="mono muted entry__where">
                    {j.location} · {j.mode}
                  </p>
                  <p className="entry__summary">{j.summary}</p>

                  {j.highlights.length > 0 && (
                    <details className="entry__details">
                      <summary className="mono" data-cursor="Open">
                        <span className="entry__plus" aria-hidden="true" />
                        Highlights ({j.highlights.length})
                      </summary>
                      <ul>
                        {j.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  <ul className="chips" aria-label="Stack">
                    {j.stack.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>

                  {j.projects.length > 0 && (
                    <p className="entry__cases mono">
                      <span className="muted">Case studies</span>
                      {j.projects.map((s) => (
                        <a key={s} href={`/work/${s}`} data-wipe={title.get(s)} data-project={s} data-cursor="View">
                          {title.get(s)} →
                        </a>
                      ))}
                    </p>
                  )}
                </div>
              </Reveal>
            </li>
          ))}

          <li className="entry entry--edu">
            <div className="entry__inner grid12">
              <p className="mono entry__date">{education.years}</p>
              <div className="entry__main">
                <h3 className="entry__edu-title">{education.degree}</h3>
                <p className="mono muted">{education.school}</p>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  )
}
