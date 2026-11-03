'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

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
    setStep(0)

    if (host) {
      const on = (e: Event) => {
        const p = (e as CustomEvent<number>).detail
        setStep(Math.min(steps, Math.round(p * steps)))
      }
      host.addEventListener('chapter-progress', on)
      return () => host.removeEventListener('chapter-progress', on)
    }

    let tween: gsap.core.Tween | undefined
    const proxy = { v: 0 }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        tween = gsap.to(proxy, { v: steps, duration, ease: 'none', onUpdate: () => setStep(Math.round(proxy.v)) })
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      tween?.kill()
    }
  }, [steps, duration])

  return { ref, step }
}
