/** Shapes live in screen pixels, origin at the viewport centre, y up. */
export type Box = { cx: number; cy: number; w: number; h: number }

export type Shape = {
  /** n * 3 floats (x, y, z) */
  pos: Float32Array
  /** n floats. Meaning depends on the shape, see shaders.ts accentFor() */
  attr: Float32Array
}

export type ShapeCtx = {
  n: number
  box: Box
  vw: number
  vh: number
  seed?: number
}

/** Shape ids are the index in this list; the shaders branch on them. The override text is one past the end. */
export const SCENES = ['hero', 'graph', 'ledger', 'clock', 'route', 'field', 'pin'] as const
export type SceneKey = (typeof SCENES)[number]
export const sceneId = (k: SceneKey) => SCENES.indexOf(k)
