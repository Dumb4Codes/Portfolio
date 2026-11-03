'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'

const GLRoot = dynamic(() => import('./GLRoot'), { ssr: false })
const StaticScene = dynamic(() => import('./StaticScene'), { ssr: false })

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Progressive enhancement: the page is complete HTML first. The GL bundle is only fetched
 * after first paint and an idle moment, so the LCP element is the headline text.
 */
export default function GLMount() {
  const [mode, setMode] = useState<'none' | 'gl' | 'static'>('none')

  useEffect(() => {
    const decide = () => {
      if (prefersReducedMotion() || !hasWebGL()) return setMode('static')
      setMode('gl')
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(decide, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(decide, 400)
    return () => clearTimeout(t)
  }, [])

  if (mode === 'gl') return <GLRoot />
  if (mode === 'static') return <StaticScene />
  return null
}
