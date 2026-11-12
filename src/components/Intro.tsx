'use client'
import { useEffect, useRef } from 'react'

/**
 * First visit per session: four labelled cursors ("agents") fly in and snap the hero's blocks into place,
 * one block per arrival, then leave. About 1.2 s, never more than MAX_MS, skippable with any key or tap.
 *
 * Whether it runs is decided before paint by the boot script (class `preload` on <html>, not under reduced
 * motion). Blocks are marked `data-build`; the CSS keeps them hidden under `html.js.preload` until they get
 * `data-built="true"`. If this code never runs, a CSS failsafe releases everything at 2.5 s.
 */

const AGENTS = [
  { name: 'layout', color: 'var(--ai-1)', home: [-0.08, -0.1] },
  { name: 'copy', color: 'var(--ai-2)', home: [1.08, -0.06] },
  { name: 'motion', color: 'var(--accent)', home: [-0.06, 1.08] },
  { name: 'ship', color: 'var(--fg)', home: [1.06, 1.1] },
] as const
const START_STAGGER = 110
const MAX_MS = 1600

const POINTER = `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 2.5 16.5 9.6 10.3 11.2 7.8 17.2 3 2.5Z" fill="var(--c)" stroke="var(--bg)" stroke-width="1.2" stroke-linejoin="round"/></svg>`

type Target = { el: HTMLElement; x: number; y: number; ghost: HTMLDivElement }
type Agent = {
  node: HTMLDivElement
  tick: HTMLSpanElement
  color: string
  x: number
  y: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  t0: number
  dur: number
  target: Target | null
  readyAt: number
  built: number
}

const easeOut = (t: number) => 1 - (1 - t) ** 3

export default function Intro() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const host = root.current
    if (!html.classList.contains('preload') || !host) {
      window.dispatchEvent(new Event('intro:done'))
      return
    }

    const t0 = performance.now()
    let raf = 0
    let ended = false
    let started = false
    const timers: number[] = []
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))
    const agents: Agent[] = []
    const targets: Target[] = []
    const queue: Target[] = []

    // ---------- end states ----------
    const release = () => {
      if (ended) return
      ended = true
      cancelAnimationFrame(raf)
      try {
        sessionStorage.setItem('pre', '1')
      } catch {
        /* private mode */
      }
      html.classList.remove('preload')
      html.classList.add('built')
      host.hidden = true
      host.replaceChildren()
      window.dispatchEvent(new Event('intro:done'))
    }
    const leave = () => {
      host.classList.add('is-out')
      later(release, 260)
    }
    const finish = () => {
      // skip or timeout: everything appears at once, the cursors leave
      for (const t of targets) {
        if (t.el.dataset.built !== 'true') t.el.dataset.built = 'true'
        t.ghost.classList.add('is-done')
      }
      queue.length = 0
      leave()
    }

    // ---------- choreography ----------
    const arrive = (a: Agent, t: Target, now: number) => {
      t.el.style.setProperty('--flash', a.color)
      t.el.dataset.built = 'true'
      t.ghost.classList.add('is-done')
      a.node.classList.add('is-click')
      later(() => a.node.classList.remove('is-click'), 160)
      a.built++
      a.tick.classList.add('is-on')
      a.target = null
      a.readyAt = now + 40
    }
    const assign = (a: Agent, t: Target, now: number) => {
      a.target = t
      a.fromX = a.x
      a.fromY = a.y
      a.toX = t.x
      a.toY = t.y
      a.t0 = now
      const d = Math.hypot(t.x - a.x, t.y - a.y)
      a.dur = Math.min(460, Math.max(300, d * 0.42))
    }
    const frame = (now: number) => {
      if (ended) return
      let busy = false
      for (const a of agents) {
        if (!a.target && queue.length && now >= a.readyAt) assign(a, queue.shift()!, now)
        if (a.target) {
          busy = true
          const t = Math.min(1, (now - a.t0) / a.dur)
          const e = easeOut(t)
          a.x = a.fromX + (a.toX - a.fromX) * e
          a.y = a.fromY + (a.toY - a.fromY) * e
          a.node.style.transform = `translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`
          if (t >= 1) arrive(a, a.target, now)
        }
      }
      if (!busy && !queue.length) {
        const status = host.querySelector<HTMLElement>('.intro__status-text')
        if (status) status.textContent = `built in ${Math.round(performance.now() - t0)} ms`
        later(leave, 220)
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (started || ended) return
      started = true
      const vw = window.innerWidth
      const vh = window.innerHeight
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-build]'))
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.width < 8 || r.height < 4 || r.bottom < 0 || r.top > vh * 1.2) continue
        const ghost = document.createElement('div')
        ghost.className = 'intro__ghost'
        ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`
        host.appendChild(ghost)
        targets.push({ el, ghost, x: r.left + Math.min(r.width * 0.38, 180), y: r.top + r.height * 0.56 })
      }
      if (!targets.length) return finish()
      queue.push(...targets)

      const status = document.createElement('p')
      status.className = 'intro__status mono-sm'
      status.innerHTML = `<span class="intro__status-text">assembling</span>`
      AGENTS.forEach((def, i) => {
        const node = document.createElement('div')
        node.className = 'intro__cursor'
        node.style.setProperty('--c', def.color)
        node.innerHTML = `${POINTER}<span class="intro__tag mono-sm">${def.name}</span>`
        const x = def.home[0] * vw
        const y = def.home[1] * vh
        node.style.transform = `translate3d(${x}px,${y}px,0)`
        host.appendChild(node)
        const tick = document.createElement('span')
        tick.className = 'intro__agent'
        tick.style.setProperty('--c', def.color)
        tick.textContent = def.name
        status.appendChild(tick)
        agents.push({ node, tick, color: def.color, x, y, fromX: x, fromY: y, toX: x, toY: y, t0: 0, dur: 1, target: null, readyAt: performance.now() + i * START_STAGGER, built: 0 })
      })
      host.appendChild(status)
      raf = requestAnimationFrame(frame)
    }

    // measure once the display font is in (so the boxes match the final layout), but never wait long for it
    let fontsSettled = false
    const go = () => {
      if (fontsSettled) return
      fontsSettled = true
      start()
    }
    void document.fonts.ready.then(go, go)
    later(go, 350)

    const hard = window.setTimeout(finish, MAX_MS)
    const skip = () => finish()
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      clearTimeout(hard)
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      if (!ended) release()
    }
  }, [])

  return <div ref={root} className="intro" aria-hidden="true" />
}
