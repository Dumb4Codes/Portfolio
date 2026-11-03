'use client'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

/** The ledger "balance line": a hairline that draws down the timeline as you scroll (scrubbed). */
export default function BalanceLine() {
  const ref = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion() || !ref.current) return
    gsap.fromTo(
      ref.current,
      { scaleY: 0 },
      { scaleY: 1, ease: 'none', scrollTrigger: { trigger: ref.current.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } },
    )
  })
  return <span ref={ref} className="timeline__line" aria-hidden="true" />
}
