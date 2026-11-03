'use client'
import { setTheme, useTheme } from './theme'

export default function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={`Switch to ${next} theme`}
      data-cursor="Theme"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setTheme(next, r.left + r.width / 2, r.top + r.height / 2)
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2a7 7 0 0 1 0 14z" fill="currentColor" />
      </svg>
    </button>
  )
}
