'use client'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getLenis } from '@/lib/scroll'
import LiveClock from './LiveClock'
import ThemeToggle from './ThemeToggle'

type Props = {
  jobLine: string | null
  timezone: string
  nav: readonly { label: string; href: string }[]
  socials: { label: string; href: string }[]
}

export default function Header({ jobLine, timezone, nav, socials }: Props) {
  const [open, setOpen] = useState(false)
  const [mac, setMac] = useState(false)
  const pathname = usePathname()
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => setMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)), [])
  useEffect(() => setOpen(false), [pathname])

  const close = useCallback(() => {
    setOpen(false)
    btn.current?.focus()
  }, [])

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
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
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
        <div className="wrap site-header__row">
          <Link href="/" className="monogram display" aria-label="Youvraj Singh, home" data-cursor="Home">
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
            {jobLine && (
              <p className="status-pill mono" title={jobLine}>
                <span className="status-dot" aria-hidden="true" />
                <span>{jobLine}</span>
              </p>
            )}
            <LiveClock timezone={timezone} className="mono header-clock" />
            <ThemeToggle />
            <button
              type="button"
              className="kbd-hint mono"
              aria-label="Open command palette"
              onClick={() => window.dispatchEvent(new Event('palette:open'))}
            >
              {mac ? '⌘K' : 'Ctrl K'}
            </button>
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
    </>
  )
}
