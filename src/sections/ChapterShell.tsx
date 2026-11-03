'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { chapterLocal } from '@/lib/chapter'

/**
 * One SKOPE chapter. The wrapper carries `data-scene` (the particle director reads it) and broadcasts
 * its progress, so overlays and shader accents move together. Desktop: pinned for ~150vh. Mobile: stacked.
 */
export default function ChapterShell({ scene, children }: { scene: 'ledger' | 'clock' | 'route'; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const chapter = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const w = wrap.current!
      const broadcast = () => {
        const r = w.getBoundingClientRect()
        const vh = window.innerHeight
        const p = chapterLocal(vh / 2 - r.top, 0, r.height) // = chapterLocal(center, top, height) in wrapper space
        w.style.setProperty('--p', p.toFixed(4))
        w.dispatchEvent(new CustomEvent('chapter-progress', { detail: p }))
      }
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)', () => {
        ScrollTrigger.create({ trigger: chapter.current, start: 'top top', end: '+=150%', pin: true, pinSpacing: true, anticipatePin: 1 })
      })
      const st = ScrollTrigger.create({ trigger: w, start: 'top bottom', end: 'bottom top', onUpdate: broadcast, onRefresh: broadcast })
      broadcast()
      return () => {
        st.kill()
        mm.revert()
      }
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} className="chapter-wrap" data-scene={scene} data-chapter>
      <article ref={chapter} className="chapter">
        {children}
      </article>
    </div>
  )
}
