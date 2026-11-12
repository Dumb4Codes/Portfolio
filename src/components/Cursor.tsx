'use client'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'

/**
 * Custom pointer in the site's own language: the same arrow the intro's agents use, snapped to the mouse
 * with no lag, plus a small accent tag with the verb when the pointer is over a `data-cursor` target
 * (View, Open ↗, Copy…). It shrinks on press, hands back to the native I-beam over text fields, and the
 * system cursor returns as soon as the keyboard is used. Fine pointers only; nothing under reduced motion.
 */
const TEXT = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
const ACTIVE = 'a[href], button, summary, label, [role="button"], [data-cursor]'

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const html = document.documentElement
    const el = root.current!
    let verb = ''

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      html.classList.add('cursor-on')
      el.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`
      const t = e.target as Element | null
      const text = Boolean(t?.closest?.(TEXT))
      const hit = t?.closest?.(ACTIVE) as HTMLElement | null
      const v = hit?.dataset.cursor ?? ''
      el.classList.toggle('is-text', text)
      el.classList.toggle('is-active', Boolean(hit) && !text)
      if (v !== verb) {
        verb = v
        if (tag.current) tag.current.textContent = v
        el.classList.toggle('has-tag', Boolean(v))
      }
    }
    const down = (e: PointerEvent) => e.pointerType !== 'touch' && el.classList.add('is-press')
    const up = () => el.classList.remove('is-press')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Escape') html.classList.remove('cursor-on')
    }
    const onLeave = () => html.classList.remove('cursor-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      html.classList.remove('cursor-on')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="cursor">
      <div ref={root} className="cursor__ptr">
        <svg className="cursor__arrow" viewBox="0 0 20 20" width="20" height="20">
          <path d="M3 2.5 16.5 9.6 10.3 11.2 7.8 17.2 3 2.5Z" />
        </svg>
        <span ref={tag} className="cursor__tag mono-sm" />
      </div>
    </div>
  )
}
