import { beforeEach, describe, expect, it } from 'vitest'
import { chapterLocal } from '@/lib/chapter'
import { director } from '@/gl/director'

const VH = 900
// hero, ledger, clock, route, then the long "field" zone, then the pin (contact)
const ANCHORS = [
  { scene: 0, top: 0, bottom: 900 },
  { scene: 1, top: 2400, bottom: 4600 },
  { scene: 2, top: 4600, bottom: 6800 },
  { scene: 3, top: 6800, bottom: 9000 },
  { scene: 4, top: 9000, bottom: 16000 },
  { scene: 5, top: 16000, bottom: 17000 },
]

const at = (y: number) => {
  director.s = 0
  // first update snaps to the target (no damping), which is what we want to read
  ;(director as unknown as { first: boolean }).first = true
  return director.update(0.016, y, VH)
}

describe('scene director', () => {
  beforeEach(() => {
    director.anchors = ANCHORS
    director.override = null
  })

  it('shows the hero at the top and the pin at the end', () => {
    expect(at(0).shapeA).toBe(0)
    expect(at(0).progress).toBe(0)
    const end = at(16200)
    expect(end.shapeA + end.progress).toBeCloseTo(5, 1)
  })

  it('is inside a chapter when the reading line (viewport centre) is in it', () => {
    expect(at(4600 - 450 + 600).shapeA).toBe(2) // mid clock chapter
    expect(at(2400 + 800).shapeA).toBe(1)
    expect(at(6800 + 800).shapeA).toBe(3)
  })

  it('is scrubbed: the coordinate rises with scroll and falls again when you scroll back', () => {
    const ys = [0, 600, 1200, 1800, 2200, 2600, 3200]
    const up = ys.map((y) => {
      const f = at(y)
      return f.shapeA + f.progress
    })
    for (let i = 1; i < up.length; i++) expect(up[i]).toBeGreaterThanOrEqual(up[i - 1] - 1e-9)
    const down = [...ys].reverse().map((y) => {
      const f = at(y)
      return f.shapeA + f.progress
    })
    expect(down.reverse()).toEqual(up)
  })

  it('transitions hero -> ledger across the gap, never skipping a shape', () => {
    for (let y = 0; y < 3000; y += 50) {
      const f = at(y)
      expect(f.shapeB - f.shapeA).toBe(1)
      expect(f.progress).toBeGreaterThanOrEqual(0)
      expect(f.progress).toBeLessThanOrEqual(1)
    }
  })

  it('without anchors (case study) the field is shown', () => {
    director.anchors = []
    expect(at(500).shapeA + at(500).progress).toBeCloseTo(4, 5)
  })

  it('an override (404 / HIRE?) swaps shape B for the override text and then releases', () => {
    director.setOverride({ text: '404', mode: 'fail' })
    director.s = 4
    ;(director as unknown as { first: boolean }).first = false
    const f = director.update(0.5, 0, VH)
    expect(f.shapeB).toBe(6)
    expect(f.active).toBe(true)
    director.setOverride(null)
    for (let i = 0; i < 400; i++) director.update(0.05, 0, VH)
    expect(director.override).toBeNull()
  })

  it('chapter progress ramps 0 -> 1 across a chapter and clamps', () => {
    expect(chapterLocal(0, 1000, 2000)).toBe(0)
    expect(chapterLocal(1000 + 2000 * 0.475, 1000, 2000)).toBeCloseTo(0.5, 5)
    expect(chapterLocal(99999, 1000, 2000)).toBe(1)
  })
})
