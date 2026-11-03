'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Loads the motion engine (GSAP, ScrollTrigger, SplitText, Lenis) after hydration and an idle moment, so the
 * initial JavaScript is just React and the interactive islands. Effects run after the whole page has hydrated,
 * so the engine never touches DOM that React is still adopting. Re-runs on every route change.
 * If the engine cannot load, `data-motion="failed"` releases every element the CSS hid for an entrance.
 */
export default function MotionBoot() {
  const pathname = usePathname()

  useEffect(() => {
    const html = document.documentElement
    let stop: (() => void) | undefined
    let dead = false
    const hasIdle = 'requestIdleCallback' in window
    const load = () => {
      import('./engine')
        .then((m) => {
          if (!dead) stop = m.start()
        })
        .catch(() => {
          html.dataset.motion = 'failed'
        })
    }
    const idle = hasIdle ? window.requestIdleCallback(load, { timeout: 1200 }) : window.setTimeout(load, 300)
    const failsafe = window.setTimeout(() => {
      if (html.dataset.motion !== 'on') html.dataset.motion = 'failed'
    }, 12000)
    return () => {
      dead = true
      window.clearTimeout(failsafe)
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      stop?.()
    }
  }, [pathname])

  return null
}
