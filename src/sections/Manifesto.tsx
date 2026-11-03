import Reveal from '@/components/Reveal'
import { renderManifesto, stackKey } from '@/content/derive'
import type { Project, Skills } from '@/content/schema'
import Ticker from './Ticker'

/** Splits a sentence into text and its first number (e.g. "1,300+"), which is set in the accent colour. */
function Line({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,]*\+?)/)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <b key={i} className="manifesto__num accent">
            {p}
          </b>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export default function Manifesto({ template, total, projects, skills }: { template: string; total: number; projects: Project[]; skills: Skills }) {
  const full = renderManifesto(template, total)
  const sentences = full.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [full]

  // ticker: skills that appear in at least one project, most-used first
  const counts = new Map<string, number>()
  projects.forEach((p) => p.stack.forEach((t) => counts.set(stackKey(t), (counts.get(stackKey(t)) ?? 0) + 1)))
  const items = Array.from(new Set(skills.groups.flatMap((g) => g.items)))
    .map((name) => ({ name, n: counts.get(stackKey(name.split(' / ')[0])) ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 26)
    .map((x) => x.name)

  return (
    <section className="manifesto" aria-label="In numbers">
      <div className="wrap">
        <p className="manifesto__text display">
          {sentences.map((s, i) => (
            <Reveal key={i} variant="wdth" as="span" className="manifesto__line" start="top 92%">
              <Line text={s} />
            </Reveal>
          ))}
        </p>
      </div>
      <Ticker items={items} />
    </section>
  )
}
