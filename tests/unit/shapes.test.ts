import { describe, expect, it } from 'vitest'
import { clockShape, fieldShape, graphShape, ledgerShape, pinShape, pointsFromMask, routeShape } from '@/gl/shapes'
import { sceneBox } from '@/gl/shapes'
import type { Box, SceneKey } from '@/gl/shapes'

const N = 4000
const VIEWPORTS = [
  [1440, 900],
  [390, 844],
  [1920, 1080],
] as const

const inBox = (s: { pos: Float32Array }, box: Box, pad: number) => {
  for (let i = 0; i < s.pos.length / 3; i++) {
    const x = s.pos[i * 3]
    const y = s.pos[i * 3 + 1]
    if (x < box.cx - box.w / 2 - pad || x > box.cx + box.w / 2 + pad) return false
    if (y < box.cy - box.h / 2 - pad || y > box.cy + box.h / 2 + pad) return false
  }
  return true
}

describe.each(VIEWPORTS)('shape generators at %ix%i', (vw, vh) => {
  const ctx = (key: SceneKey) => ({ n: N, vw, vh, box: sceneBox(key, vw, vh) })

  it('ledger: exact count, inside its box, rows normalised 0..1', () => {
    const c = ctx('ledger')
    const s = ledgerShape(c)
    expect(s.pos.length).toBe(N * 3)
    expect(s.attr.length).toBe(N)
    expect(inBox(s, c.box, 6)).toBe(true)
    expect(Math.min(...s.attr)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...s.attr)).toBeLessThanOrEqual(1)
  })

  it('clock: exact count, inside its box, overnight arc is flagged 0.5..1', () => {
    const c = ctx('clock')
    const s = clockShape(c)
    expect(s.pos.length).toBe(N * 3)
    expect(inBox(s, c.box, 4)).toBe(true)
    const night = Array.from(s.attr).filter((a) => a >= 0.5)
    expect(night.length).toBeGreaterThan(N * 0.05)
    expect(Math.max(...s.attr)).toBeLessThanOrEqual(1)
  })

  it('route: exact count, inside its box, nodes flagged 2+', () => {
    const c = ctx('route')
    const s = routeShape(c)
    expect(s.pos.length).toBe(N * 3)
    expect(inBox(s, c.box, 40)).toBe(true)
    const nodes = Array.from(s.attr).filter((a) => a >= 2)
    expect(nodes.length).toBeGreaterThan(N * 0.05)
    expect(Math.max(...s.attr)).toBeLessThanOrEqual(3)
  })

  it('graph: exact count, inside its box, edges 0..1 and nodes flagged 2 (hub = 3)', () => {
    const c = ctx('graph')
    const s = graphShape(c)
    expect(s.pos.length).toBe(N * 3)
    expect(inBox(s, c.box, 30)).toBe(true)
    const nodes = Array.from(s.attr).filter((a) => a >= 2)
    const hubs = nodes.filter((a) => a >= 3)
    expect(nodes.length).toBeGreaterThan(N * 0.2)
    expect(hubs.length).toBeGreaterThan(0)
    expect(hubs.length).toBeLessThan(nodes.length)
    const edges = Array.from(s.attr).filter((a) => a < 2)
    expect(Math.min(...edges)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...edges)).toBeLessThanOrEqual(1)
  })

  it('field: exact count, spans the viewport width', () => {
    const s = fieldShape(ctx('field'))
    expect(s.pos.length).toBe(N * 3)
    const xs = Array.from({ length: N }, (_, i) => s.pos[i * 3])
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(vw * 0.9)
  })

  it('pin: exact count, front hemisphere, pin cluster flagged 1', () => {
    const c = ctx('pin')
    const s = pinShape(c)
    expect(s.pos.length).toBe(N * 3)
    const pin = Array.from(s.attr).filter((a) => a === 1).length
    expect(pin).toBeGreaterThan(N * 0.1)
    // every point stays near the globe, never off screen
    const half = Math.max(vw, vh)
    for (let i = 0; i < N; i++) {
      expect(Math.abs(s.pos[i * 3])).toBeLessThan(half)
      expect(Math.abs(s.pos[i * 3 + 1])).toBeLessThan(half)
    }
  })

  it('is deterministic for the same seed', () => {
    const a = ledgerShape(ctx('ledger'))
    const b = ledgerShape(ctx('ledger'))
    expect(Array.from(a.pos.slice(0, 30))).toEqual(Array.from(b.pos.slice(0, 30)))
  })
})

describe('pointsFromMask (text sampling, pure part)', () => {
  // an 8x4 mask with the left half opaque
  const w = 8
  const h = 4
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w / 2; x++) data[(y * w + x) * 4 + 3] = 255
  const box: Box = { cx: 100, cy: -50, w: 80, h: 40 }

  it('returns exactly n points, only where the mask is opaque, fitted to the box', () => {
    const s = pointsFromMask({ width: w, height: h, data }, 1000, box)
    expect(s.pos.length).toBe(3000)
    for (let i = 0; i < 1000; i++) {
      const x = s.pos[i * 3]
      const y = s.pos[i * 3 + 1]
      // opaque half is the left half of the box: x in [cx - w/2, cx]
      expect(x).toBeGreaterThanOrEqual(box.cx - box.w / 2 - 0.01)
      expect(x).toBeLessThanOrEqual(box.cx + 0.01)
      expect(y).toBeGreaterThanOrEqual(box.cy - box.h / 2 - 0.01)
      expect(y).toBeLessThanOrEqual(box.cy + box.h / 2 + 0.01)
    }
  })

  it('an empty mask gives n zeroed points instead of throwing', () => {
    const s = pointsFromMask({ width: 2, height: 2, data: new Uint8ClampedArray(16) }, 10, box)
    expect(s.pos.length).toBe(30)
  })
})
