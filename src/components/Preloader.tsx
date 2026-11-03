'use client'
import { useEffect, useRef } from 'react'
import { tween } from '@/lib/tween'

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
    let value = 0
    let finished = false
    let cancel = () => {}
    const render = (v: number) => {
      value = v
      if (num.current) num.current.textContent = String(Math.round(v)).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`
    }
    const to = (v: number, ms: number) => {
      cancel()
      cancel = tween(value, v, ms, render)
    }
    const finish = () => {
      if (finished) return
      finished = true
      try {
        sessionStorage.setItem('pre', '1')
      } catch {
        /* private mode */
      }
      to(100, 200)
      const anim = root.current?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], {
        duration: 900,
        delay: 200,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'forwards',
      })
      const done = () => {
        html.classList.remove('preload')
        window.dispatchEvent(new Event('intro:done'))
      }
      if (anim) anim.finished.then(done, done)
      else done()
    }

    let fontsDone = false
    let glDone = false
    const step = () => {
      to(Math.min((fontsDone ? 50 : 8) + (glDone ? 50 : 0), 99), 500)
      if (fontsDone && glDone) finish()
    }
    void document.fonts.ready.then(() => {
      fontsDone = true
      step()
    })
    const onGl = () => {
      glDone = true
      step()
    }
    window.addEventListener('gl:ready', onGl, { once: true })
    const timeout = setTimeout(finish, 1600)
    step()
    const skip = () => finish()
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      clearTimeout(timeout)
      cancel()
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
