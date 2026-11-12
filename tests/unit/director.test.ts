import { beforeEach, describe, expect, it } from 'vitest'
import { chapterLocal } from '@/lib/chapter'
import { director, OVERRIDE_SHAPE } from '@/gl/director'
import { sceneId } from '@/gl/shapes'

const VH = 900
const HERO = sceneId('hero')
const GRAPH = sceneId('graph')
const FIELD = sceneId('field')
const PIN = sceneId('pin')

// the home page: hero, the work grid (graph), the long field zone, then the pin (contact)
const HOME = [
  { scene: HERO, top: 0, bottom: 900 },
  { scene: GRAPH, top: 2400, bottom: 4600 },
  { scene: FIELD, top: 4600, bottom: 16000 },
  { scene: PIN, top: 16000, bottom: 17000 },
]

const at = (y: number) => {
  director.s = 0
  // first update snaps to the target (no damping), which is what we want to read
  ;(director as unknown as { first: boolean }).first = true
  return director.update(0.016, y, VH)
}

describe('scene director', () => {
  beforeEach(() => {
    director.anchors = HOME
    director.override = null
  })

  it('shows the hero at the top and the pin at the end', () => {
    expect(at(0).shapeA).toBe(HERO)
    expect(at(0).progress).toBe(0)
    const end = at(16200)
    expect(end.shapeB).toBe(PIN)
    expect(end.progress).toBeCloseTo(1, 1)
  })

  it('is inside an anchor when the reading line (viewport centre) is in it', () => {
    expect(at(2400 + 800).shapeA).toBe(GRAPH)
    expect(at(2400 + 800).progress).toBe(0)
    expect(at(9000).shapeA).toBe(FIELD)
  })

  it('is scrubbed: the coordinate rises with scroll and falls again when you scroll back', () => {
    const ys = [0, 600, 1200, 1800, 2200, 2600, 3200]
    const up = ys.map((y) => {
      at(y)
      return director.s
    })
    for (let i = 1; i < up.length; i++) expect(up[i]).toBeGreaterThanOrEqual(up[i - 1] - 1e-9)
    const down = [...ys].reverse().map((y) => {
      at(y)
      return director.s
    })
    expect(down.reverse()).toEqual(up)
  })

  it('morphs between neighbouring anchors only, never through the shapes between their ids', () => {
    // graph (1) -> field (5): the chapter shapes (ledger, clock, route) must never be bound on this page
    const chapters = [sceneId('ledger'), sceneId('clock'), sceneId('route')]
    for (let y = 0; y < 17000; y += 50) {
      const f = at(y)
      expect(chapters).not.toContain(f.shapeA)
      expect(chapters).not.toContain(f.shapeB)
      expect(f.progress).toBeGreaterThanOrEqual(0)
      expect(f.progress).toBeLessThanOrEqual(1)
    }
    // in the gap between the work grid and the field zone the pair is graph/field
    for (let y = 3850; y < 4450; y += 50) {
      const f = at(y)
      expect(f.shapeA).toBe(GRAPH)
      expect(f.shapeB).toBe(FIELD)
    }
    // and across the hero -> graph gap the pair is hero/graph
    for (let y = 0; y < 1500; y += 50) {
      const f = at(y)
      expect(f.shapeA).toBe(HERO)
      expect(f.shapeB).toBe(GRAPH)
    }
  })

  it('without anchors (404, work index) the field is shown', () => {
    director.anchors = []
    const f = at(500)
    expect(f.shapeA).toBe(FIELD)
    expect(f.shapeB).toBe(FIELD)
    expect(f.progress).toBe(0)
  })

  it('a single anchor (case study) shows that scene steadily', () => {
    director.anchors = [{ scene: sceneId('ledger'), top: 0, bottom: 3000 }]
    for (const y of [0, 800, 2500]) {
      const f = at(y)
      expect(f.shapeA).toBe(sceneId('ledger'))
      expect(f.progress).toBe(0)
    }
  })

  it('an override (404 / HIRE?) swaps shape B for the override text and then releases', () => {
    director.setOverride({ text: '404', mode: 'fail' })
    director.s = 2
    ;(director as unknown as { first: boolean }).first = false
    const f = director.update(0.5, 9000, VH)
    expect(f.shapeB).toBe(OVERRIDE_SHAPE)
    expect(f.shapeA).toBe(FIELD)
    expect(f.active).toBe(true)
    director.setOverride(null)
    for (let i = 0; i < 400; i++) director.update(0.05, 9000, VH)
    expect(director.override).toBeNull()
  })

  it('currentScene (static fallback) returns scene ids, not anchor positions', () => {
    expect(director.currentScene(0, VH)).toBe(HERO)
    expect(director.currentScene(9000, VH)).toBe(FIELD)
    expect(director.currentScene(16500, VH)).toBe(PIN)
  })

  it('chapter progress ramps 0 -> 1 across a chapter and clamps', () => {
    expect(chapterLocal(0, 1000, 2000)).toBe(0)
    expect(chapterLocal(1000 + 2000 * 0.475, 1000, 2000)).toBeCloseTo(0.5, 5)
    expect(chapterLocal(99999, 1000, 2000)).toBe(1)
  })
})
