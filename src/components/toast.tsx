'use client'
import { useEffect, useState } from 'react'

export const toast = (message: string) => window.dispatchEvent(new CustomEvent('toast', { detail: message }))

/** Polite live region: announces without stealing focus, auto-dismisses after 3s. */
export function Toaster() {
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail)
      clearTimeout(t)
      t = setTimeout(() => setMsg(''), 3000)
    }
    window.addEventListener('toast', on)
    return () => {
      clearTimeout(t)
      window.removeEventListener('toast', on)
    }
  }, [])
  return (
    <div className="toaster" role="status" aria-live="polite">
      {msg && <span className="toast mono">{msg}</span>}
    </div>
  )
}

export async function copyText(text: string, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text)
    toast(label)
  } catch {
    toast('Copy failed. Select it manually.')
  }
}
