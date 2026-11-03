'use client'
import { useEffect } from 'react'
import { director } from '@/gl/director'
import { scrollToTarget } from '@/lib/scroll'

/** Type "hire" anywhere (outside inputs): the particles spell HIRE? for two seconds, then dissolve into Contact. */
export default function EasterEgg() {
  useEffect(() => {
    let buf = ''
    let busy = false
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return
      buf = (buf + e.key.toLowerCase()).slice(-4)
      if (buf !== 'hire' || busy) return
      busy = true
      buf = ''
      director.setOverride({ text: 'HIRE?', mode: 'form' })
      window.dispatchEvent(new Event('gl:wake'))
      setTimeout(() => {
        director.setOverride(null)
        scrollToTarget(document.getElementById('contact') ?? 0, { offset: -72 })
        busy = false
      }, 2000)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}
