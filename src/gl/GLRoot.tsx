'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Particles from './Particles'
import StaticScene from './StaticScene'

/** Particle count: 40k on capable desktops, 8k on phones, halved if the 1s FPS probe fails. */
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

/** The persistent canvas. Mounted once in the root site layout; survives route changes. */
export default function GLRoot() {
  const [count, setCount] = useState<number | null>(null)
  const [lost, setLost] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // The hero shape is sampled from the display font, so wait for it.
      try {
        await document.fonts.ready
        await document.fonts.load('800 120px ' + getComputedStyle(document.body).fontFamily)
      } catch {
        /* fonts API missing: sample with the fallback face */
      }
      if (!alive) return
      setMobile(window.matchMedia('(max-width: 767px)').matches)
      setCount(initialCount())
    })()
    return () => {
      alive = false
    }
  }, [])

  const onReady = useCallback(() => {
    document.documentElement.dataset.gl = 'on'
    window.dispatchEvent(new Event('gl:ready'))
  }, [])
  const initial = useRef(0)
  if (count && !initial.current) initial.current = count
  // halve once at most; a second halving would mean the probe is measuring the page, not the GPU
  const onSlow = useCallback(() => setCount((c) => (c && c === initial.current && c > 6000 ? Math.floor(c / 2) : c)), [])

  useEffect(() => {
    if (lost) delete document.documentElement.dataset.gl
  }, [lost])

  if (lost) return <StaticScene />
  if (!count) return null

  return (
    <div className="gl-layer" aria-hidden="true">
      <Canvas
        key={count}
        frameloop="demand"
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ fov: 35, near: 1, far: 8000 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: false }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setLost(true)
          })
        }}
      >
        <Particles count={count} onReady={onReady} onSlow={onSlow} />
      </Canvas>
    </div>
  )
}
