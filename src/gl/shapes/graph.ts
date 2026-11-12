import { mulberry32 } from './rng'
import type { Shape, ShapeCtx } from './types'

/**
 * A loose network: nodes scattered over the box, each joined to its two nearest neighbours by a
 * dotted edge, with a few larger "hub" nodes. Behind the work grid it reads as a system of parts that
 * connect, which is what a full-stack portfolio is.
 *
 * attr: edges carry t (0..1 along the edge) so a pulse can travel with uLocal; nodes are 2 (normal)
 * or 3 (hub, lit in accent).
 */
export const GRAPH_NODES = 72
export const GRAPH_HUBS = 7

export function graphShape({ n, box, seed = 23 }: ShapeCtx): Shape {
  const rnd = mulberry32(seed)
  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)

  // nodes on a jittered grid so they spread evenly without clumping
  const cols = Math.max(4, Math.round(Math.sqrt(GRAPH_NODES * (box.w / Math.max(box.h, 1)))))
  const rows = Math.max(3, Math.ceil(GRAPH_NODES / cols))
  const cw = box.w / cols
  const rh = box.h / rows
  const nodes: { x: number; y: number; hub: boolean }[] = []
  for (let r = 0; r < rows && nodes.length < GRAPH_NODES; r++) {
    for (let c = 0; c < cols && nodes.length < GRAPH_NODES; c++) {
      nodes.push({
        x: box.cx - box.w / 2 + cw * (c + 0.2 + rnd() * 0.6),
        y: box.cy - box.h / 2 + rh * (r + 0.2 + rnd() * 0.6),
        hub: false,
      })
    }
  }
  for (let i = 0; i < GRAPH_HUBS; i++) nodes[Math.floor(rnd() * nodes.length)].hub = true

  // edges: two nearest neighbours each, de-duplicated
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)
  const seen = new Set<string>()
  const edges: [number, number][] = []
  nodes.forEach((p, i) => {
    const near = nodes
      .map((q, j) => ({ j, d: j === i ? Infinity : Math.hypot(q.x - p.x, q.y - p.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    for (const { j } of near) {
      const k = key(i, j)
      if (seen.has(k)) continue
      seen.add(k)
      edges.push([i, j])
    }
  })

  const nNode = Math.floor(n * 0.22)
  const nEdge = n - nNode
  const totalLen = edges.reduce((s, [a, b]) => s + Math.hypot(nodes[b].x - nodes[a].x, nodes[b].y - nodes[a].y), 0)
  const dotGap = 11 // px between dots so an edge reads as a dotted line, not a solid one

  let k = 0
  for (const [a, b] of edges) {
    const A = nodes[a]
    const B = nodes[b]
    const len = Math.hypot(B.x - A.x, B.y - A.y)
    const cnt = Math.round((len / totalLen) * nEdge)
    const dots = Math.max(2, Math.floor(len / dotGap))
    for (let i = 0; i < cnt && k < nEdge; i++, k++) {
      const t = (Math.floor(rnd() * dots) + 0.5) / dots
      pos[k * 3] = A.x + (B.x - A.x) * t + (rnd() - 0.5) * 1.6
      pos[k * 3 + 1] = A.y + (B.y - A.y) * t + (rnd() - 0.5) * 1.6
      pos[k * 3 + 2] = (rnd() - 0.5) * 10
      attr[k] = t
    }
  }
  while (k < nEdge) {
    const [a, b] = edges[Math.floor(rnd() * edges.length)]
    const t = rnd()
    pos[k * 3] = nodes[a].x + (nodes[b].x - nodes[a].x) * t
    pos[k * 3 + 1] = nodes[a].y + (nodes[b].y - nodes[a].y) * t
    pos[k * 3 + 2] = (rnd() - 0.5) * 10
    attr[k++] = t
  }

  const base = Math.min(box.w, box.h) * 0.0075
  for (let i = 0; k < n; k++, i++) {
    const nd = nodes[i % nodes.length]
    const r = (nd.hub ? base * 1.9 : base) * Math.sqrt(rnd())
    const th = rnd() * Math.PI * 2
    pos[k * 3] = nd.x + Math.cos(th) * r
    pos[k * 3 + 1] = nd.y + Math.sin(th) * r
    pos[k * 3 + 2] = (rnd() - 0.5) * 10
    attr[k] = nd.hub ? 3 : 2
  }
  return { pos, attr }
}
