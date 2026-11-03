'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { copyText } from './toast'
import { setTheme, useTheme } from './theme'
import { decodeContact } from '@/lib/obfuscate'
import { getLenis, scrollToTarget } from '@/lib/scroll'

export type PaletteData = {
  projects: { slug: string; title: string; kind: string }[]
  email: string
  phoneEnc: string
  resume?: string
  links: { label: string; href: string }[]
  nav: readonly { label: string; href: string }[]
}

type Item = { id: string; group: string; label: string; hint?: string; run: () => void }

/** Command palette: Ctrl/Cmd+K or "/" . Combobox pattern: input owns focus, list uses aria-activedescendant. */
export default function Palette({ data }: { data: PaletteData }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const input = useRef<HTMLInputElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQ('')
    setActive(0)
    returnTo.current?.focus?.()
  }, [])

  const goSection = useCallback(
    (href: string) => {
      const id = href.split('#')[1]
      if (pathname === '/' && id) scrollToTarget(document.getElementById(id) ?? 0, { offset: -72 })
      else router.push(href)
    },
    [pathname, router],
  )

  const items = useMemo<Item[]>(() => {
    const list: Item[] = []
    data.nav.forEach((n) => list.push({ id: `nav-${n.label}`, group: 'Go to', label: n.label, hint: 'Section', run: () => goSection(n.href) }))
    data.projects.forEach((p) =>
      list.push({ id: `p-${p.slug}`, group: 'Projects', label: p.title, hint: p.kind === 'internal' ? 'Internal' : 'Personal', run: () => router.push(`/work/${p.slug}`) }),
    )
    list.push({ id: 'all', group: 'Projects', label: 'All work', hint: 'Index', run: () => router.push('/work') })
    list.push({ id: 'email', group: 'Actions', label: 'Copy email', hint: data.email, run: () => void copyText(data.email, 'Email copied') })
    list.push({
      id: 'call',
      group: 'Actions',
      label: 'Call Youvraj',
      hint: 'Phone',
      run: () => {
        window.location.href = `tel:${decodeContact(data.phoneEnc).replace(/\s/g, '')}`
      },
    })
    if (data.resume) list.push({ id: 'cv', group: 'Actions', label: 'Download résumé', hint: 'PDF', run: () => window.open(data.resume, '_blank', 'noopener') })
    list.push({ id: 'theme', group: 'Actions', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, hint: 'Theme', run: () => setTheme(theme === 'dark' ? 'light' : 'dark') })
    data.links.forEach((l) => list.push({ id: `l-${l.label}`, group: 'Links', label: l.label, hint: '↗', run: () => window.open(l.href, '_blank', 'noopener,noreferrer') }))
    return list
  }, [data, goSection, router, theme])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? items.filter((i) => `${i.label} ${i.group} ${i.hint ?? ''}`.toLowerCase().includes(s)) : items
  }, [items, q])

  useEffect(() => setActive(0), [q])

  // open triggers
  useEffect(() => {
    const show = () => {
      returnTo.current = document.activeElement as HTMLElement
      setOpen(true)
    }
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        show()
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('palette:open', show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('palette:open', show)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    getLenis()?.stop()
    input.current?.focus()
    return () => getLenis()?.start()
  }, [open])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, shown])

  if (!open) return null

  const run = (i?: Item) => {
    if (!i) return
    setOpen(false)
    setQ('')
    // let the dialog unmount, then act (keeps focus handling predictable)
    setTimeout(i.run, 30)
  }

  let lastGroup = ''
  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-lenis-prevent
        onKeyDown={(e) => {
          if (e.key === 'Escape') return close()
          if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(a + 1, shown.length - 1)))
          else if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)))
          else if (e.key === 'Enter') (e.preventDefault(), run(shown[active]))
          else if (e.key === 'Tab') e.preventDefault() // focus stays in the combobox
        }}
      >
        <input
          ref={input}
          className="palette__input mono-md"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={shown[active] ? `pal-${shown[active].id}` : undefined}
          aria-autocomplete="list"
          aria-label="Search commands"
          placeholder="Jump to a section, project or action"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <ul ref={listRef} id="palette-list" role="listbox" aria-label="Commands" className="palette__list">
          {shown.length === 0 && <li className="palette__empty mono muted">Nothing matches “{q}”</li>}
          {shown.map((i, idx) => {
            const head = i.group !== lastGroup
            lastGroup = i.group
            return (
              <li key={i.id} role="presentation">
                {head && <div className="palette__group mono muted" aria-hidden="true">{i.group}</div>}
                <div
                  id={`pal-${i.id}`}
                  role="option"
                  aria-selected={idx === active}
                  className="palette__item"
                  onMouseMove={() => setActive(idx)}
                  onClick={() => run(i)}
                >
                  <span>{i.label}</span>
                  {i.hint && <span className="mono muted">{i.hint}</span>}
                </div>
              </li>
            )
          })}
        </ul>
        <div className="palette__foot mono muted" aria-hidden="true">
          <span>↑↓ move</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
