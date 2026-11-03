'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion, setLenis } from '@/lib/scroll'

/** Lenis synced to ScrollTrigger and the GSAP ticker (which also drives the R3F loop). Off for reduced motion. */
export default function SmoothScroll() {
  useEffect(() => {
    // Back/forward restores native position; Next handles it, we only avoid fighting it.
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Anchor links work with Lenis (and still update the hash).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) })
      history.pushState(null, '', url.hash)
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])
  return null
}
