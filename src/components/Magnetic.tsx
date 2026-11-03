'use client'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/scroll'
import { frameLoop } from '@/lib/tween'

/** Pulls its child toward the pointer. Primary CTAs only; fine pointers only. */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    const vel = { x: 0, y: 0 }
    // damped spring: a little overshoot on release, like a magnet letting go
    const loop = frameLoop(() => {
      for (const k of ['x', 'y'] as const) {
        vel[k] += (target[k] - pos[k]) * 0.18
        vel[k] *= 0.72
        pos[k] += vel[k]
      }
      el.style.transform = `translate3d(${pos.x.toFixed(2)}px,${pos.y.toFixed(2)}px,0)`
      return Math.abs(vel.x) + Math.abs(vel.y) + Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.05
    })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = (e.clientX - (r.left + r.width / 2)) * strength
      target.y = (e.clientY - (r.top + r.height / 2)) * strength
      loop.wake()
    }
    const leave = () => {
      target.x = 0
      target.y = 0
      loop.wake()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      loop.stop()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return (
    <span ref={ref} className={className} style={{ display: 'inline-block' }}>
      {children}
    </span>
  )
}
