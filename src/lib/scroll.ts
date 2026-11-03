'use client'
import type Lenis from 'lenis'

/** Single Lenis instance shared by anchors, the palette, back-to-top and the director. */
let instance: Lenis | null = null

export const setLenis = (l: Lenis | null) => {
  instance = l
}
export const getLenis = () => instance

export function scrollToTarget(target: string | HTMLElement | number, opts: { offset?: number; immediate?: boolean } = {}) {
  const offset = opts.offset ?? 0
  if (instance) {
    instance.scrollTo(target, { offset, immediate: opts.immediate, duration: 1.4 })
    return
  }
  if (typeof target === 'number') return window.scrollTo({ top: target, behavior: opts.immediate ? 'auto' : 'smooth' })
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  el?.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth', block: 'start' })
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
