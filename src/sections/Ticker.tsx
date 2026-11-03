'use client'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { getLenis, prefersReducedMotion } from '@/lib/scroll'

/** Mono strip that drifts sideways and speeds up with scroll velocity. Static (wrapped) under reduced motion. */
export default function Ticker({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = track.current
      if (!el || prefersReducedMotion()) return
      let x = 0
      const tick = (_t: number, dt: number) => {
        const half = el.scrollWidth / 2
        const v = getLenis()?.velocity ?? 0
        x -= (0.045 + Math.abs(v) * 0.06) * dt
        if (x <= -half) x += half
        el.style.transform = `translate3d(${x}px,0,0)`
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: track },
  )

  const list = items.map((t) => t.toUpperCase())
  return (
    <div className="ticker">
      <div ref={track} className="ticker__track mono">
        {[0, 1].map((dup) => (
          <ul key={dup} className="ticker__set" {...(dup === 1 ? { 'aria-hidden': true } : { 'aria-label': 'Technologies I use most' })}>
            {list.map((t) => (
              <li key={t}>
                {t}
                <span aria-hidden="true"> · </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
