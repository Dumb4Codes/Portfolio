'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ParticleEngine } from './engine'
import StaticScene from './StaticScene'

/** Particle count: 40k on capable desktops, 8k on phones, halved once if the FPS probe fails. */
function initialCount() {
  try {
    const forced = Number(sessionStorage.getItem('particles')) // dev / QA switch: sessionStorage.particles = 40000
    if (forced >= 1000) return forced
  } catch {
    /* storage unavailable */
  }
  const mobile = window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(pointer: coarse)').matches
  if (mobile) return 8000
  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
  return weak ? 24000 : 40000
}

/** The persistent canvas. Mounted once in the site layout; survives route changes. */
export default function GLRoot() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [count, setCount] = useState<number | null>(null)
  const [base, setBase] = useState<number | null>(null)
  const [lost, setLost] = useState(false)

  // the hero shape is sampled from the display font, so wait for it before choosing a count
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await document.fonts.ready
        await document.fonts.load('800 120px ' + getComputedStyle(document.body).fontFamily)
      } catch {
        /* fonts API missing: sample with the fallback face */
      }
      if (!alive) return
      const n = initialCount()
      setBase(n)
      setCount(n)
    })()
    return () => {
      alive = false
    }
  }, [])

  // halve once at most; a second halving would mean the probe is measuring the page, not the GPU
  const onSlow = useCallback(() => setCount((c) => (c !== null && c === base && c > 6000 ? Math.floor(c / 2) : c)), [base])

  useEffect(() => {
    if (!count || !canvas.current) return
    const engine = new ParticleEngine({
      canvas: canvas.current,
      count,
      onReady: () => {
        document.documentElement.dataset.gl = 'on'
        window.dispatchEvent(new Event('gl:ready'))
      },
      onSlow,
      onLost: () => setLost(true),
    })
    return () => engine.dispose()
  }, [count, onSlow])

  useEffect(() => {
    if (lost) delete document.documentElement.dataset.gl
  }, [lost])

  if (lost) return <StaticScene />
  return (
    <div className="gl-layer" aria-hidden="true">
      {/* key: a halved count needs a fresh canvas (a canvas cannot hand its context to a new renderer) */}
      <canvas key={count ?? 0} ref={canvas} />
    </div>
  )
}
