import { mulberry32 } from './rng'
import type { Shape, ShapeCtx } from './types'

/** A wide, shallow, softly undulating volume of points. attr is unused. */
export function fieldShape({ n, vw, vh, seed = 19 }: ShapeCtx): Shape {
  const rnd = mulberry32(seed)
  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  for (let k = 0; k < n; k++) {
    const x = (rnd() - 0.5) * vw * 1.15
    const band = (rnd() + rnd() + rnd()) / 3 - 0.5 // bell-shaped so the middle is denser
    const wave = Math.sin(x * 0.006 + rnd() * 0.6) * vh * 0.08 + Math.sin(x * 0.0021) * vh * 0.06
    pos[k * 3] = x
    pos[k * 3 + 1] = wave + band * vh * 0.85
    pos[k * 3 + 2] = (rnd() - 0.5) * 360
  }
  return { pos, attr }
}
