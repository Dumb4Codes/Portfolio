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
      // the motion engine broadcasts progress; until its first message the finished state stays
      const on = (e: Event) => {
        const p = (e as CustomEvent<number>).detail
        setStep(Math.min(steps, Math.round(p * steps)))
      }
      host.addEventListener('chapter-progress', on)
      return () => host.removeEventListener('chapter-progress', on)
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
