'use client'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'
import { frameLoop } from '@/lib/tween'

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
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let seen = false
    const loop = frameLoop(() => {
      pos.x += (target.x - pos.x) * 0.2
      pos.y += (target.y - pos.y) * 0.2
      if (ring.current) ring.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`
      return Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1
    })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      root.classList.add('cursor-on')
      target.x = e.clientX
      target.y = e.clientY
      if (!seen) {
        seen = true
        pos.x = e.clientX
        pos.y = e.clientY
      }
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`
      loop.wake()
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
      loop.stop()
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
