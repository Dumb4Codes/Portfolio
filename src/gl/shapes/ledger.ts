import { mulberry32 } from './rng'
import type { Shape, ShapeCtx } from './types'

export const LEDGER_ROWS = 14
const COLS = [0.1, 0.32, 0.14, 0.16, 0.12, 0.16]

/**
 * Six columns by N rows of short dashes plus hairlines between rows.
 * attr = row index 0..1; the shader lights rows up to uLocal in accent.
 */
export function ledgerShape({ n, box, seed = 11 }: ShapeCtx): Shape {
  const rnd = mulberry32(seed)
  const rows = LEDGER_ROWS
  const rowH = box.h / rows
  const gap = box.w * 0.018
  const usable = box.w - gap * (COLS.length - 1)

  type Seg = { x0: number; x1: number; y: number; row: number; weight: number }
  const segs: Seg[] = []
  for (let r = 0; r < rows; r++) {
    let x = box.cx - box.w / 2
    const y = box.cy + box.h / 2 - rowH * (r + 0.5)
    COLS.forEach((c, ci) => {
      const cw = usable * c
      const len = cw * (ci === 0 ? 0.7 : 0.45 + rnd() * 0.55)
      const off = ci >= 2 ? cw - len : 0 // numeric columns hug the right edge
      segs.push({ x0: x + off, x1: x + off + len, y, row: r, weight: len })
      x += cw + gap
    })
  }
  const total = segs.reduce((s, g) => s + g.weight, 0)
  const nLines = Math.floor(n * 0.14)
  const nDash = n - nLines

  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  let k = 0
  for (const g of segs) {
    const cnt = Math.round((g.weight / total) * nDash)
    for (let i = 0; i < cnt && k < nDash; i++, k++) {
      pos[k * 3] = g.x0 + rnd() * (g.x1 - g.x0)
      pos[k * 3 + 1] = g.y + (rnd() - 0.5) * Math.min(3.2, rowH * 0.18)
      pos[k * 3 + 2] = (rnd() - 0.5) * 6
      attr[k] = g.row / (rows - 1)
    }
  }
  while (k < nDash) {
    const g = segs[Math.floor(rnd() * segs.length)]
    pos[k * 3] = g.x0 + rnd() * (g.x1 - g.x0)
    pos[k * 3 + 1] = g.y + (rnd() - 0.5) * 3
    attr[k++] = g.row / (rows - 1)
  }
  // hairlines under every row
  for (; k < n; k++) {
    const r = Math.floor(rnd() * rows)
    pos[k * 3] = box.cx - box.w / 2 + rnd() * box.w
    pos[k * 3 + 1] = box.cy + box.h / 2 - rowH * (r + 1)
    pos[k * 3 + 2] = (rnd() - 0.5) * 4
    attr[k] = r / (rows - 1)
  }
  return { pos, attr }
}
