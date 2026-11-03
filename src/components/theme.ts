'use client'
import { useSyncExternalStore } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'

export type Theme = 'dark' | 'light'

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}
const snapshot = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

export const useTheme = (): Theme => useSyncExternalStore(subscribe, snapshot, () => 'dark')

type VT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }

/** Switches theme with a circular View Transition reveal from (x, y); crossfade fallback. */
export function setTheme(next: Theme, x = innerWidth / 2, y = 0) {
  const apply = () => {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode */
    }
  }
  const doc = document as VT
  if (!doc.startViewTransition || prefersReducedMotion()) return apply()
  const t = doc.startViewTransition(apply)
  t.ready
    .then(() => {
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
}
