import { mulberry32 } from './rng'
import type { Shape, ShapeCtx } from './types'

/** Area -> Stop 1..4 -> Home, in unit coordinates (-1..1). */
export const ROUTE_NODES: [number, number][] = [
  [-0.88, -0.55],
  [-0.5, 0.3],
  [-0.08, -0.4],
  [0.3, 0.38],
  [0.62, -0.28],
  [0.9, 0.5],
]

function catmull(p: [number, number][], t: number): [number, number] {
  const seg = p.length - 1
  const f = Math.min(t * seg, seg - 1e-6)
  const i = Math.floor(f)
  const u = f - i
  const p0 = p[Math.max(i - 1, 0)]
  const p1 = p[i]
  const p2 = p[i + 1]
  const p3 = p[Math.min(i + 2, p.length - 1)]
  const c = (a: number, b: number, c2: number, d: number) =>
    0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u)
  return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]
}

/** SVG path (in a w x h box, y down) of the same curve, for the standalone case-study visual. */
export function routePath(w: number, h: number, steps = 60): string {
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const [x, y] = catmull(ROUTE_NODES, i / steps)
    d += `${i ? 'L' : 'M'}${((x * 0.5 + 0.5) * w).toFixed(1)} ${((0.5 - y * 0.5) * h).toFixed(1)}`
  }
  return d
}

/** Position of node `i` as t along the curve (nodes are evenly spaced in parameter space). */
export const nodeT = (i: number) => i / (ROUTE_NODES.length - 1)

/**
 * Smooth polyline through the stops. attr: 0..1 = t along the route (the rider pulse follows uLocal),
 * 2 + t = a node cluster (lights once the rider has passed it).
 */
export function routeShape({ n, box, seed = 17 }: ShapeCtx): Shape {
  const rnd = mulberry32(seed)
  const hw = box.w / 2
  const hh = box.h / 2
  const to = (u: [number, number]): [number, number] => [box.cx + u[0] * hw, box.cy + u[1] * hh]
  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  const nNode = Math.floor(n * 0.1)
  const nLine = n - nNode
  let k = 0
  for (; k < nLine; k++) {
    const t = rnd()
    const [x, y] = to(catmull(ROUTE_NODES, t))
    pos[k * 3] = x + (rnd() - 0.5) * 3
    pos[k * 3 + 1] = y + (rnd() - 0.5) * 3
    pos[k * 3 + 2] = (rnd() - 0.5) * 6
    attr[k] = t
  }
  const rad = Math.min(box.w, box.h) * 0.036
  for (let i = 0; k < n; k++, i++) {
    const ni = i % ROUTE_NODES.length
    const [cx, cy] = to(ROUTE_NODES[ni])
    const home = ni === ROUTE_NODES.length - 1
    const th = rnd() * Math.PI * 2
    // stops are discs; home is a ring so it reads as a destination
    const rr = home ? rad * 1.5 * (0.82 + rnd() * 0.18) : rad * Math.sqrt(rnd())
    pos[k * 3] = cx + Math.cos(th) * rr
    pos[k * 3 + 1] = cy + Math.sin(th) * rr
    pos[k * 3 + 2] = (rnd() - 0.5) * 6
    attr[k] = 2 + nodeT(ni)
  }
  return { pos, attr }
}
