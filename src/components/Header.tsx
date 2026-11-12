'use client'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getLenis } from '@/lib/scroll'
import ThemeToggle from './ThemeToggle'

type Props = {
  availability: { status: 'open' | 'busy' | 'closed'; label: string }
  resume?: string
  email: string
  nav: readonly { label: string; href: string }[]
  socials: { label: string; href: string }[]
}

export default function Header({ availability, resume, email, nav, socials }: Props) {
  const pathname = usePathname()
  // the menu is open only for the path it was opened on, so navigating closes it without an effect
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = useCallback((v: boolean | ((o: boolean) => boolean)) => setOpenOn((cur) => ((typeof v === 'function' ? v(cur === pathname) : v) ? pathname : null)), [pathname])
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    btn.current?.focus()
  }, [setOpen])

  useEffect(() => {
    if (!open) return
    getLenis()?.stop()
    const root = panel.current!
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('a[href],button'))
    focusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close()
      if (e.key !== 'Tab') return
      const f = focusables()
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      getLenis()?.start()
    }
  }, [open, close])

  return (
    <>
      <header className="site-header">
        <div className="wrap site-header__row" data-build="header">
          <Link href="/" className="monogram display" aria-label="YS, Youvraj Singh home page" data-cursor="Home">
            YS
          </Link>

          <nav className="site-nav mono" aria-label="Primary">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} data-cursor="Go">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__right">
            <p className="status-pill mono" data-status={availability.status} title={availability.label}>
              <span className="status-dot" aria-hidden="true" />
              <span>{availability.label}</span>
            </p>
            {resume && (
              <a className="btn btn-sm header-resume" href={resume} target="_blank" rel="noopener noreferrer" data-cursor="Open ↗">
                Résumé ↗<span className="sr-only"> (PDF, opens in a new tab)</span>
              </a>
            )}
            <ThemeToggle />
            <button
              ref={btn}
              type="button"
              className="menu-btn mono"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={panel}
        className="mobile-menu"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <nav aria-label="Mobile" className="mobile-menu__nav">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="display">
              <span className="mono muted">0{i + 1}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__foot">
          <p className="mono mobile-menu__avail" data-status={availability.status}>
            <span className="status-dot" aria-hidden="true" />
            {availability.label}
          </p>
          <div className="mobile-menu__actions">
            {resume && (
              <a className="btn btn-accent" href={resume} target="_blank" rel="noopener noreferrer">
                Résumé ↗
              </a>
            )}
            <a className="btn" href={`mailto:${email}`}>
              Email me
            </a>
          </div>
          <ul className="mobile-menu__social mono">
            {socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
