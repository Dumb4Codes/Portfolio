'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'
import { frameLoop } from '@/lib/tween'

type Preview = { title: string; src?: string; hue: number; ang: number }

/** Floating cover that trails the cursor (lerped) and tilts with its velocity. Fine pointers only. */
export default function ArchivePreview({ previews }: { previews: Record<string, Preview> }) {
  const box = useRef<HTMLDivElement>(null)
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const el = box.current!
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let rot = 0
    let rotTarget = 0
    let lastX = 0
    const loop = frameLoop(() => {
      pos.x += (target.x - pos.x) * 0.14
      pos.y += (target.y - pos.y) * 0.14
      rot += (rotTarget - rot) * 0.15
      rotTarget *= 0.9
      el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) rotate(${rot.toFixed(2)}deg)`
      return Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) + Math.abs(rot) > 0.1
    })
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX + 24
      target.y = e.clientY - 90
      rotTarget = Math.max(-9, Math.min(9, (e.clientX - lastX) * 0.5))
      lastX = e.clientX
      loop.wake()
    }
    const over = (e: Event) => {
      const row = (e.target as Element).closest<HTMLElement>('[data-preview]')
      const s = row?.dataset.preview ?? null
      setSlug(s)
      el.classList.toggle('is-on', Boolean(s))
    }
    const table = document.querySelector('.archive__table')
    window.addEventListener('pointermove', onMove, { passive: true })
    table?.addEventListener('pointerover', over)
    table?.addEventListener('focusin', over)
    table?.addEventListener('pointerleave', over)
    return () => {
      loop.stop()
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
