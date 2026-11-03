'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { PaletteData } from './Palette'

/** The palette UI is loaded after first paint, but its triggers live here so an early Ctrl+K is never lost. */
const Palette = dynamic(() => import('./Palette'), { ssr: false })

export default function LazyPalette({ data }: { data: PaletteData }) {
  const [signal, setSignal] = useState(0)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const show = () => {
      returnTo.current = document.activeElement as HTMLElement | null
      setSignal((n) => n + 1)
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

  return <Palette data={data} openSignal={signal} returnTo={returnTo} />
}
