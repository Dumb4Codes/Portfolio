'use client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Register once; import gsap helpers from here, never from 'gsap' directly in components. */
let done = false
export function registerGsap() {
  if (done || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  gsap.defaults({ ease: 'expo.out' })
  // the particle director re-measures its chapter anchors whenever ScrollTrigger lays out
  ScrollTrigger.addEventListener('refresh', () => window.dispatchEvent(new Event('gl:layout')))
  done = true
}
registerGsap()

export { gsap, ScrollTrigger }

/** Shared easing family. */
export const EASE = { out: 'expo.out', inOut: 'power3.inOut' } as const
