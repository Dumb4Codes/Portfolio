import Reveal from '@/components/Reveal'
import { renderManifesto, stackKey, type ManifestoNumbers } from '@/content/derive'
import type { Project, Skills } from '@/content/schema'
import Ticker from './Ticker'

const NUMBER_WORD = /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)$/i

/** Splits a sentence into text and its first number ("1,300+" or a leading number word), which is set in the accent colour. */
function Line({ text }: { text: string }) {
  const m = /^(\S+)(\s[\s\S]*)?$/.exec(text)
  if (m && NUMBER_WORD.test(m[1])) {
    return (
      <>
        <b className="manifesto__num accent">{m[1]}</b>
        <span>{m[2] ?? ''}</span>
      </>
    )
  }
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

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The range line: a short statement with the numbers filled in from content, then the tech ticker. */
export default function Manifesto({ template, numbers, projects, skills }: { template: string; numbers: ManifestoNumbers; projects: Project[]; skills: Skills }) {
  const full = renderManifesto(template, numbers)
  const sentences = (full.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [full]).map(sentenceCase)

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
