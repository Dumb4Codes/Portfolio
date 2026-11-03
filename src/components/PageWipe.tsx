'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { getLenis, prefersReducedMotion } from '@/lib/scroll'

/** Names for the wipe. Case-study titles come from the link's `data-wipe` attribute. */
function labelFor(path: string, a: HTMLAnchorElement) {
  if (a.dataset.wipe) return a.dataset.wipe
  if (path === '/') return 'Home'
  if (path === '/work') return 'All work'
  return path.split('/').filter(Boolean).pop()!.replace(/-/g, ' ')
}

/**
 * Mono wipe between pages: a carbon panel rises with the destination name, the route changes under it,
 * then it lifts away. Back/forward is left to the browser so scroll restoration stays native.
 */
export default function PageWipe() {
  const router = useRouter()
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const pending = useRef<null | { to: string }>(null)
  const busy = useRef(false)

  // route actually changed: lift the panel
  useEffect(() => {
    if (!pending.current) return
    pending.current = null
    getLenis()?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    window.dispatchEvent(new Event('gl:layout'))
    gsap.to(panel.current, {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut',
      delay: 0.12,
      onComplete: () => {
        gsap.set(panel.current, { yPercent: 100 })
        busy.current = false
      },
    })
  }, [pathname])

  useEffect(() => {
    gsap.set(panel.current, { yPercent: 100 })
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      if (url.pathname.startsWith('/keystatic') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return
      if (prefersReducedMotion() || busy.current) return
      e.preventDefault()
      busy.current = true
      setLabel(labelFor(url.pathname, a))
      pending.current = { to: url.pathname + url.search + url.hash }
      gsap.fromTo(
        panel.current,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.6,
          ease: 'power3.inOut',
          onComplete: () => {
            router.push(pending.current!.to)
            // failsafe: if the route never changes (offline), release the panel
            setTimeout(() => {
              if (pending.current) {
                pending.current = null
                gsap.to(panel.current, { yPercent: 100, duration: 0.4, onComplete: () => void (busy.current = false) })
              }
            }, 4000)
          },
        },
      )
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
