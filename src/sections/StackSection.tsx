'use client'
import { useEffect, useState } from 'react'
import Reveal from '@/components/Reveal'
import Link from 'next/link'

type Group = { name: string; items: string[] }

/**
 * Not a logo wall. Grouped mono lists; pointing at (or tapping) a skill highlights every project
 * that uses it elsewhere on the page and shows the count. Usage is derived from projects' stack arrays.
 */
export default function StackSection({ groups, usage, titles }: { groups: Group[]; usage: Record<string, string[]>; titles: Record<string, string> }) {
  const [active, setActive] = useState<string | null>(null)
  const slugs = active ? (usage[active] ?? []) : []

  useEffect(() => {
    const set = new Set(slugs)
    document.querySelectorAll<HTMLElement>('[data-project]').forEach((el) => {
      const on = set.has(el.dataset.project!)
      if (active) el.dataset.hl = on ? '1' : '0'
      else delete el.dataset.hl
    })
    return () => {
      document.querySelectorAll<HTMLElement>('[data-project]').forEach((el) => delete el.dataset.hl)
    }
  }, [active, slugs])

  return (
    <section id="stack" className="stack" aria-labelledby="stack-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <div className="stack__head grid12">
          <p className="section-label mono stack__label">
            <span>[ 05 ]</span> <span>Stack</span>
          </p>
          <h2 id="stack-title" className="display stack__title">
            What I <em className="serif">reach for</em>
          </h2>
          <p className="stack__hint mono muted">Point at a skill to see where it is used.</p>
        </div>

        <div className="stack__groups">
          {groups.map((g) => (
            <div key={g.name} className="stack__group">
              <h3 className="mono muted">{g.name}</h3>
              <ul>
                {g.items.map((s) => {
                  const n = usage[s]?.length ?? 0
                  return (
                    <li key={s}>
                      <button
                        type="button"
                        className="skill"
                        aria-pressed={active === s}
                        data-used={n > 0}
                        onMouseEnter={() => setActive(s)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(s)}
                        onBlur={() => setActive(null)}
                        onClick={() => setActive((a) => (a === s ? null : s))}
                      >
                        {s}
                        {n > 0 && <sup className="mono">{n}</sup>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="stack__readout mono" role="status" aria-live="polite">
          {active ? (
            slugs.length ? (
              <>
                <span className="accent">{active}</span> used in {slugs.length} {slugs.length === 1 ? 'project' : 'projects'}:{' '}
                {slugs.map((s, i) => (
                  <span key={s}>
                    <Link href={`/work/${s}`} data-wipe={titles[s]}>
                      {titles[s]}
                    </Link>
                    {i < slugs.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </>
            ) : (
              <>
                <span className="accent">{active}</span> is not in a listed project yet.
              </>
            )
          ) : (
            <span className="muted">Numbers show how many projects use each skill.</span>
          )}
        </div>
      </div>
    </section>
  )
}
