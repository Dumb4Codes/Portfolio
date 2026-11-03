'use client'
import Image from 'next/image'
import { useRef, useState } from 'react'
import Reveal from '@/components/Reveal'
import { formatCertDate } from '@/content/derive'
import { gsap, useGSAP } from '@/lib/gsap'
import { getLenis } from '@/lib/scroll'

export type Cert = { slug: string; title: string; issuer: string; date: string; image: string; verifyUrl?: string; file?: string }

/**
 * A deck of cards (CSS 3D, not WebGL): stacked and slightly rotated, they fan into a row on scroll.
 * Mobile: a swipeable scroll-snap carousel. A click opens a native <dialog> (focus trap, Esc, focus return).
 */
export default function CertsSection({ certs }: { certs: Cert[] }) {
  const stage = useRef<HTMLUListElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<Cert | null>(null)

  useGSAP(
    () => {
      const el = stage.current!
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('.cert', el)
        const n = cards.length
        const w = cards[0]?.offsetWidth ?? 220
        const span = Math.min(el.clientWidth - w, (n - 1) * (w * 0.72))
        const stack = (i: number) => ({ x: i * 5 - n * 2.5, y: i * -4, rotation: (i - n / 2) * 2.2, rotateY: -8, z: i * 2 })
        cards.forEach((c, i) => gsap.set(c, { ...stack(i), transformPerspective: 1200 }))
        gsap.to(cards, {
          x: (i) => (n === 1 ? 0 : -span / 2 + (span / (n - 1)) * i),
          y: 0,
          rotation: (i) => (i - (n - 1) / 2) * 1.4,
          rotateY: 0,
          z: 0,
          duration: 1.4,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        })
        // gentle lift on hover keeps the fan legible
        const enter = (e: Event) => gsap.to(e.currentTarget, { y: -18, rotation: 0, scale: 1.04, duration: 0.5, zIndex: 20 })
        const leave = (e: Event) => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.5, zIndex: 0 })
        cards.forEach((c) => {
          c.addEventListener('pointerenter', enter)
          c.addEventListener('pointerleave', leave)
        })
        return () => {
          cards.forEach((c) => {
            c.removeEventListener('pointerenter', enter)
            c.removeEventListener('pointerleave', leave)
          })
          gsap.set(cards, { clearProps: 'all' })
        }
      })
      return () => mm.revert()
    },
    { scope: stage, dependencies: [certs.length] },
  )

  const show = (c: Cert) => {
    setOpen(c)
    getLenis()?.stop()
    requestAnimationFrame(() => dialog.current?.showModal())
  }
  const onClose = () => {
    setOpen(null)
    getLenis()?.start()
  }

  return (
    <section id="certifications" className="certs" aria-labelledby="cert-title">
      <div className="wrap">
        <Reveal variant="rule" className="rule" />
        <div className="certs__head grid12">
          <p className="section-label mono certs__label">
            <span>[ 06 ]</span> <span>Certifications</span>
          </p>
          <h2 id="cert-title" className="display certs__title">
            Proof of <em className="serif">coursework</em>
          </h2>
        </div>
      </div>

      <ul ref={stage} className="certs__stage">
        {certs.map((c) => (
          <li key={c.slug} className="cert">
            <a
              href={c.file ?? c.image}
              className="cert__card"
              data-cursor="Open"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) return
                e.preventDefault()
                show(c)
              }}
              aria-haspopup="dialog"
            >
              <Image src={c.image} alt="" width={440} height={310} sizes="(min-width: 1024px) 18vw, 70vw" quality={60} className="cert__img" />
              <span className="cert__cap">
                <b className="cert__title">{c.title}</b>
                <span className="mono muted">
                  {c.issuer} · {formatCertDate(c.date)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="cert-dialog"
        aria-label={open ? `${open.title}, ${open.issuer}` : 'Certificate'}
        onClose={onClose}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      >
        {open && (
          <div className="cert-dialog__body" data-lenis-prevent>
            <Image src={open.image} alt={`${open.title} certificate from ${open.issuer}`} width={1400} height={990} sizes="(min-width: 1024px) 70vw, 94vw" quality={80} className="cert-dialog__img" />
            <div className="cert-dialog__meta">
              <div>
                <h3 className="display cert-dialog__title">{open.title}</h3>
                <p className="mono muted">
                  {open.issuer} · {formatCertDate(open.date)}
                </p>
              </div>
              <div className="cert-dialog__actions">
                {open.verifyUrl && (
                  <a className="btn btn-accent" href={open.verifyUrl} target="_blank" rel="noopener noreferrer">
                    Verify ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                {open.file && (
                  <a className="btn" href={open.file} target="_blank" rel="noopener noreferrer">
                    PDF ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                <button type="button" className="btn" onClick={() => dialog.current?.close()}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}

