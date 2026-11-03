'use client'
import { scrollToTarget } from '@/lib/scroll'

export default function BackToTop() {
  return (
    <button type="button" className="link-arrow" data-cursor="Top" onClick={() => scrollToTarget(0)}>
      Back to top ↑
    </button>
  )
}
