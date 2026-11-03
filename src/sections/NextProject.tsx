'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'

const THRESHOLD = 700 // wheel / touch distance past the end of the page

/**
 * Bottom of a case study: the next project's title. A ring fills as you scroll toward it and, if you
 * keep pushing past the end of the page, it opens the project. Also a normal link (keyboard, click, no JS).
 */
export default function NextProject({ slug, title, tagline }: { slug: string; title: string; tagline: string }) {
  const root = useRef<HTMLAnchorElement>(null)
  const [pushed, setPushed] = useState(0)
  const acc = useRef(0)
  const fired = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const atEnd = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    const push = (d: number) => {
      if (fired.current || !atEnd()) {
        acc.current = Math.max(0, acc.current - 4)
        return
      }
      acc.current = Math.min(THRESHOLD, Math.max(0, acc.current + d))
      setPushed(acc.current / THRESHOLD)
      if (acc.current >= THRESHOLD) {
        fired.current = true
        root.current?.click()
      }
    }
    const onWheel = (e: WheelEvent) => push(e.deltaY)
    let ty = 0
    const onStart = (e: TouchEvent) => (ty = e.touches[0].clientY)
    const onMove = (e: TouchEvent) => {
      push((ty - e.touches[0].clientY) * 2)
      ty = e.touches[0].clientY
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    const decay = setInterval(() => {
      if (acc.current > 0 && !fired.current) {
        acc.current = Math.max(0, acc.current - 40)
        setPushed(acc.current / THRESHOLD)
      }
    }, 120)
    return () => {
      clearInterval(decay)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  return (
    <Link ref={root} href={`/work/${slug}`} className="next" data-wipe={title} data-cursor="Next">
      <span className="mono muted">Next project</span>
      <span className="next__row">
        <span className="display next__title">{title}</span>
        <svg className="next__ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="20" className="next__ring-bg" />
          <circle data-next-ring cx="22" cy="22" r="20" pathLength="100" className="next__ring-fg" strokeDasharray="100" strokeDashoffset="100" />
          <circle cx="22" cy="22" r="20" pathLength="100" className="next__ring-push" strokeDasharray="100" strokeDashoffset={100 - pushed * 100} />
          <path d="M14 22h16M24 16l6 6-6 6" className="next__arrow" />
        </svg>
      </span>
      <span className="serif next__tag">{tagline}</span>
    </Link>
  )
}
