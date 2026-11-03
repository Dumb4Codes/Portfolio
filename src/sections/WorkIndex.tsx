'use client'
import Link from 'next/link'
import { useState } from 'react'

type Item = { slug: string; title: string; kind: 'internal' | 'personal'; year: number; tagline: string; stack: string[]; keys: string[] }
type Stack = { key: string; label: string }

/** All projects in one fast list. Filters are plain buttons; without JS the full list is shown. */
export default function WorkIndex({ items, stacks }: { items: Item[]; stacks: Stack[] }) {
  const [kind, setKind] = useState<'all' | 'internal' | 'personal'>('all')
  const [tech, setTech] = useState<string | null>(null)
  const shown = items.filter((i) => (kind === 'all' || i.kind === kind) && (!tech || i.keys.includes(tech)))

  return (
    <div className="wrap workindex">
      <header className="workindex__head">
        <p className="section-label mono">
          <span>[ All ]</span> <span>Work</span>
        </p>
        <h1 className="display workindex__title">
          Everything I have <em className="serif">built</em>
        </h1>
      </header>

      <div className="filters" role="group" aria-label="Filters">
        <div className="filters__row">
          {(['all', 'internal', 'personal'] as const).map((k) => (
            <button key={k} type="button" className="chip chip--btn" aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k === 'all' ? 'All' : k === 'internal' ? 'Internal' : 'Personal'}
            </button>
          ))}
        </div>
        <div className="filters__row">
          {stacks.map((s) => (
            <button key={s.key} type="button" className="chip chip--btn" aria-pressed={tech === s.key} onClick={() => setTech((t) => (t === s.key ? null : s.key))}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="mono muted" role="status" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      <ol className="workindex__list">
        {shown.map((p) => (
          <li key={p.slug} className="workindex__item" data-project={p.slug}>
            <Link href={`/work/${p.slug}`} data-wipe={p.title} data-cursor="View">
              <span className="mono muted workindex__year">{p.year}</span>
              <span className="display workindex__name">{p.title}</span>
              <span className="workindex__tag">{p.tagline}</span>
              <span className="mono muted workindex__stack">{p.stack.join(' · ')}</span>
              <span className="mono workindex__kind">{p.kind === 'internal' ? 'Internal' : 'Personal'}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
