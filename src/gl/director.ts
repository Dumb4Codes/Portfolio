import { chapterLocal } from '@/lib/chapter'
import { SCENES } from './shapes/types'

/**
 * Scene director: maps scroll position to a continuous scene coordinate `s` (0..5) so the particle
 * morph is scrubbed by scroll and reverses when you scroll back. Sections mark themselves with
 * `data-scene="<key>"`. A damped copy of `s` drives the shader so motion stays fluid.
 */

export const OVERRIDE_SHAPE = 6

export type Anchor = { scene: number; top: number; bottom: number }

export type FrameState = {
  shapeA: number
  shapeB: number
  progress: number
  localA: number
  localB: number
  heroShift: number
  vel: number
  scatter: number
  /** true while anything is still moving */
  active: boolean
}

type Override = { text: string; mode: 'form' | 'fail' }

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

class Director {
  anchors: Anchor[] = []
  /** shown when the page has no anchors (case studies, 404) */
  defaultScene = 4
  s = 0
  private first = true
  private vel = 0
  private lastY = 0
  override: Override | null = null
  private oT = 0
  private oTarget = 0
  private scatter = 0
  private scatterTarget = 0
  overrideVersion = 0

  /** Reads `[data-scene]` elements into document coordinates. Call on layout changes. */
  measure() {
    const y = window.scrollY
    const list: Anchor[] = []
    document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
      const scene = SCENES.indexOf(el.dataset.scene as (typeof SCENES)[number])
      if (scene < 0) return
      const r = el.getBoundingClientRect()
      list.push({ scene, top: r.top + y, bottom: r.bottom + y })
    })
    this.anchors = list.sort((a, b) => a.top - b.top)
    const def = document.querySelector<HTMLElement>('[data-scene-default]')?.dataset.sceneDefault
    this.defaultScene = def ? Math.max(0, SCENES.indexOf(def as (typeof SCENES)[number])) : 4
  }

  setOverride(o: Override | null) {
    if (o) {
      this.override = o
      this.oTarget = 1
      this.scatterTarget = o.mode === 'fail' ? 0 : 0
      this.overrideVersion++
    } else {
      this.oTarget = 0
      this.scatterTarget = 0
    }
  }
  /** 404: after the word has (almost) formed, blow it apart. */
  scatterNow(on: boolean) {
    this.scatterTarget = on ? 1 : 0
  }

  private targetFor(y: number, vh: number): number {
    const a = this.anchors
    if (!a.length) return this.defaultScene
    const c = y + vh * 0.5
    const band = vh * 0.4
    for (let i = 0; i < a.length - 1; i++) {
      const m = (a[i].bottom + a[i + 1].top) / 2
      if (c <= m - band) return a[i].scene
      if (c < m + band) {
        const f = smooth(clamp((c - (m - band)) / (2 * band)))
        return a[i].scene + (a[i + 1].scene - a[i].scene) * f
      }
    }
    return a[a.length - 1].scene
  }

  /** Nearest whole scene at a scroll position (used by the static fallback). */
  currentScene(y: number, vh: number): number {
    return Math.round(this.targetFor(y, vh))
  }

  private localOf(scene: number, y: number, vh: number): number {
    const c = y + vh * 0.5
    const mine = this.anchors.filter((x) => x.scene === scene)
    if (!mine.length) return 0
    const hit = mine.find((x) => c >= x.top && c <= x.bottom) ?? mine.reduce((p, q) => (Math.abs(c - (q.top + q.bottom) / 2) < Math.abs(c - (p.top + p.bottom) / 2) ? q : p))
    return chapterLocal(c, hit.top, hit.bottom - hit.top)
  }

  update(dt: number, y: number, vh: number): FrameState {
    const target = this.targetFor(y, vh)
    if (this.first) {
      this.s = target
      this.first = false
    }
    const k = 1 - Math.exp(-dt * 4.2)
    this.s += (target - this.s) * k
    const sDiff = Math.abs(target - this.s)
    if (sDiff < 0.0006) this.s = target

    const rawVel = dt > 0 ? (y - this.lastY) / dt / 2600 : 0
    this.lastY = y
    this.vel += (clamp(rawVel, -1, 1) - this.vel) * 0.15
    if (Math.abs(this.vel) < 0.002) this.vel = 0

    this.oT += (this.oTarget - this.oT) * (1 - Math.exp(-dt * 3.2))
    if (Math.abs(this.oTarget - this.oT) < 0.002) this.oT = this.oTarget
    if (this.override && this.oTarget === 0 && this.oT === 0) this.override = null
    this.scatter += (this.scatterTarget - this.scatter) * (1 - Math.exp(-dt * 2.5))
    if (Math.abs(this.scatterTarget - this.scatter) < 0.002) this.scatter = this.scatterTarget

    const base = Math.round(clamp(this.s, 0, 5))
    let from = Math.min(Math.floor(this.s), 4)
    let progress = this.s - from
    let shapeA = from
    let shapeB = from + 1
    let localA: number
    let localB = 0

    if (this.override) {
      shapeA = base
      shapeB = OVERRIDE_SHAPE
      progress = this.oT
      localA = this.localOf(base, y, vh)
    } else {
      localA = progress < 0.002 ? this.localOf(from, y, vh) : 1
      if (progress > 0.998) {
        from = Math.min(Math.round(this.s), 5)
        localB = this.localOf(Math.min(from, 5), y, vh)
      }
    }

    const active =
      sDiff > 0.0006 ||
      Math.abs(this.vel) > 0.002 ||
      Math.abs(this.oTarget - this.oT) > 0.002 ||
      Math.abs(this.scatterTarget - this.scatter) > 0.002 ||
      Boolean(this.override)

    return {
      shapeA,
      shapeB,
      progress: clamp(progress),
      localA,
      localB,
      heroShift: y,
      vel: this.vel,
      scatter: this.scatter,
      active,
    }
  }
}

export const director = new Director()
