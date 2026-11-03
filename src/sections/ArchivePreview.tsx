'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

type Preview = { title: string; src?: string; hue: number; ang: number }

/** Floating cover that trails the cursor (lerped) and tilts with its velocity. Fine pointers only. */
export default function ArchivePreview({ previews }: { previews: Record<string, Preview> }) {
  const box = useRef<HTMLDivElement>(null)
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const el = box.current!
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })
    const rot = gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power3' })
    let lastX = 0
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 24)
      y(e.clientY - 90)
      rot(gsap.utils.clamp(-9, 9, (e.clientX - lastX) * 0.5))
      lastX = e.clientX
    }
    const over = (e: Event) => {
      const row = (e.target as Element).closest<HTMLElement>('[data-preview]')
      const s = row?.dataset.preview ?? null
      setSlug(s)
      gsap.to(el, { autoAlpha: s ? 1 : 0, scale: s ? 1 : 0.9, duration: 0.35 })
    }
    const table = document.querySelector('.archive__table')
    window.addEventListener('pointermove', onMove, { passive: true })
    table?.addEventListener('pointerover', over)
    table?.addEventListener('focusin', over)
    table?.addEventListener('pointerleave', over)
    return () => {
      window.removeEventListener('pointermove', onMove)
      table?.removeEventListener('pointerover', over)
      table?.removeEventListener('focusin', over)
      table?.removeEventListener('pointerleave', over)
    }
  }, [])

  const p = slug ? previews[slug] : null
  return (
    <div ref={box} className="archive__preview" aria-hidden="true">
      {p &&
        (p.src ? (
          <Image src={p.src} alt="" fill sizes="300px" quality={60} style={{ objectFit: 'cover' }} />
        ) : (
          <div className="gen-cover" style={{ ['--h' as string]: p.hue, ['--ang' as string]: `${p.ang}deg` }}>
            <span className="gen-cover__title display">{p.title}</span>
            <span className="gen-cover__dots" />
          </div>
        ))}
    </div>
  )
}
