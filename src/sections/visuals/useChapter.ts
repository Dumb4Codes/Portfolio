'use client'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'
import { tween } from '@/lib/tween'

/**
 * Drives an illustration by steps (0..steps). Inside a pinned chapter it follows scroll progress
 * (scrubbed, so it reverses). Elsewhere (case study) it plays once when scrolled into view.
 * The server and no-JS render shows the finished state.
 */
export function useChapter<T extends HTMLElement>(steps: number, duration = 6) {
  const ref = useRef<T>(null)
  const [step, setStep] = useState(steps)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const host = el.closest('[data-chapter]')

    if (host) {
      // Desktop: the motion engine pins the chapter and broadcasts its progress (until its first
      // message the finished state stays).
      // Stacked layouts (phones/tablets) do not pin, and the chapter's progress spans the text above
      // the picture, so the picture would already be finished when it scrolls into view. There the
      // picture follows its own position on screen instead (still scrubbed, so it reverses).
      const stacked = window.matchMedia('(max-width: 1023px)')
      const on = (e: Event) => {
        if (stacked.matches) return
        const p = (e as CustomEvent<number>).detail
        setStep(Math.min(steps, Math.round(p * steps)))
      }
      let raf = 0
      const follow = () => {
        if (!stacked.matches) return
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect()
          const vh = window.innerHeight
          const start = vh * 0.8 // picture's top edge is 80% of the way down the screen
          const end = Math.min(vh * 0.4, vh * 0.92 - r.height) // its bottom edge is nearly on screen
          const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(150, start - end)))
          setStep(Math.min(steps, Math.round(p * steps)))
        })
      }
      host.addEventListener('chapter-progress', on)
      window.addEventListener('scroll', follow, { passive: true })
      window.addEventListener('resize', follow)
      follow()
      return () => {
        cancelAnimationFrame(raf)
        host.removeEventListener('chapter-progress', on)
        window.removeEventListener('scroll', follow)
        window.removeEventListener('resize', follow)
      }
    }

    let cancel = () => {}
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        setStep(0)
        cancel = tween(0, steps, duration * 1000, (v) => setStep(Math.round(v)), (t) => t)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancel()
    }
  }, [steps, duration])

  return { ref, step }
}
