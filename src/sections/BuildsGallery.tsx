'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { getLenis } from '@/lib/scroll'

/**
 * Desktop: a pinned section where vertical scroll moves the cards sideways (scrubbed, reversible),
 * with drag + inertia and arrow keys, and a small velocity skew. Mobile / no JS: native horizontal
 * scroll-snap track. Reduced motion: native scroll-snap too.
 */
export default function BuildsGallery({ children, count }: { children: React.ReactNode; count: number }) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const list = track.current!
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.pinned = 'true'
        const dist = () => Math.max(0, list.scrollWidth - el.clientWidth + 0)
        const skew = gsap.quickTo(list.querySelectorAll('.build__media'), 'skewX', { duration: 0.5, ease: 'power3' })
        const tween = gsap.to(list, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => skew(gsap.utils.clamp(-4, 4, self.getVelocity() / -450)),
          },
        })
        const st = tween.scrollTrigger!

        // drag: vertical scroll position follows the pointer, Lenis gives it inertia
        let down = false
        let lastX = 0
        const ratio = () => (st.end - st.start) / Math.max(1, dist())
        const onDown = (e: PointerEvent) => {
          if ((e.target as Element).closest('a,button')) return
          down = true
          lastX = e.clientX
          el.classList.add('is-dragging')
        }
        const onMove = (e: PointerEvent) => {
          if (!down) return
          const dx = e.clientX - lastX
          lastX = e.clientX
          const lenis = getLenis()
          if (lenis) lenis.scrollTo(lenis.scroll - dx * ratio(), { immediate: true })
          else window.scrollBy(0, -dx * ratio())
        }
        const onUp = () => {
          down = false
          el.classList.remove('is-dragging')
        }
        const onKey = (e: KeyboardEvent) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
          e.preventDefault()
          const card = list.querySelector<HTMLElement>('.build')!.offsetWidth + 48
          const dir = e.key === 'ArrowRight' ? 1 : -1
          const lenis = getLenis()
          const to = (lenis?.scroll ?? window.scrollY) + dir * card * ratio()
          lenis ? lenis.scrollTo(to, { duration: 0.8 }) : window.scrollTo({ top: to, behavior: 'smooth' })
        }
        list.addEventListener('pointerdown', onDown)
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        list.addEventListener('keydown', onKey)
        ScrollTrigger.refresh()
        return () => {
          delete el.dataset.pinned
          list.removeEventListener('pointerdown', onDown)
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          list.removeEventListener('keydown', onKey)
          gsap.set(list, { clearProps: 'transform' })
          gsap.set(list.querySelectorAll('.build__media'), { clearProps: 'skewX' })
        }
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [count] },
  )

  return (
    <div ref={root} className="builds__stage">
      <ul
        ref={track}
        className="builds__track"
        tabIndex={0}
        aria-label="Personal projects. Use the left and right arrow keys to move through them."
      >
        {children}
      </ul>
    </div>
  )
}
