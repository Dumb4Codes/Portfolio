'use client'
import { useEffect } from 'react'
import { director } from '@/gl/director'

/** 404: the particles try to form "404", fail, and scatter. Restored when you leave. */
export default function NotFoundScene() {
  useEffect(() => {
    director.setOverride({ text: '404', mode: 'fail' })
    window.dispatchEvent(new Event('gl:wake'))
    const t = setTimeout(() => {
      director.scatterNow(true)
      window.dispatchEvent(new Event('gl:wake'))
    }, 1700)
    return () => {
      clearTimeout(t)
      director.setOverride(null)
      director.scatterNow(false)
    }
  }, [])
  return null
}
