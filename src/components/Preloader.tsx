'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * First visit per session only, 1.6s at most, skippable with any key or click.
 * The counter follows real readiness (fonts, then the particle canvas) with a hard timeout.
 * Whether it shows is decided before paint by the boot script (class `preload` on <html>).
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    if (!html.classList.contains('preload')) {
      window.dispatchEvent(new Event('intro:done'))
      return
    }
    const state = { v: 0 }
    let finished = false
    const render = () => {
      if (num.current) num.current.textContent = String(Math.round(state.v)).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`
    }
    const finish = () => {
      if (finished) return
      finished = true
      try {
        sessionStorage.setItem('pre', '1')
      } catch {
        /* private mode */
      }
      gsap.to(state, { v: 100, duration: 0.2, onUpdate: render })
      gsap.to(root.current, {
        yPercent: -100,
        duration: 0.9,
        delay: 0.2,
        ease: 'power3.inOut',
        onComplete: () => {
          html.classList.remove('preload')
          window.dispatchEvent(new Event('intro:done'))
        },
      })
    }

    let fontsDone = false
    let glDone = false
    const target = () => (fontsDone ? 50 : 8) + (glDone ? 50 : 0)
    const step = () => {
      gsap.to(state, { v: Math.min(target(), 99), duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: render })
      if (fontsDone && glDone) finish()
    }
    document.fonts.ready.then(() => ((fontsDone = true), step()))
    const onGl = () => ((glDone = true), step())
    window.addEventListener('gl:ready', onGl, { once: true })
    const timeout = setTimeout(finish, 1600)
    step()
    const skip = () => finish()
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('gl:ready', onGl)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [])

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div ref={bar} className="preloader__bar" />
      <span ref={num} className="preloader__num mono">
        000
      </span>
      <span className="preloader__label mono">Loading the ledger</span>
    </div>
  )
}
