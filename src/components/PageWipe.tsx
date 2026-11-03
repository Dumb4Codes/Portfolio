'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getLenis, prefersReducedMotion } from '@/lib/scroll'

/** Names for the wipe. Case-study titles come from the link's `data-wipe` attribute. */
function labelFor(path: string, a: HTMLAnchorElement) {
  if (a.dataset.wipe) return a.dataset.wipe
  if (path === '/') return 'Home'
  if (path === '/work') return 'All work'
  return path.split('/').filter(Boolean).pop()!.replace(/-/g, ' ')
}

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'

/**
 * Mono wipe between pages: a carbon panel rises with the destination name, the route changes under it,
 * then it lifts away. Back/forward is left to the browser so scroll restoration stays native.
 */
export default function PageWipe() {
  const router = useRouter()
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const pending = useRef<string | null>(null)
  const busy = useRef(false)

  const slide = (from: number, to: number, ms: number, delay = 0) =>
    panel.current!.animate([{ transform: `translateY(${from}%)` }, { transform: `translateY(${to}%)` }], { duration: ms, delay, easing: EASE, fill: 'forwards' }).finished

  const reset = () => {
    panel.current?.getAnimations().forEach((a) => a.cancel())
    busy.current = false
  }

  // route actually changed: lift the panel
  useEffect(() => {
    if (!pending.current) return
    const target = pending.current
    pending.current = null
    getLenis()?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    window.dispatchEvent(new Event('gl:layout'))
    const hash = target.split('#')[1]
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 60)
    void slide(0, -100, 700, 120).then(reset)
  }, [pathname])

  // plain <a> links do not prefetch on their own: do it when someone shows intent
  useEffect(() => {
    const seen = new Set<string>()
    const intent = (e: Event) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="/"]') as HTMLAnchorElement | null
      const href = a?.getAttribute('href')
      if (!href || seen.has(href) || href.startsWith('/keystatic') || href.startsWith('/api') || href.startsWith('/admin')) return
      seen.add(href)
      router.prefetch(href.split('#')[0])
    }
    document.addEventListener('pointerover', intent, { passive: true })
    document.addEventListener('touchstart', intent, { passive: true })
    document.addEventListener('focusin', intent)
    return () => {
      document.removeEventListener('pointerover', intent)
      document.removeEventListener('touchstart', intent)
      document.removeEventListener('focusin', intent)
    }
  }, [router])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      if (url.pathname.startsWith('/keystatic') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return
      if (prefersReducedMotion() || busy.current || !panel.current) return
      e.preventDefault()
      busy.current = true
      setLabel(labelFor(url.pathname, a))
      pending.current = url.pathname + url.search + url.hash
      void slide(100, 0, 600).then(() => {
        router.push(pending.current!)
        // failsafe: if the route never changes (offline), release the panel
        setTimeout(() => {
          if (pending.current) {
            pending.current = null
            void slide(0, 100, 400).then(reset)
          }
        }, 4000)
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [router])

  return (
    <div ref={panel} className="wipe" aria-hidden="true">
      <span className="wipe__label mono">→ {label}</span>
    </div>
  )
}
