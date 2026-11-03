'use client'
import { useRef } from 'react'
import { formatMetric, parseMetric } from '@/content/derive'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

type M = { value: string; label: string }

/** Mono counters. Server markup shows the final value; on enter the number counts up from zero. */
export default function Metrics({ items, className = '', large = false }: { items: M[]; className?: string; large?: boolean }) {
  const root = useRef<HTMLDListElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return
      root.current.querySelectorAll<HTMLElement>('[data-metric]').forEach((el) => {
        const parsed = parseMetric(el.dataset.metric!)
        if (parsed.value === null) return
        const proxy = { v: 0 }
        el.textContent = formatMetric(parsed, 0)
        gsap.to(proxy, {
          v: parsed.value,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = formatMetric(parsed, proxy.v)),
          onComplete: () => (el.textContent = parsed.raw),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })
    },
    { scope: root },
  )

  if (!items.length) return null
  return (
    <dl ref={root} className={`metrics ${large ? 'metrics--lg' : ''} ${className}`}>
      {items.map((m) => (
        <div key={m.label} className="metric">
          <dt className="mono muted">{m.label}</dt>
          <dd className="metric__value mono" data-metric={m.value}>
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
