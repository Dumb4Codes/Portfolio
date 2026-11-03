'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

/**
 * Dot + lagging ring for fine pointers. The system cursor is only hidden while the mouse is in use:
 * any key press brings it back, and touch / reduced-motion users never get this at all.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const root = document.documentElement
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      root.classList.add('cursor-on')
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      const t = (e.target as Element | null)?.closest?.('[data-cursor], a, button, input, textarea, summary, [role=button]') as HTMLElement | null
      const text = t?.dataset.cursor ?? (t ? '' : null)
      ring.current?.classList.toggle('is-active', text !== null)
      ring.current?.classList.toggle('has-label', Boolean(text))
      if (label.current) label.current.textContent = text ?? ''
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) root.classList.remove('cursor-on')
    }
    const onLeave = () => root.classList.remove('cursor-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      root.classList.remove('cursor-on')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="cursor">
      <div ref={ring} className="cursor__ring">
        <span ref={label} className="cursor__label mono" />
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  )
}
