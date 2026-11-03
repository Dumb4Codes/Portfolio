import { clockShape } from './clock'
import { fieldShape } from './field'
import { ledgerShape } from './ledger'
import { pinShape } from './pin'
import { routeShape } from './route'
import type { Box, SceneKey, Shape, ShapeCtx } from './types'

export * from './types'
export { textShape } from './text'
export { pointsFromMask } from './mask'
export { ledgerShape, clockShape, routeShape, fieldShape, pinShape }

export const MOBILE_BREAKPOINT = 768
/** Below this the chapters stack (no right-hand column), so shapes sit centred behind the text. */
export const STACK_BREAKPOINT = 1024

/** Where each shape sits on screen: right-hand 7 columns on desktop, centred behind the text on mobile. */
export function sceneBox(key: SceneKey, vw: number, vh: number): Box {
  const mobile = vw < STACK_BREAKPOINT
  if (key === 'field' || key === 'hero') return { cx: 0, cy: 0, w: vw, h: vh }
  if (mobile) {
    const s = Math.min(vw * 0.94, vh * 0.58)
    const cy = key === 'pin' ? vh * 0.02 : vh * 0.1
    if (key === 'route') return { cx: 0, cy, w: vw * 0.92, h: Math.min(vh * 0.4, vw * 1.1) }
    if (key === 'ledger') return { cx: 0, cy, w: vw * 0.9, h: s }
    return { cx: 0, cy, w: s, h: s }
  }
  const cx = vw * 0.22
  const w = Math.min(vw * 0.44, 760)
  if (key === 'ledger') return { cx, cy: 0, w: Math.min(w, 620), h: Math.min(vh * 0.72, 700) }
  if (key === 'route') return { cx, cy: 0, w, h: Math.min(vh * 0.5, w * 0.7) }
  const s = Math.min(w, vh * 0.74)
  return { cx, cy: 0, w: s, h: s }
}

const GENERATORS: Record<Exclude<SceneKey, 'hero'>, (c: ShapeCtx) => Shape> = {
  ledger: ledgerShape,
  clock: clockShape,
  route: routeShape,
  field: fieldShape,
  pin: pinShape,
}

export function generateScene(key: Exclude<SceneKey, 'hero'>, n: number, vw: number, vh: number): Shape {
  return GENERATORS[key]({ n, vw, vh, box: sceneBox(key, vw, vh) })
}
