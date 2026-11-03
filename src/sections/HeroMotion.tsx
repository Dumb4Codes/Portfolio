'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

/** Hero entrance (after the preloader) and scroll-out. Attaches to the server-rendered hero markup. */
export default function HeroMotion() {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (prefersReducedMotion()) return
    const q = (s: string) => document.querySelector<HTMLElement>(s)
        const headline = q('[data-hero-headline]')
    const sub = q('[data-hero-sub]')
    const hero = q('.hero')
    if (!headline || !sub || !hero) return

    // headline: lines under masks, slides in after the intro
    let split: SplitText | undefined
    const run = () => {
      document.fonts.ready.then(() => {
        split = SplitText.create(headline, { type: 'lines', mask: 'lines', autoSplit: true })
        gsap.from(split.lines, { yPercent: 115, duration: 1.2, stagger: 0.08, ease: 'expo.out', delay: 0.1 })
        gsap.from(sub, { opacity: 0, y: 16, duration: 1, delay: 0.5 })
        gsap.from('.hero__bottom > *, .hero__top > *', { opacity: 0, duration: 1, delay: 0.7, stagger: 0.1 })
      })
    }
    // hide until the preloader finishes so there is no flash
    gsap.set(sub, { opacity: 0 })
    gsap.set('.hero__bottom > *, .hero__top > *', { opacity: 0 })
    gsap.set(headline, { visibility: 'hidden' })
    const go = () => {
      gsap.set(headline, { visibility: 'visible' })
      gsap.set(sub, { opacity: 1 })
      gsap.set('.hero__bottom > *, .hero__top > *', { opacity: 1 })
      run()
    }
    if (document.documentElement.classList.contains('preload') && document.querySelector('.preloader')) window.addEventListener('intro:done', go, { once: true })
    else go()

    // headline lines slide up as the hero scrolls out (scrubbed, so it reverses)
    const st = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom 30%',
      scrub: true,
      onUpdate: (self) => {
        gsap.set([headline, sub], { yPercent: -60 * self.progress, opacity: 1 - self.progress * 1.1 })
      },
    })
    return () => {
      window.removeEventListener('intro:done', go)
      st.kill()
      split?.revert()
    }
  }, [])

  return <span ref={ref} hidden />
}
