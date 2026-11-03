'use client'
import { useEffect, useMemo, useState } from 'react'
import { director } from './director'
import { generateScene, SCENES, type SceneKey } from './shapes'

/**
 * Fallback for reduced motion, no WebGL, context loss and low-power: the same shape generators
 * drawn as a faint SVG of dots, one group per chapter, crossfaded by scroll position. No animation loop.
 */
const SHAPES: Exclude<SceneKey, 'hero'>[] = ['ledger', 'clock', 'route', 'field', 'pin']

function dotsPath(pts: [number, number][]) {
  return pts.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join('')
}

export default function StaticScene() {
  const [size, setSize] = useState({ w: 1280, h: 800 })
  const [scene, setScene] = useState(4)

  useEffect(() => {
    const measure = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight })
      director.measure()
      setScene(director.currentScene(window.scrollY, window.innerHeight))
    }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScene(director.currentScene(window.scrollY, window.innerHeight)))
    }
    measure()
    const t = setTimeout(measure, 400) // layout settles after fonts
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('gl:layout', measure)
    return () => {
      clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('gl:layout', measure)
    }
  }, [])

  const paths = useMemo(() => {
    const n = size.w < 768 ? 900 : 1800
    return SHAPES.map((key) => {
      const sh = generateScene(key, n, size.w, size.h)
      const base: [number, number][] = []
      const hot: [number, number][] = []
      for (let i = 0; i < n; i++) {
        const a = sh.attr[i]
        const p: [number, number] = [sh.pos[i * 3], -sh.pos[i * 3 + 1]]
        const isHot =
          (key === 'clock' && a >= 0.5) || (key === 'route' && a >= 2) || (key === 'pin' && a > 0.5) || (key === 'ledger' && Math.abs(a - 0.5) < 0.04)
        ;(isHot ? hot : base).push(p)
      }
      return { key, base: dotsPath(base), hot: dotsPath(hot) }
    })
  }, [size])

  return (
    <div className="gl-layer static-scene" aria-hidden="true">
      <svg width="100%" height="100%" viewBox={`${-size.w / 2} ${-size.h / 2} ${size.w} ${size.h}`} preserveAspectRatio="none">
        {paths.map((p) => (
          <g key={p.key} style={{ opacity: SCENES[scene] === p.key ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <path d={p.base} stroke="var(--fg)" strokeOpacity={size.w < 768 ? 0.14 : 0.32} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d={p.hot} stroke="var(--accent)" strokeOpacity="0.9" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </g>
        ))}
      </svg>
    </div>
  )
}
