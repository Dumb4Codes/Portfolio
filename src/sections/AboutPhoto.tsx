'use client'
import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

/** Duotone photo that reveals full colour on hover or tap, with a slow parallax drift. */
export default function AboutPhoto({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState(false)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !wrap.current) return
      const img = wrap.current.querySelector('img')
      if (!img) return
      gsap.fromTo(
        img,
        { yPercent: -6, scale: 1.12 },
        { yPercent: 6, ease: 'none', scrollTrigger: { trigger: wrap.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    },
    { scope: wrap },
  )

  return (
    <figure
      ref={wrap}
      className="about__photo"
      data-color={color}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setColor(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setColor(false)}
      onClick={() => setColor((c) => !c)}
    >
      {children}
      <span className="about__tone" aria-hidden="true" />
      <figcaption className="mono muted about__cap" aria-hidden="true">
        Tap or hover for colour
      </figcaption>
    </figure>
  )
}
