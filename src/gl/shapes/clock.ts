import { mulberry32 } from './rng'
import type { Shape, ShapeCtx } from './types'

/** Shift arcs as [startHour, endHour]. The third one crosses midnight (16:30 to 02:30). */
export const SHIFTS: [number, number][] = [
  [7, 17],
  [9, 18.5],
  [16.5, 26.5],
]
export const CLOCK_RADII = [0.8, 0.68, 0.56]

const angle = (h: number) => (h / 24) * Math.PI * 2 // 0 at top, clockwise

/**
 * 24h ring, ticks and three shift arcs. attr: 0 ring/ticks, 0.2 day arcs,
 * 0.5..1 along the overnight arc (shader sweeps it with uLocal).
 */
export function clockShape({ n, box, seed = 13 }: ShapeCtx): Shape {
  const rnd = mulberry32(seed)
  const R = (Math.min(box.w, box.h) / 2) * 0.96
  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  const put = (k: number, th: number, r: number, a: number, jit = 1.4) => {
    pos[k * 3] = box.cx + Math.sin(th) * r + (rnd() - 0.5) * jit
    pos[k * 3 + 1] = box.cy + Math.cos(th) * r + (rnd() - 0.5) * jit
    pos[k * 3 + 2] = (rnd() - 0.5) * 8
    attr[k] = a
  }
  const nRing = Math.floor(n * 0.22)
  const nTicks = Math.floor(n * 0.12)
  const nHub = 0
  const nArcs = n - nRing - nTicks - nHub
  let k = 0
  for (let i = 0; i < nRing; i++, k++) put(k, rnd() * Math.PI * 2, R, 0)
  for (let i = 0; i < nTicks; i++, k++) {
    const hour = Math.floor(rnd() * 24)
    const len = hour % 6 === 0 ? R * 0.1 : R * 0.045
    put(k, angle(hour) + (rnd() - 0.5) * 0.004, R - rnd() * len, 0, 0.8)
  }
  const lens = SHIFTS.map(([a, b]) => b - a)
  const lenSum = lens.reduce((s, v) => s + v, 0)
  SHIFTS.forEach(([a, b], si) => {
    const cnt = si === SHIFTS.length - 1 ? n - nHub - k : Math.round((lens[si] / lenSum) * nArcs)
    for (let i = 0; i < cnt && k < n - nHub; i++, k++) {
      const t = rnd()
      const r = R * CLOCK_RADII[si] + (rnd() - 0.5) * R * 0.05
      put(k, angle(a + (b - a) * t), r, si === 2 ? 0.5 + 0.5 * t : 0.2, 0.8)
    }
  })
  for (; k < n; k++) put(k, rnd() * Math.PI * 2, rnd() * R * 0.05, 0.2)
  return { pos, attr }
}
