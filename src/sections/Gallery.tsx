'use client'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { getLenis } from '@/lib/scroll'

type Item = { src: string; alt: string; blur?: string }

/**
 * Draggable horizontal strip of screenshots + an accessible lightbox (native <dialog>: focus trap,
 * Esc, focus return). Arrow keys and swipe move between images.
 */
export default function Gallery({ items, title }: { items: Item[]; title: string }) {
  const strip = useRef<HTMLUListElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [idx, setIdx] = useState<number | null>(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const swipe = useRef(0)

  const open = (i: number) => {
    if (drag.current.moved) return
    setIdx(i)
    getLenis()?.stop()
    requestAnimationFrame(() => dialog.current?.showModal())
  }
  const step = (d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length))
  const cur = idx === null ? null : items[idx]

  return (
    <div className="gallery">
      <ul
        ref={strip}
        className="gallery__strip"
        aria-label={`${title} screenshots`}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') return
          drag.current = { down: true, x: e.clientX, left: strip.current!.scrollLeft, moved: false }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d.down) return
          const dx = e.clientX - d.x
          if (Math.abs(dx) > 4) d.moved = true
          strip.current!.scrollLeft = d.left - dx
        }}
        onPointerUp={() => {
          drag.current.down = false
          setTimeout(() => (drag.current.moved = false), 0)
        }}
        onPointerLeave={() => (drag.current.down = false)}
      >
        {items.map((g, i) => (
          <li key={g.src}>
            <button type="button" className="gallery__thumb" onClick={() => open(i)} data-cursor="View" aria-haspopup="dialog">
              <Image src={g.src} alt={g.alt} width={640} height={400} sizes="(min-width: 1024px) 34vw, 78vw" quality={70} placeholder={g.blur ? 'blur' : 'empty'} blurDataURL={g.blur} draggable={false} />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${title} screenshot viewer`}
        onClose={() => {
          setIdx(null)
          getLenis()?.start()
        }}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        onTouchStart={(e) => (swipe.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - swipe.current
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
        }}
      >
        {cur && (
          <figure className="lightbox__fig">
            <Image src={cur.src} alt={cur.alt} width={1600} height={1000} sizes="94vw" quality={80} className="lightbox__img" />
            <figcaption className="mono">
              <span className="muted">
                {(idx ?? 0) + 1} / {items.length}
              </span>{' '}
              {cur.alt}
            </figcaption>
          </figure>
        )}
        <div className="lightbox__bar">
          <button type="button" className="btn" onClick={() => step(-1)} aria-label="Previous image">
            ←
          </button>
          <button type="button" className="btn" onClick={() => step(1)} aria-label="Next image">
            →
          </button>
          <button type="button" className="btn" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  )
}
