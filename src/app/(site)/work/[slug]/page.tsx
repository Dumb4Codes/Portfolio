import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GeneratedCover } from '@/components/Cover'
import Cover from '@/components/Cover'
import Metrics from '@/components/Metrics'
import { getProject, getSiteData } from '@/content/reader'
import { blurMap } from '@/lib/blur'
import { SITE_URL } from '@/lib/site'
import Gallery from '@/sections/Gallery'
import NextProject from '@/sections/NextProject'
import { InternalVisual } from '@/sections/WorkSection'

export const dynamicParams = false

export async function generateStaticParams() {
  const { projects } = await getSiteData()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProject(slug)
  if (!p) return {}
  const { profile } = await getSiteData()
  const title = `${p.title} · ${profile.name}`
  const description = p.tagline || p.summary || `${p.title}, a project by ${profile.name}.`
  return {
    title,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/work/${slug}`, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { projects, profile } = await getSiteData()
  const idx = projects.findIndex((p) => p.slug === slug)
  if (idx < 0) notFound()
  const p = projects[idx]
  const next = projects[(idx + 1) % projects.length]
  const internal = p.kind === 'internal'
  const blurs = await blurMap([p.cover, ...p.gallery.map((g) => g.src)])
  const gallery = p.gallery.map((g) => ({ ...g, blur: blurs[g.src] }))

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary ?? p.tagline,
    dateCreated: String(p.year),
    inLanguage: 'en',
    url: `${SITE_URL}/work/${p.slug}`,
    creator: { '@type': 'Person', name: profile.name, url: SITE_URL },
    keywords: p.stack.join(', '),
  }

  const meta: [string, string][] = [
    ['Role', p.role],
    ['Year', String(p.year)],
    ...(p.company ? ([['Company', p.company]] as [string, string][]) : []),
    ['Stack', p.stack.slice(0, 5).join(' · ')],
  ].filter(([, v]) => v) as [string, string][]

  const index = String(idx + 1).padStart(2, '0')

  return (
    <article className="cs">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

      <header className="cs__hero">
        <div className="wrap">
          <p className="mono cs__crumb">
            <Link href="/work" data-cursor="Back">← All work</Link>
            <span className="muted">[ {index} ]</span>
            {internal ? <span className="badge">Internal · Confidential</span> : <span className="badge badge--ghost">Personal</span>}
          </p>
          <h1 className="display cs__title">{p.title}</h1>
          {p.tagline && <p className="serif cs__tagline">{p.tagline}</p>}

          <dl className="cs__meta mono">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {!internal && (p.liveUrl || p.repoUrl) && (
            <div className="cs__links">
              {p.liveUrl && (
                <a className="btn btn-accent" href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                  Live site ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {p.repoUrl && (
                <a className="btn" href={p.repoUrl} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                  Code ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="cs__cover wrap" aria-label={internal ? 'Illustration' : 'Cover'}>
        {internal ? (
          <div className="cs__visual">
            <InternalVisual project={p} standalone />
          </div>
        ) : (
          <div className="cs__frame">
            <div className="cs__frame-inner">
              {p.cover ? (
                <Cover src={p.cover} alt={`${p.title} cover screenshot`} title={p.title} slug={p.slug} sizes="(min-width: 1024px) 92vw, 100vw" blur={p.cover ? blurs[p.cover] : undefined} priority />
              ) : (
                <GeneratedCover title={p.title} slug={p.slug} />
              )}
            </div>
          </div>
        )}
      </section>

      <div className="wrap cs__body">
        {p.summary && (
          <div className="cs__block cs__summary">
            <p className="prose lead">{p.summary}</p>
          </div>
        )}

        {p.problem && (
          <section className="cs__block" aria-labelledby="cs-problem">
            <h2 id="cs-problem" className="mono muted cs__label">
              01 · Problem
            </h2>
            <div className="prose">
              <p>{p.problem}</p>
            </div>
          </section>
        )}

        {p.metrics.length > 0 && (
          <section className="cs__metrics" aria-label="Key numbers">
            <Metrics items={p.metrics} large />
          </section>
        )}

        {p.approach.length > 0 && (
          <section className="cs__block" aria-labelledby="cs-approach">
            <h2 id="cs-approach" className="mono muted cs__label">
              02 · Approach
            </h2>
            <ol className="prose cs__list">
              {p.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </section>
        )}

        {p.myWork.length > 0 && (
          <section className="cs__block" aria-labelledby="cs-work">
            <h2 id="cs-work" className="mono muted cs__label">
              03 · What I did
            </h2>
            <ul className="prose cs__list cs__list--bullets">
              {p.myWork.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        {p.outcome && (
          <section className="cs__block" aria-labelledby="cs-outcome">
            <h2 id="cs-outcome" className="mono muted cs__label">
              04 · Outcome
            </h2>
            <div className="prose">
              <p>{p.outcome}</p>
            </div>
          </section>
        )}

        {p.nextSteps.length > 0 && (
          <section className="cs__block" aria-labelledby="cs-next">
            <h2 id="cs-next" className="mono muted cs__label">
              Next up
            </h2>
            <ul className="prose cs__list cs__list--bullets">
              {p.nextSteps.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="cs__block" aria-label="Stack">
          <h2 className="mono muted cs__label">Stack</h2>
          <ul className="chips">
            {p.stack.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {gallery.length > 1 && (
        <section className="cs__gallery" aria-labelledby="cs-gallery">
          <div className="wrap">
            <h2 id="cs-gallery" className="mono muted cs__label">
              Screens
            </h2>
          </div>
          <Gallery items={gallery} title={p.title} />
        </section>
      )}

      <div className="wrap cs__next">
        <NextProject slug={next.slug} title={next.title} tagline={next.tagline} />
      </div>
    </article>
  )
}
